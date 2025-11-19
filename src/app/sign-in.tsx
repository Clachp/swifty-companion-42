import Button from '@/src/components/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

// Nécessaire pour que le navigateur se ferme automatiquement après la connexion
WebBrowser.maybeCompleteAuthSession();

const API_UID = Constants.expoConfig?.extra?.apiClientId;

export default function SignIn() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Créer la redirect URI basée sur le scheme de l'app
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'swiftycompanion',
  });

  // Configuration de la requête OAuth
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
      console.log('✅ Authentification réussie');
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'authentification:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors de la connexion'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la réponse OAuth
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleAuthentication(code);
    } else if (response?.type === 'error') {
      console.error('Erreur OAuth:', response.error);
      Alert.alert('Erreur', 'Échec de l\'authentification. Veuillez réessayer.');
      setIsLoading(false);
    } else if (response?.type === 'dismiss') {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleLogin = async () => {
    if (!request) {
      Alert.alert('Erreur', 'La configuration OAuth n\'est pas prête');
      return;
    }

    if (!API_UID) {
      Alert.alert('Erreur', 'Configuration API manquante. Vérifiez votre .env');
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

      {__DEV__ && (
        <Text style={styles.debugText}>
          Redirect URI: {redirectUri}
        </Text>
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
  debugText: {
    color: '#666',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },
});
