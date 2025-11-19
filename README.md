# Swifty Companion

Application mobile React Native pour consulter les profils d'étudiants de l'école 42.

## Fonctionnalités

- ✅ Authentification OAuth avec l'API 42
- ✅ Recherche de profils par login
- ✅ Affichage des informations détaillées (email, wallet, points de correction, etc.)
- ✅ Visualisation des skills avec niveaux et pourcentages
- ✅ Liste des projets réussis et échoués
- ✅ Navigation fluide entre les pages
- ✅ Gestion des erreurs (login non trouvé, erreur réseau, etc.)
- ✅ Design responsive et moderne

## Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Expo CLI
- Un compte 42 avec une application OAuth configurée

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd ft-swifty-companion
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'application OAuth 42

1. Allez sur [https://profile.intra.42.fr/oauth/applications](https://profile.intra.42.fr/oauth/applications)
2. Créez une nouvelle application ou éditez une existante
3. Configurez les **Redirect URIs** suivants :
   ```
   swiftycompanion://
   exp://localhost:8081
   http://localhost:8081
   ```
4. Notez votre `Client ID` et `Client Secret`

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Éditez le fichier `.env` et ajoutez vos credentials :

```env
API_UID=votre_client_id
API_SECRET=votre_client_secret
```

### 5. Lancer l'application

```bash
npx expo start
```

Choisissez ensuite votre plateforme :
- Appuyez sur `i` pour iOS Simulator
- Appuyez sur `a` pour Android Emulator
- Scannez le QR code avec Expo Go (mobile)

## Configuration OAuth

### Redirect URIs expliqués

L'application utilise différents redirect URIs selon l'environnement :

- **`swiftycompanion://`** : Pour l'app native compilée (iOS/Android)
- **`exp://localhost:8081`** : Pour Expo Go en développement
- **`http://localhost:8081`** : Pour le web en développement

Le redirect URI est automatiquement généré par `expo-auth-session` en fonction de l'environnement d'exécution.

### Schéma de l'app

Le schéma `swiftycompanion` est défini dans `app.config.js` :

```javascript
scheme: "swiftycompanion"
```

Ce schéma permet à l'API 42 de rediriger l'utilisateur vers votre app après l'authentification.

## Structure du projet

```
src/
├── app/                    # Pages (file-based routing)
│   ├── (tabs)/            # Groupe de navigation avec tabs
│   │   ├── index.tsx      # Page de recherche
│   │   └── logout.tsx     # Page de déconnexion
│   ├── profile/
│   │   └── [profile].tsx  # Page de détail du profil
│   ├── sign-in.tsx        # Page de connexion OAuth
│   └── _layout.tsx        # Layout principal avec authentification
├── components/            # Composants réutilisables
│   ├── Button.tsx
│   ├── ProfileCard.tsx
│   └── SearchInput.tsx
├── contexts/              # Contextes React
│   └── AuthContext.tsx    # Gestion de l'authentification
├── services/              # Services API
│   ├── Api42Service.ts    # Requêtes vers l'API 42
│   └── AuthService.ts     # Gestion OAuth et tokens
└── types/                 # Types TypeScript
    ├── api.types.ts
    ├── auth.ts
    └── navigation.ts
```

## Flow d'authentification OAuth

1. L'utilisateur clique sur "Login with 42"
2. L'app ouvre le navigateur vers `https://api.intra.42.fr/oauth/authorize`
3. L'utilisateur se connecte avec son compte 42
4. 42 redirige vers `swiftycompanion://` avec un code d'autorisation
5. L'app échange le code contre un `access_token` et un `refresh_token`
6. Les tokens sont stockés de manière sécurisée
7. L'utilisateur est connecté et peut utiliser l'app

## Gestion des tokens

- **Access Token** : Valide pendant 2 heures, utilisé pour les requêtes API
- **Refresh Token** : Permet de renouveler l'access token sans re-connexion
- **Stockage sécurisé** : Utilise `expo-secure-store` (iOS/Android) ou `localStorage` (Web)
- **Auto-refresh** : Le token est automatiquement rafraîchi 5 minutes avant expiration

## Technologies utilisées

- **React Native** : Framework mobile
- **Expo** : Plateforme de développement
- **Expo Router** : Navigation file-based
- **TypeScript** : Typage statique
- **Axios** : Client HTTP
- **expo-auth-session** : OAuth flow
- **expo-secure-store** : Stockage sécurisé des tokens

## Développement

### Linter

```bash
npm run lint
```

### TypeScript

Le projet utilise TypeScript avec des types stricts. Vérifiez les erreurs avec :

```bash
npx tsc --noEmit
```

## Dépannage

### "Configuration API manquante"

Vérifiez que votre fichier `.env` contient bien `API_UID` et `API_SECRET`.

### "Redirect URI mismatch"

Assurez-vous que le redirect URI affiché dans l'app (en mode dev) correspond à ceux configurés dans votre application 42.

### Le navigateur ne se ferme pas après la connexion

Sur iOS/Android natif, vérifiez que le schéma `swiftycompanion://` est bien configuré dans votre application 42.

### Token expiré

L'app gère automatiquement le refresh des tokens. Si vous voyez cette erreur, essayez de vous déconnecter et reconnecter.

## Projet 42

Ce projet fait partie du cursus de l'école 42. Il respecte les exigences suivantes :

- ✅ Au moins 2 vues
- ✅ Gestion des erreurs (login non trouvé, erreur réseau, etc.)
- ✅ Affichage des informations de login
- ✅ Au moins 4 détails utilisateur affichés
- ✅ Skills avec niveau et pourcentage
- ✅ Projets complétés et échoués
- ✅ Navigation retour vers la première vue
- ✅ Layout flexible/responsive
- ✅ Pas de nouveau token à chaque requête

## Licence

Projet académique - École 42
