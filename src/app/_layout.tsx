import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { Stack } from 'expo-router';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile/[profile]"
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#25292e',
            },
            headerTintColor: '#fff',
            headerTitle: 'Profile',
            presentation: 'card'
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen
          name="sign-in"
          options={{
            headerShown: false
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
