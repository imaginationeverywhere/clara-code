# Implement Mobile Application

Set up a production-grade React Native mobile application using **Expo SDK 52 + Expo Router v4**, with TypeScript, Redux Toolkit, Apollo Client, Clerk authentication, and EAS Build/Submit deployment.

> **MANDATORY**: All mobile development uses Expo. Do NOT use bare React Native CLI.

## Command Usage

```
/implement-mobile-app [options]
```

### Options
- `--full` - Complete Expo app setup (default)
- `--init` - Initialize Expo project only
- `--redux` - Add Redux Toolkit + Redux-Persist
- `--apollo` - Add Apollo Client for GraphQL
- `--clerk` - Add Clerk authentication
- `--offline` - Add offline-first capabilities
- `--eas` - Set up EAS Build + EAS Submit + EAS Update
- `--audit` - Audit existing mobile implementation

## Pre-Implementation Checklist

### Requirements
- [ ] Node.js 20+ installed
- [ ] `eas-cli` installed globally (`npm install -g eas-cli`)
- [ ] Expo account at expo.dev
- [ ] Backend GraphQL API available

### Developer Accounts
- [ ] Apple Developer account (iOS App Store)
- [ ] Google Play Developer account (Android Play Store)

> **No Xcode or Android Studio required** for EAS cloud builds. Only needed for local simulator testing.

---

## Implementation Phases

### Phase 1: Project Initialization

#### 1.1 Create Expo Project
```bash
# Create new Expo project with TypeScript
npx create-expo-app [ProjectName] --template expo-template-blank-typescript

cd [ProjectName]

# Install EAS CLI and configure
npm install -g eas-cli
eas login
eas build:configure
```

#### 1.2 Install Dependencies
```bash
# Navigation (Expo Router is already included with Expo SDK)
npx expo install expo-router expo-linking expo-constants expo-status-bar

# UI
npx expo install react-native-paper react-native-gesture-handler
npx expo install react-native-reanimated react-native-screens
npx expo install react-native-safe-area-context react-native-svg

# State Management
npm install @reduxjs/toolkit react-redux redux-persist
npx expo install @react-native-async-storage/async-storage

# GraphQL
npm install @apollo/client graphql

# Auth
npx expo install @clerk/clerk-expo expo-secure-store expo-web-browser

# Expo Modules
npx expo install expo-image expo-network expo-font expo-splash-screen expo-system-ui
```

#### 1.3 Update package.json main field
```json
{
  "main": "expo-router/entry"
}
```

#### 1.4 Configure app.json
```json
{
  "expo": {
    "name": "[PROJECT_NAME]",
    "slug": "[project-prefix]-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "[project-prefix]",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.[project-prefix].mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.[project-prefix].mobile"
    },
    "web": {
      "bundler": "metro",
      "output": "static"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "apiUrl": "https://api.example.com",
      "graphqlEndpoint": "https://api.example.com/graphql",
      "clerkPublishableKey": "pk_live_...",
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

#### 1.5 Configure babel.config.js
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

#### 1.6 Configure metro.config.js
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;
```

#### 1.7 Configure tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.d.ts", "expo-env.d.ts"]
}
```

---

### Phase 2: Directory Structure

```
mobile/
├── app/                        # Expo Router (file-based routing)
│   ├── _layout.tsx             # Root layout — all providers go here
│   ├── index.tsx               # Root redirect
│   ├── (tabs)/                 # Tab navigation group
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── profile.tsx
│   └── (auth)/                 # Auth screens
│       ├── _layout.tsx
│       ├── login.tsx
│       └── register.tsx
├── components/
│   ├── common/
│   └── forms/
├── constants/
│   ├── theme.ts
│   └── config.ts               # expo-constants wrapper
├── hooks/
├── services/
│   └── apollo.ts
├── store/
│   ├── store.ts
│   ├── hooks.ts
│   └── slices/
├── types/
├── utils/
└── assets/
    └── images/
        ├── icon.png             # 1024×1024
        ├── splash-icon.png
        ├── adaptive-icon.png    # Android
        └── favicon.png
```

Create structure:
```bash
mkdir -p app/{tabs,\(auth\)} components/{common,forms} constants hooks services store/slices types utils assets/images
```

---

### Phase 3: Root Layout (All Providers)

```typescript
// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { store, persistor } from '@/store/store';
import { apolloClient } from '@/services/apollo';

SplashScreen.preventAutoHideAsync();

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async deleteToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ClerkProvider
      publishableKey={Constants.expoConfig?.extra?.clerkPublishableKey ?? ''}
      tokenCache={tokenCache}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ReduxProvider store={store}>
          <PersistGate persistor={persistor}>
            <ApolloProvider client={apolloClient}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              </Stack>
            </ApolloProvider>
          </PersistGate>
        </ReduxProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
```

---

### Phase 4: Redux Store

```typescript
// store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import preferencesReducer from './slices/preferencesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  preferences: preferencesReducer,
});

const persistedReducer = persistReducer(
  { key: 'root', version: 1, storage: AsyncStorage, whitelist: ['cart', 'auth', 'preferences'] },
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

### Phase 5: Apollo Client

```typescript
// services/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const httpLink = createHttpLink({
  uri: Constants.expoConfig?.extra?.graphqlEndpoint ?? 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, path }) =>
      console.error(`[GraphQL Error]: ${message}, Path: ${path}`)
    );
  }
  if (networkError) console.error(`[Network Error]: ${networkError}`);
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
```

---

### Phase 6: Tab Navigation

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

---

### Phase 7: EAS Build Configuration

#### 7.1 eas.json
```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID",
        "ascAppId": "YOUR_APP_STORE_APP_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

#### 7.2 EAS Environment Variables (for secrets)
```bash
# Create environment variables in EAS (never commit secrets)
eas env:create --name CLERK_SECRET_KEY --value "sk_live_..." --environment production
eas env:create --name DATABASE_URL --value "postgresql://..." --environment production
```

---

### Phase 8: GitHub Actions CI/CD

```yaml
# .github/workflows/mobile-eas-build.yml
name: EAS Build & Submit

on:
  push:
    branches: [main]
    paths: ['mobile/**']
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform (ios/android/all)'
        default: 'all'

jobs:
  build:
    name: EAS Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: npm ci
        working-directory: mobile
      - name: Type check
        run: npx tsc --noEmit
        working-directory: mobile
      - name: Run tests
        run: npm test -- --ci
        working-directory: mobile
      - name: EAS Build
        run: eas build --platform ${{ github.event.inputs.platform || 'all' }} --non-interactive
        working-directory: mobile

  update:
    name: EAS Update (OTA)
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
        working-directory: mobile
      - name: EAS Update
        run: eas update --channel production --message "Deploy from ${{ github.sha }}"
        working-directory: mobile
```

---

### Phase 9: Testing

```bash
# Install testing deps
npm install --save-dev jest-expo @testing-library/react-native @testing-library/jest-native
```

```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('renders and responds to press', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click Me</Button>);
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

---

## npm Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "start:dev": "expo start --dev-client",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "test": "jest --watchAll",
    "test:ci": "jest --ci",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "build:dev": "eas build --profile development --platform all",
    "build:preview": "eas build --profile preview --platform all",
    "build:ios": "eas build --profile production --platform ios",
    "build:android": "eas build --profile production --platform android",
    "build:all": "eas build --profile production --platform all",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android",
    "update": "eas update --channel production",
    "doctor": "expo-doctor"
  }
}
```

---

## Verification Checklist

### Project Setup
- [ ] Expo project initialized with `create-expo-app`
- [ ] `"main": "expo-router/entry"` in package.json
- [ ] `"newArchEnabled": true` in app.json
- [ ] `babel-preset-expo` in babel.config.js
- [ ] `expo/metro-config` in metro.config.js
- [ ] `expo/tsconfig.base` in tsconfig.json
- [ ] EAS configured (`eas.json` exists)

### State Management
- [ ] Redux store with AsyncStorage persistence
- [ ] Typed hooks created
- [ ] Auth, cart, preferences slices

### GraphQL
- [ ] Apollo Client with auth link using `expo-secure-store`
- [ ] Error handling link
- [ ] Error and loading states

### Navigation (Expo Router)
- [ ] `app/_layout.tsx` root layout with all providers
- [ ] `(tabs)/_layout.tsx` with bottom tabs
- [ ] `(auth)/_layout.tsx` for auth screens
- [ ] Typed routes via `experiments.typedRoutes`

### Authentication
- [ ] Clerk configured with `expo-secure-store` token cache
- [ ] Protected routes using `useAuth`
- [ ] Login/register screens in `(auth)/`

### Deployment (EAS)
- [ ] `eas.json` with development/preview/production profiles
- [ ] EAS environment variables for secrets
- [ ] GitHub Actions workflow for EAS Build
- [ ] EAS Update for OTA updates

### Testing
- [ ] `jest-expo` preset configured
- [ ] Sample tests passing
- [ ] CI running tests before build

---

## Troubleshooting

### Metro Cache Issues
```bash
npx expo start --clear
```

### Prebuild Issues (native modules)
```bash
npx expo prebuild --clean
cd ios && pod install && cd ..
```

### EAS Build Failures
```bash
# Check build logs in Expo dashboard
eas build:list

# Run doctor
npx expo-doctor
```

### New Architecture Compatibility
If a library doesn't support New Architecture, either:
1. Find an Expo equivalent (`expo-image` instead of `react-native-fast-image`)
2. Set `"newArchEnabled": false` temporarily and file an issue with the library

---

## Related Skills

- **react-native-standard** - React Native component patterns
- **offline-first-standard** - Offline architecture
- **mobile-deployment-standard** - EAS deployment patterns
- **clerk-auth-standard** - Clerk authentication

## Related Commands

- `/implement-caching` - Caching strategy
- `/implement-notifications` - Push notifications with Expo Notifications
- `/implement-clerk-standard` - Clerk authentication setup
