# Swifty Companion

A React Native mobile application for browsing 42 school student profiles.

## Features

- OAuth authentication with 42 API
- Profile search by login
- Display detailed information (email, wallet, correction points, etc.)
- Skill visualization with levels and percentages
- List of completed and failed projects

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- A 42 account with a configured OAuth application

## Installation

### 1. Clone the project

```bash
git clone <repo-url>
cd ft-swifty-companion
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the 42 OAuth application

1. Go to [https://profile.intra.42.fr/oauth/applications](https://profile.intra.42.fr/oauth/applications)
2. Create a new application or edit an existing one
3. Add the following **Redirect URIs**:
   - `swiftycompanion://` (for production builds)
   - The URI shown in Expo console when using Expo Go (e.g., `exp://192.168.x.x:8081`)

### 4. Configure environment variables

Create a `.env` file at the project root:

```bash
cp .env.example .env
```

Edit the `.env` file and add your credentials:

```env
API_UID=your_client_id
API_SECRET=your_client_secret
```

### 5. Start the application

#### Local mode (standard development)

```bash
npm start
```

Then choose your platform:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan the QR code with Expo Go (mobile)

#### Tunnel mode (42 network or restricted networks)

If you are on the 42 school network or a network with restrictions, use tunnel mode:

```bash
npx expo start --tunnel
```

**Important:** When using Expo Go on mobile, check the console logs for the redirect URI (e.g., `exp://192.168.x.x:8081`) and add it to your 42 OAuth application redirect URIs.

**Note:** Tunnel mode uses a tunnel service managed by Expo (similar to ngrok) to create a public URL accessible from any network.

## Available Scripts

### Development scripts
- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run web` - Start on web browser

### Maintenance scripts
- `npm run clean` - Remove node_modules, cache, and Expo folders
- `npm run reset` - Clean everything, reinstall packages, and start with cleared cache
- `npm run reset:tunnel` - Same as reset but with tunnel mode for mobile testing

### Other scripts
- `npm run lint` - Run ESLint

**When to use reset:** Use `npm run reset` or `npm run reset:tunnel` when you encounter cache issues, package conflicts, or unexplained errors.

## OAuth authentication flow

1. User clicks on "Login with 42"
2. App opens browser to `https://api.intra.42.fr/oauth/authorize`
3. User logs in with their 42 account
4. 42 redirects to `swiftycompanion://` with an authorization code
5. App exchanges the code for an `access_token` and `refresh_token`
6. Tokens are stored securely
7. User is logged in and can use the app

## Token management

- **Access Token**: Valid for 2 hours, used for API requests
- **Refresh Token**: Allows refreshing the access token without re-login
- **Secure storage**: Uses `expo-secure-store` (iOS/Android) or `localStorage` (Web)
- **Auto-refresh**: Token is automatically refreshed 5 minutes before expiration

## Troubleshooting

### OAuth redirect issues
If OAuth authentication fails with redirect URI errors:
1. Check the console log for the actual redirect URI being used
2. Ensure that exact URI is added to your 42 OAuth application
3. For Expo Go, the URI changes based on your network (e.g., `exp://192.168.1.x:8081`)
4. Restart the app after updating the 42 OAuth configuration

### Cache or package issues
If you encounter unexplained errors or the app won't start:
```bash
npm run reset        # For local development
npm run reset:tunnel # For mobile with Expo Go
```

### Package version warnings
If you see warnings about package versions not matching:
```bash
npx expo install --fix
```

## Technologies used

- **React Native**: Mobile framework
- **Expo**: Development platform and tooling
- **Expo Router**: File-based navigation system
- **TypeScript**: Static typing for JavaScript
- **Axios**: HTTP client for API requests
- **expo-auth-session**: OAuth 2.0 authentication flow
- **expo-secure-store**: Secure token storage (iOS/Android keychain)
