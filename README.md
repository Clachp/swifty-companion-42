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
3. Configure the **Redirect URIs** given by the Expo cli message

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
npx expo start
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

**Specific configuration for tunnel:**

1. Launch the app with `npx expo start --tunnel`
2. Add this additional redirect URI displayed by Expo in your 42 application:

**Important note:** Tunnel mode uses a tunnel service managed by Expo (similar to ngrok) to create a public URL accessible from any network.

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

## Technologies used

- **React Native**: Mobile framework
- **Expo**: Development platform
- **Expo Router**: File-based navigation
- **TypeScript**: Static typing
- **Axios**: HTTP client
- **expo-auth-session**: OAuth flow
- **expo-secure-store**: Secure token storage
