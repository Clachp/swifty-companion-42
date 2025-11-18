import SearchInput from '@/components/SearchInput';
import { StyleSheet, View } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <SearchInput></SearchInput>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
