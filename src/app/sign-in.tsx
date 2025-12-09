import Button from '@/src/components/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const API_UID = Constants.expoConfig?.extra?.apiClientId;

export default function SignIn() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'swiftycompanion',
  });

  // Log redirect URI for debugging
  console.log('Redirect URI:', redirectUri);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: API_UID || '',
      scopes: ['public'],
      redirectUri: redirectUri,
    },
    {
      authorizationEndpoint: 'https://api.intra.42.fr/oauth/authorize',
    }
  );

  const handleAuthentication = async (code: string) => {
    try {
      setIsLoading(true);
      await login(code, redirectUri);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleAuthentication(code);
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Authentication failed. Please try again.');
      setIsLoading(false);
    } else if (response?.type === 'dismiss') {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleLogin = async () => {
    if (!request) {
      Alert.alert('Error', 'OAuth configuration is not ready');
      return;
    }

    if (!API_UID) {
      Alert.alert('Error', 'Missing API configuration. Check your .env file');
      return;
    }

    setIsLoading(true);
    await promptAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swifty Companion</Text>
      <Text style={styles.subtitle}>Connect to your 42 account</Text>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#61dafb" />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      ) : (
        <Button
          label="Login with 42"
          theme="primary"
          onPress={handleLogin}
          disabled={!request}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
  },
  loaderContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});
