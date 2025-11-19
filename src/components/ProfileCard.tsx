import { User42 } from '@/src/types/api.types';
import { Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  user: User42;
};

export default function ProfileCard({ user }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: user.image.versions.medium }}
        style={styles.userImage}
      />
      <Text style={styles.userName}>{user.usual_full_name}</Text>
      <Text style={styles.userLogin}>@{user.login}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userLogin: {
    color: '#aaa',
    fontSize: 16,
  },
});
