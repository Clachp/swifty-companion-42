import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useProfile } from '@/src/contexts/ProfileContext';
import Api42Service from '@/src/services/Api42Service';
import { User42 } from '@/src/types/api.types';

export default function ProfileScreen() {
  const { profile } = useLocalSearchParams<{ profile: string }>();
  const { getCachedProfile } = useProfile();
  const [user, setUser] = useState<User42 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCursusId, setSelectedCursusId] = useState<number | null>(null);
  const [showCursusMenu, setShowCursusMenu] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profile) return;

      const cachedUser = getCachedProfile(profile);
      if (cachedUser) {
        setUser(cachedUser);
        const defaultCursus = cachedUser.cursus_users.find(cu => cu.cursus.slug === '42cursus') || cachedUser.cursus_users[0];
        if (defaultCursus) {
          setSelectedCursusId(defaultCursus.cursus_id);
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const userData = await Api42Service.getUserByLogin(profile);
        setUser(userData);
        const defaultCursus = userData.cursus_users.find(cu => cu.cursus.slug === '42cursus') || userData.cursus_users[0];
        if (defaultCursus) {
          setSelectedCursusId(defaultCursus.cursus_id);
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profile, getCachedProfile]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Profile' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#61dafb" />
        </View>
      </>
    );
  }

  if (error || !user) {
    return (
      <>
        <Stack.Screen options={{ title: 'Profile' }} />
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
        </View>
      </>
    );
  }

  const selectedCursus = user.cursus_users.find(cu => cu.cursus_id === selectedCursusId);

  return (
    <>
      <Stack.Screen options={{ title: user.login }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Image
            source={{ uri: user.image.versions.large }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.usual_full_name}</Text>
          <Text style={styles.login}>@{user.login}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {selectedCursus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="school" size={20} color="#61dafb" /> Cursus Progress
            </Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Cursus:</Text>
                <TouchableOpacity
                  style={styles.cursusSelector}
                  onPress={() => setShowCursusMenu(!showCursusMenu)}
                >
                  <Text style={styles.cursusSelectorText}>{selectedCursus.cursus.name}</Text>
                  <Ionicons
                    name={showCursusMenu ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#61dafb"
                  />
                </TouchableOpacity>
              </View>
              {showCursusMenu && (
                <View style={styles.cursusMenu}>
                  {user.cursus_users.map((cu) => (
                    <TouchableOpacity
                      key={cu.cursus_id}
                      style={[
                        styles.cursusMenuItem,
                        cu.cursus_id === selectedCursusId && styles.cursusMenuItemActive
                      ]}
                      onPress={() => {
                        setSelectedCursusId(cu.cursus_id);
                        setShowCursusMenu(false);
                      }}
                    >
                      <Text style={[
                        styles.cursusMenuItemText,
                        cu.cursus_id === selectedCursusId && styles.cursusMenuItemTextActive
                      ]}>
                        {cu.cursus.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.row}>
                <Text style={styles.label}>Level:</Text>
                <Text style={styles.value}>{selectedCursus.level.toFixed(2)}</Text>
              </View>
              {selectedCursus.grade && (
                <View style={styles.row}>
                  <Text style={styles.label}>Grade:</Text>
                  <Text style={styles.value}>{selectedCursus.grade}</Text>
                </View>
              )}
              {selectedCursus.blackholed_at && (
                <View style={styles.row}>
                  <Text style={styles.label}>Blackhole:</Text>
                  <Text style={styles.value}>
                    {new Date(selectedCursus.blackholed_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={20} color="#61dafb" /> Information
          </Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Wallet:</Text>
              <Text style={styles.value}>{user.wallet} ₳</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Correction Points:</Text>
              <Text style={styles.value}>{user.correction_point}</Text>
            </View>
            {user.location && (
              <View style={styles.row}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{user.location}</Text>
              </View>
            )}
            {user.campus.length > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Campus:</Text>
                <Text style={styles.value}>{user.campus[user.campus.length - 1].name}</Text>
              </View>
            )}
          </View>
        </View>

        {selectedCursus && selectedCursus.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="trophy" size={20} color="#61dafb" /> Skills
            </Text>
            <View style={styles.card}>
              {selectedCursus.skills
                .sort((a, b) => b.level - a.level)
                .slice(0, 10)
                .map((skill) => {
                  const percentage = Math.min(skill.level * 5, 100);
                  return (
                    <View key={skill.id} style={styles.skillRow}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <View style={styles.skillBar}>
                        <View
                          style={[
                            styles.skillBarFill,
                            { width: `${percentage}%` }
                          ]}
                        />
                        <Text style={styles.skillLevel}>
                          {skill.level.toFixed(2)} ({percentage.toFixed(0)}%)
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {user.projects_users.length > 0 && selectedCursusId && (() => {
          const markedProjects = user.projects_users
            .filter(p => p.marked && p.cursus_ids.includes(selectedCursusId))
            .sort((a, b) => {
              const dateA = a.marked_at ? new Date(a.marked_at).getTime() : 0;
              const dateB = b.marked_at ? new Date(b.marked_at).getTime() : 0;
              return dateB - dateA;
            });

          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="briefcase" size={20} color="#61dafb" /> Projects ({markedProjects.length})
              </Text>
              <View style={styles.card}>
                {markedProjects.map((project) => (
                  <View key={project.id} style={styles.projectRow}>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{project.project.name}</Text>
                      {project.marked_at && (
                        <Text style={styles.projectDate}>
                          {new Date(project.marked_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.projectMark,
                      project.validated ? styles.projectSuccess : styles.projectFail
                    ]}>
                      <Text style={styles.projectMarkText}>
                        {project.final_mark !== null ? project.final_mark : 'N/A'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })()}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  centered: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f47',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#61dafb',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  login: {
    color: '#61dafb',
    fontSize: 18,
    marginBottom: 4,
  },
  email: {
    color: '#999',
    fontSize: 14,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#2d3238',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f47',
  },
  label: {
    color: '#999',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  skillRow: {
    marginBottom: 12,
  },
  skillName: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  skillBar: {
    height: 24,
    backgroundColor: '#3a3f47',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  skillBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#61dafb',
    borderRadius: 12,
  },
  skillLevel: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    zIndex: 1,
  },
  cursusSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3a3f47',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    minWidth: 150,
    gap: 8,
  },
  cursusSelectorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  cursusMenu: {
    backgroundColor: '#2d3238',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  cursusMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f47',
  },
  cursusMenuItemActive: {
    backgroundColor: '#3a3f47',
  },
  cursusMenuItemText: {
    color: '#fff',
    fontSize: 14,
  },
  cursusMenuItemTextActive: {
    color: '#61dafb',
    fontWeight: '600',
  },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3f47',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  projectDate: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  projectMark: {
    minWidth: 50,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  projectSuccess: {
    backgroundColor: '#4caf50',
  },
  projectFail: {
    backgroundColor: '#bf13d6',
  },
  projectMarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
