import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Image, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import Api42Service from '@/services/Api42Service';
import { User42 } from '@/types/api.types';

export default function ProfileScreen() {
  const { profile } = useLocalSearchParams<{ profile: string }>();
  const [user, setUser] = useState<User42 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        setError('');
        const userData = await Api42Service.getUserByLogin(profile);
        setUser(userData);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profile]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ffd33d" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#ff4444" />
        <Text style={styles.errorText}>{error || 'User not found'}</Text>
      </View>
    );
  }

  const mainCursus = user.cursus_users.find(cu => cu.cursus.slug === '42cursus') || user.cursus_users[0];

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

        {mainCursus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="school" size={20} color="#ffd33d" /> Cursus Progress
            </Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Cursus:</Text>
                <Text style={styles.value}>{mainCursus.cursus.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Level:</Text>
                <Text style={styles.value}>{mainCursus.level.toFixed(2)}</Text>
              </View>
              {mainCursus.grade && (
                <View style={styles.row}>
                  <Text style={styles.label}>Grade:</Text>
                  <Text style={styles.value}>{mainCursus.grade}</Text>
                </View>
              )}
              {mainCursus.blackholed_at && (
                <View style={styles.row}>
                  <Text style={styles.label}>Blackhole:</Text>
                  <Text style={styles.value}>
                    {new Date(mainCursus.blackholed_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="information-circle" size={20} color="#ffd33d" /> Information
          </Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Wallet:</Text>
              <Text style={styles.value}>{user.wallet} ³</Text>
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
                <Text style={styles.value}>{user.campus[0].name}</Text>
              </View>
            )}
          </View>
        </View>

        {mainCursus && mainCursus.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="trophy" size={20} color="#ffd33d" /> Skills
            </Text>
            <View style={styles.card}>
              {mainCursus.skills
                .sort((a, b) => b.level - a.level)
                .slice(0, 10)
                .map((skill) => (
                  <View key={skill.id} style={styles.skillRow}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <View style={styles.skillBar}>
                      <View
                        style={[
                          styles.skillBarFill,
                          { width: `${Math.min(skill.level * 5, 100)}%` }
                        ]}
                      />
                      <Text style={styles.skillLevel}>{skill.level.toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {user.projects_users.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="briefcase" size={20} color="#ffd33d" /> Projects
            </Text>
            <View style={styles.card}>
              {user.projects_users
                .filter(p => p.marked)
                .sort((a, b) => {
                  const dateA = a.marked_at ? new Date(a.marked_at).getTime() : 0;
                  const dateB = b.marked_at ? new Date(b.marked_at).getTime() : 0;
                  return dateB - dateA;
                })
                .slice(0, 15)
                .map((project) => (
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
        )}
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
    borderColor: '#ffd33d',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  login: {
    color: '#ffd33d',
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
    backgroundColor: '#ffd33d',
    borderRadius: 12,
  },
  skillLevel: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    zIndex: 1,
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
    backgroundColor: '#f44336',
  },
  projectMarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
