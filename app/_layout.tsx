import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile/[profile]"
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerTitle: 'Profile'
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
