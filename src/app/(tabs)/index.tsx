import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Api42Service from '@/src/services/Api42Service';
import { User42 } from '@/src/types/api.types';

import Button from '@/src/components/Button';
import ProfileCard from '@/src/components/ProfileCard';
import SearchInput from '@/src/components/SearchInput';
import { useAuth } from '@/src/contexts/AuthContext';
import { useProfile } from '@/src/contexts/ProfileContext';

export default function IndexScreen() {
  const router = useRouter();
  const { userLogin } = useAuth();
  const { cacheProfile } = useProfile();
  const [searchedUser, setSearchedUser] = useState<User42 | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const searchUser = async (login: string) => {
    try {
      setSearchError('');
      setSearchedUser(null);
      setIsLoading(true);

      const user = await Api42Service.getUserByLogin(login);
      setSearchedUser(user);
      cacheProfile(user);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setSearchError(`User "${login}" not found`);
      } else if (error.response?.status === 401) {
        setSearchError('Authentication error. Please log in again.');
      } else if (error.response?.status === 429) {
        setSearchError('Too many requests. Please wait a moment.');
      } else if (error.message) {
        setSearchError(error.message);
      } else {
        setSearchError('An error occurred while searching. Please try again.');
      }

      setSearchedUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const viewProfile = () => {
    if (searchedUser) {
      router.push({
        pathname: '/profile/[profile]',
        params: { profile: searchedUser.login }
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        {userLogin ? `Welcome ${userLogin} !` : 'Welcome !'} Search for a 42 profile
      </Text>
      <SearchInput onPress={searchUser} error={searchError}></SearchInput>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Searching profile...</Text>
        </View>
      )}
      {!isLoading && searchedUser && (
        <View style={styles.section}>
          <ProfileCard user={searchedUser} />
          <Button
            label="View Profile"
            theme='primary'
            onPress={viewProfile}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',

  },
  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  loaderContainer: {
    marginVertical: 30,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
});
