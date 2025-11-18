import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Api42Service from '@/services/Api42Service';
import { User42 } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';

import Button from '@/components/Button';
import ProfileCard from '@/components/ProfileCard';
import SearchInput from '@/components/SearchInput';

export default function Index() {
  const { isAuthenticated, login } = useAuth();
  const [searchedUser, setSearchedUser] = useState<User42 | null>(null);

  const searchUser = async (login: string) => {
    try {
      const user = await Api42Service.getUserByLogin(login);
      setSearchedUser(user);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  }

  return (
    <View style={styles.container}>
    {isAuthenticated ? (
      <View style={styles.imageContainer}>
        <SearchInput onPress={searchUser}></SearchInput>

        {searchedUser && (
          <View style={styles.section}>
            <ProfileCard user={searchedUser} />
          </View>
        )}
      </View>
    ) : (
      <View style={styles.footerContainer}>
        <Button label="Login" theme='primary' onPress={login}/>
        <Text style={styles.text}>Connect to your 42 account</Text>
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
  },
  text: {
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  section: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
});
