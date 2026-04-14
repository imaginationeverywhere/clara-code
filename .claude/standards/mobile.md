# Mobile Stack Standard

**Version:** 1.0.0
**Enforced by:** `/pickup-prompt --mobile`

**Canonical stack:** React Native · Expo SDK 52 · Expo Router · TypeScript (strict) · NativeWind · Apollo Client · Clerk (expo) · Redux-Persist · EAS

This standard enforces the exact technology choices, package versions, file structure, and patterns for ALL Quik Nation mobile apps. Any prompt executed with `--mobile` MUST produce code matching this stack exactly — no substitutions.

> **Stack overlap with --eas, --push, --apple-maps, --mapbox:** Those standards are still required for their specific concerns. `--mobile` covers app architecture, navigation, styling, state, and platform patterns. Stack them: `/pickup-prompt --mobile --push --eas --apple-maps --mapbox` for a full cross-platform mobile feature.

---

## CRITICAL RULES

### 1. Stack — exact packages and versions

```json
// package.json (mobile workspace)
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react-native": "0.76.x",
    "react": "18.3.x",
    "typescript": "^5.3.0",
    "nativewind": "^4.1.0",
    "tailwindcss": "^3.4.0",
    "@apollo/client": "^3.11.0",
    "graphql": "^16.9.0",
    "@clerk/clerk-expo": "^2.0.0",
    "expo-secure-store": "~14.0.0",
    "@reduxjs/toolkit": "^2.3.0",
    "redux-persist": "^6.0.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "expo-image": "~2.0.0",
    "expo-haptics": "~14.0.0",
    "expo-constants": "~17.0.0",
    "expo-notifications": "~0.29.0",
    "expo-linking": "~7.0.0",
    "expo-splash-screen": "~0.29.0",
    "@shopify/flash-list": "^1.7.0",
    "@react-native-community/netinfo": "^11.3.0",
    "react-native-safe-area-context": "^4.12.0",
    "react-native-screens": "~4.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "@types/react-native": "~0.76.0",
    "jest": "^29.7.0",
    "jest-expo": "~52.0.0"
  }
}

// ❌ React Navigation (manual) — always Expo Router (file-based)
// ❌ React Native StyleSheet — always NativeWind
// ❌ React Query — always Apollo Client for GraphQL
// ❌ Zustand / MobX — always Redux Toolkit + Redux-Persist
// ❌ react-native Image — always expo-image
// ❌ ScrollView + .map() for lists — always FlashList
// ❌ Custom camera/media — use expo-camera, expo-image-picker
```

---

### 2. TypeScript — strict mode, always

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@/*": ["./src/*"],
      "@assets/*": ["./assets/*"]
    }
  }
}
// ❌ strict: false
// ❌ any types without explicit comment justification
```

---

### 3. File structure — Expo Router (file-based routing)

```
mobile/
├── app/                          # Expo Router — file = route
│   ├── _layout.tsx               # Root layout — Providers wrapper
│   ├── index.tsx                 # Landing / onboarding
│   ├── (auth)/                   # Auth group (sign-in, sign-up)
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/                   # Bottom tab group
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   └── profile.tsx
│   └── (modal)/                  # Modal screens
│       └── [id].tsx
├── src/
│   ├── components/
│   │   ├── ui/                   # Base: Button, Input, Card, Spinner
│   │   ├── layout/               # Header, BottomBar, SafeWrapper
│   │   ├── profile/              # ProfileWidget, WalletSummaryCard
│   │   └── [feature]/            # Feature-specific components
│   ├── lib/
│   │   ├── apollo-client.ts      # Apollo Client singleton (same pattern as web)
│   │   └── utils.ts
│   ├── store/
│   │   ├── index.ts              # Redux store + persistor (AsyncStorage)
│   │   └── slices/
│   ├── graphql/
│   │   ├── queries/
│   │   └── mutations/
│   ├── hooks/                    # Custom hooks (useAuth, useNetwork, useHaptics)
│   └── types/
│       └── index.ts
├── assets/
│   ├── images/
│   │   ├── icon.png              # 1024x1024
│   │   ├── splash.png            # 2048x2048
│   │   └── adaptive-icon.png     # 1024x1024 (Android)
│   └── fonts/
│       └── JetBrainsMono-Regular.ttf
├── app.json                      # Expo config
├── eas.json                      # EAS build config (see --eas standard)
├── babel.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

### 4. Root layout — Providers (required order)

```typescript
// app/_layout.tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { ApolloProvider } from "@apollo/client";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { apolloClient, updateApolloClientAuth } from "@/lib/apollo-client";
import { store, persistor } from "@/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";

// Clerk token cache — ALWAYS use SecureStore on mobile (never AsyncStorage for tokens)
const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

// Wire Clerk token → Apollo headers
function AuthSetup({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      updateApolloClientAuth(async () => {
        try { return await getToken(); }
        catch { return null; }
      });
    }
    setReady(true);
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || !ready) return <Spinner />;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    // ✅ Provider order: GestureHandler → SafeArea → Clerk → AuthSetup → Apollo → Redux → PersistGate
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider
          publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          tokenCache={tokenCache}
        >
          <AuthSetup>
            <ApolloProvider client={apolloClient}>
              <ReduxProvider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                  <Stack screenOptions={{ headerShown: false }} />
                </PersistGate>
              </ReduxProvider>
            </ApolloProvider>
          </AuthSetup>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ❌ Never use AsyncStorage for auth tokens — always SecureStore
// ❌ Never put SafeAreaProvider inside a screen — it belongs at root
```

---

### 5. NativeWind — brand tokens required

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      "#09090F",
          purple:  "#7C3AED",
          teal:    "#7BCDD8",
          success: "#10B981",
          surface: "#111118",
          border:  "rgba(255,255,255,0.1)",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular", "sans-serif"],
        mono: ["JetBrainsMono_400Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

// ❌ Hardcoded hex in style props — always use brand-* tokens
// ❌ StyleSheet.create() — always NativeWind className
// ❌ className="bg-[#09090F]" → className="bg-brand-bg"
```

---

### 6. Every screen — required structure

```typescript
// ✅ Standard screen pattern
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function HomeScreen() {
  return (
    // ✅ SafeAreaView on EVERY screen root — no exceptions
    <SafeAreaView className="flex-1 bg-brand-bg" edges={["top", "bottom"]}>
      {/* ✅ Configure header via Stack.Screen, not a custom header component */}
      <Stack.Screen options={{ title: "Home", headerShown: false }} />

      <View className="flex-1 px-4">
        {/* screen content */}
      </View>
    </SafeAreaView>
  );
}

// ❌ Raw View as screen root — always SafeAreaView
// ❌ Custom header that doesn't use Stack.Screen options
// ❌ Importing from 'react-native-safe-area-context' in a screen without SafeAreaProvider at root
```

---

### 7. Touch targets — 44pt minimum (iOS HIG)

```typescript
// ✅ All interactive elements must be ≥44pt (iOS) / 48dp (Android)
// ✅ Use Pressable (preferred) or TouchableOpacity — never TouchableHighlight

import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";

// ✅ Button with haptic feedback
export function PrimaryButton({ onPress, children }: ButtonProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      // ✅ minHeight-11 = 44pt on iOS  |  ✅ accessibility
      className="min-h-11 justify-center items-center rounded-xl bg-brand-purple px-6 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={typeof children === "string" ? children : undefined}
    >
      <Text className="text-white font-semibold text-base">{children}</Text>
    </Pressable>
  );
}

// ❌ Pressable without accessibilityRole
// ❌ Touch targets smaller than min-h-11 (44pt)
// ❌ No haptic feedback on primary actions
```

---

### 8. Lists — FlashList, never ScrollView + map

```typescript
// ✅ Always FlashList for any list of unknown length
import { FlashList } from "@shopify/flash-list";

export function OrderList({ orders }: { orders: Order[] }) {
  return (
    <FlashList
      data={orders}
      keyExtractor={(item) => item.id}
      estimatedItemSize={72}        // ✅ required — estimate height for performance
      renderItem={({ item }) => <OrderCard order={item} />}
      ItemSeparatorComponent={() => <View className="h-px bg-white/10" />}
      ListEmptyComponent={<EmptyState message="No orders yet" />}
      onEndReached={fetchMore}
      onEndReachedThreshold={0.3}
    />
  );
}

// ❌ <ScrollView>{orders.map(o => <OrderCard />)}</ScrollView>
// ❌ FlatList from react-native — use FlashList (better perf)
// ❌ Missing estimatedItemSize — required by FlashList
```

---

### 9. Images — always expo-image, not RN Image

```typescript
// ✅ expo-image has disk + memory cache, blur hash, transitions
import { Image } from "expo-image";

const BLUR_HASH = "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export function UserAvatar({ uri, size = 40 }: { uri?: string; size?: number }) {
  return (
    <Image
      source={uri ?? require("@assets/images/default-avatar.png")}
      placeholder={{ blurhash: BLUR_HASH }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
    />
  );
}

// ❌ import { Image } from 'react-native'
// ❌ No placeholder/blurhash — always provide one to prevent layout shift
// ❌ cachePolicy="none" — always cache images
```

---

### 10. Platform gating — explicit OS checks required

```typescript
import { Platform } from "react-native";

// ✅ Always explicit — never assume behavior works on both platforms
const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

// ✅ Platform-specific component rendering
function MapContainer() {
  if (Platform.OS === "ios") {
    return <AppleMapsView />;       // see --apple-maps standard
  }
  if (Platform.OS === "android") {
    return <MapboxView />;          // see --mapbox standard
  }
  return null;
}

// ✅ Keyboard behavior differs by platform
<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
>

// ❌ Assuming iOS shadow works on Android (use elevation instead)
// ❌ Assuming Android back button behavior on iOS
// ❌ Using Platform.OS === 'web' in mobile-only code
```

---

### 11. Redux store — AsyncStorage for mobile persistence

```typescript
// src/store/index.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";  // NOT localStorage

const persistConfig = {
  key: "root",
  storage: AsyncStorage,            // ✅ Mobile: AsyncStorage (not localStorage)
  whitelist: ["cart", "preferences"],
  blacklist: ["auth"],              // ✅ Never persist auth — Clerk + SecureStore handles it
};

const rootReducer = combineReducers({
  cart:        cartSlice.reducer,
  preferences: preferencesSlice.reducer,
  ui:          uiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"] },
    }),
});

export const persistor = persistStore(store);
export type RootState  = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ❌ import storage from 'redux-persist/lib/storage' — that's localStorage (web only)
// ❌ Persisting auth tokens, Clerk session data, or wallet balance
```

---

### 12. Environment variables — Expo public prefix

```bash
# .env.local (development)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_GRAPHQL_URL=http://localhost:3031/graphql
EXPO_PUBLIC_APP_URL=exp://localhost:8081

# .env.develop (staging)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=[from SSM /[project]/dev/CLERK_PUBLISHABLE_KEY]
EXPO_PUBLIC_GRAPHQL_URL=https://api-dev.[project].com/graphql
EXPO_PUBLIC_APP_URL=https://develop.[project].com

# .env.production
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=[from SSM /[project]/prod/CLERK_PUBLISHABLE_KEY]
EXPO_PUBLIC_GRAPHQL_URL=https://api.[project].com/graphql
EXPO_PUBLIC_APP_URL=https://[project].com

# Rules:
# ✅ Mobile env vars use EXPO_PUBLIC_ prefix (not NEXT_PUBLIC_)
# ✅ Read at build time via expo-constants (process.env.EXPO_PUBLIC_*)
# ❌ Secrets in .env files — sensitive keys go in EAS Secrets or SSM
# ❌ NEXT_PUBLIC_* — wrong prefix for mobile
```

---

### 13. Offline / network handling

```typescript
// src/hooks/useNetwork.ts
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return unsubscribe;
  }, []);

  return { isConnected };
}

// ✅ Show offline banner when isConnected === false
// ✅ Apollo Client: cache-and-network policy allows reading cached data offline
// ✅ Queue mutations when offline (Redux slice + re-send on reconnect)
// ❌ Assuming network is always available — mobile users go offline constantly
```

---

### 14. Deep linking — required for auth callbacks

```typescript
// app.json — required deep link config
{
  "expo": {
    "scheme": "[project-slug]",           // e.g. "quikcarrental"
    "ios": {
      "bundleIdentifier": "com.quiknation.[project]",
      "associatedDomains": ["applinks:[project].com"]
    },
    "android": {
      "package": "com.quiknation.[project]",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [{"scheme": "https", "host": "[project].com"}],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}

// ✅ Clerk auth callback uses the scheme: [project-slug]://sign-in-callback
// ✅ expo-linking handles both custom scheme and universal links
// ❌ Missing scheme — Clerk OAuth callbacks will fail without it
```

---

### 15. Accessibility — required on all interactive elements

```typescript
// ✅ Required accessibility props on every interactive element
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Add to cart"
  accessibilityHint="Adds this item to your shopping cart"
  accessibilityState={{ disabled: isDisabled }}
  onPress={handleAddToCart}
>

// ✅ Required on images
<Image
  accessibilityLabel="Product photo of blue sneakers"
  accessible={true}
/>

// ✅ Screen reader focus management on modals
<Modal onShow={() => AccessibilityInfo.setAccessibilityFocus(firstFocusableRef)} />

// ❌ Pressable without accessibilityRole
// ❌ Icon-only buttons without accessibilityLabel
// ❌ Decorative images without accessible={false}
```

---

### 16. app.json — standard config

```json
{
  "expo": {
    "name": "[Project Name]",
    "slug": "[project-slug]",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "[project-slug]",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#09090F"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.quiknation.[project]",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We use your location to show nearby options.",
        "NSCameraUsageDescription": "We use your camera to upload photos.",
        "NSPhotoLibraryUsageDescription": "We use your photo library to upload photos."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#09090F"
      },
      "package": "com.quiknation.[project]",
      "versionCode": 1,
      "permissions": ["ACCESS_FINE_LOCATION", "CAMERA", "READ_EXTERNAL_STORAGE"]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      ["expo-notifications", { "icon": "./assets/images/notification-icon.png" }]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
// ❌ backgroundColor other than #09090F — always brand-bg
// ❌ supportsTablet: true without tablet-specific layouts
// ❌ Missing bundleIdentifier — EAS builds will fail
```

---

### 17. Performance — required patterns

```typescript
// ✅ Memoize expensive components
export const OrderCard = memo(function OrderCard({ order }: { order: Order }) {
  return (/* ... */);
});

// ✅ useCallback on handlers passed as props
const handlePress = useCallback(() => {
  router.push(`/orders/${order.id}`);
}, [order.id]);

// ✅ useMemo for derived data
const sortedOrders = useMemo(
  () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [orders]
);

// ✅ Lazy load heavy screens
const HeavyScreen = lazy(() => import("./HeavyScreen"));

// ❌ Arrow functions in render — creates new reference on every render
// ❌ Object/array literals in style prop — creates new object every render
// ❌ Missing key prop in lists
// ❌ Nested FlatLists (use SectionList instead)
```

---

### Heru-specific tech doc required

Each Heru mobile app MUST have `docs/standards/mobile.md` documenting:
- Expo SDK version in use
- Bundle identifiers (iOS) and package names (Android)
- Deep link scheme and associated domains
- Redux slices and which are persisted
- Custom NativeWind tokens beyond the platform defaults
- Platforms supported (iOS only, Android only, both)
- Minimum OS versions (iOS 16+, Android API 33+)
- Any deviations from the standard stack (rare — document why)

If `docs/standards/mobile.md` does not exist, create it.
