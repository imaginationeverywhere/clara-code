---
name: react-native-standard
description: Implement React Native mobile apps with TypeScript, Redux Toolkit, Apollo Client, and React Navigation. Use when building cross-platform mobile apps, implementing navigation, or mobile state management. Triggers on requests for React Native, mobile app development, cross-platform apps, or mobile navigation.
---

# React Native Standard Skill

Enterprise-grade React Native development patterns for cross-platform mobile applications. Includes TypeScript, Redux Toolkit, Apollo Client, React Navigation, and platform-specific optimizations.

## Skill Metadata

```yaml
name: react-native-standard
version: 1.0.0
category: mobile
dependencies:
  - react-native
  - react-native-paper
  - @react-navigation/native
  - @reduxjs/toolkit
  - @apollo/client
triggers:
  - React Native development
  - mobile app setup
  - cross-platform mobile
  - iOS and Android
  - mobile component patterns
```

## Architecture Overview

### Project Structure

```
mobile/
├── android/                    # Android native code
├── ios/                        # iOS native code
├── src/
│   ├── App.tsx                 # Root application component
│   ├── components/
│   │   ├── common/             # Shared UI components
│   │   ├── forms/              # Form components
│   │   └── navigation/         # Navigation components
│   ├── screens/                # Screen components
│   ├── navigation/             # Navigation configuration
│   ├── store/                  # Redux store and slices
│   ├── services/               # API and business logic
│   ├── graphql/                # GraphQL queries and mutations
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   └── theme/                  # Theming and styling
├── __tests__/                  # Test files
├── package.json
├── metro.config.js
├── babel.config.js
└── tsconfig.json
```

## App Entry Point

### Root Component Pattern

```typescript
// mobile/src/App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { store, persistor } from './store/store';
import { apolloClient } from './services/apollo';
import { AppNavigator } from './navigation/AppNavigator';
import { theme } from './theme/theme';
import { LoadingScreen } from './components/common/LoadingScreen';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <ApolloProvider client={apolloClient}>
              <PaperProvider theme={theme}>
                <StatusBar
                  barStyle="dark-content"
                  backgroundColor={theme.colors.surface}
                />
                <AppNavigator />
              </PaperProvider>
            </ApolloProvider>
          </PersistGate>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
```

## Navigation

### React Navigation Setup

```typescript
// mobile/src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';

// Type definitions
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Bottom Tab Navigator
function MainTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Products: focused ? 'store' : 'store-outline',
            Cart: focused ? 'cart' : 'cart-outline',
            Profile: focused ? 'account' : 'account-outline',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ headerShown: true, title: 'Product' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ headerShown: true, title: 'Checkout' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Type-Safe Navigation Hook

```typescript
// mobile/src/hooks/useAppNavigation.ts
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';

export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, T>>();
}

// Usage
function ProductCard({ product }: { product: Product }) {
  const navigation = useAppNavigation();

  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* ... */}
    </TouchableOpacity>
  );
}
```

## Redux State Management

### Store Configuration with Persist

```typescript
// mobile/src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import preferencesReducer from './slices/preferencesSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: ['cart', 'auth', 'preferences'], // Only persist these
  blacklist: [], // Never persist these
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  preferences: preferencesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

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

### Typed Redux Hooks

```typescript
// mobile/src/store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Redux Slice Pattern

```typescript
// mobile/src/store/slices/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: CartState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const syncCart = createAsyncThunk(
  'cart/sync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState; auth: { userId: string } };
      const response = await cartApi.sync({
        userId: state.auth.userId,
        items: state.cart.items,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existing = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      state.total = calculateTotal(state.items);
      state.lastUpdated = Date.now();
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      state.total = calculateTotal(state.items);
      state.lastUpdated = Date.now();
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) => i.productId === action.payload.productId
      );
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter(
            (i) => i.productId !== action.payload.productId
          );
        }
      }
      state.total = calculateTotal(state.items);
      state.lastUpdated = Date.now();
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.lastUpdated = Date.now();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(syncCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.lastUpdated = Date.now();
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export const { addItem, removeItem, updateQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.total;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
```

## Component Patterns

### Screen Component Pattern

```typescript
// mobile/src/screens/ProductsScreen.tsx
import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme, Searchbar, Text } from 'react-native-paper';
import { useQuery } from '@apollo/client';
import { useAppDispatch } from '../store/hooks';
import { addItem } from '../store/slices/cartSlice';
import { GET_PRODUCTS } from '../graphql/queries/products';
import ProductCard from '../components/ProductCard';
import ErrorView from '../components/common/ErrorView';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function ProductsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: { limit: 50 },
    notifyOnNetworkStatusChange: true,
  });

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    if (!searchQuery.trim()) return data.products;

    return data.products.filter((product: Product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data?.products, searchQuery]);

  // Stable callback for adding to cart
  const handleAddToCart = useCallback(
    (product: Product) => {
      dispatch(
        addItem({
          id: `cart-${product.id}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
        })
      );
    },
    [dispatch]
  );

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Render item with stable reference
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onAddToCart={() => handleAddToCart(item)} />
    ),
    [handleAddToCart]
  );

  // Key extractor
  const keyExtractor = useCallback((item: Product) => item.id, []);

  if (loading && !data) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No products found</Text>
          </View>
        }
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        getItemLayout={(_, index) => ({
          length: 200,
          offset: 200 * Math.floor(index / 2),
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
  },
});
```

### Reusable Component Pattern

```typescript
// mobile/src/components/ProductCard.tsx
import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { useAppNavigation } from '../hooks/useAppNavigation';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(
  ({ product, onAddToCart }) => {
    const theme = useTheme();
    const navigation = useAppNavigation();

    const handlePress = () => {
      navigation.navigate('ProductDetail', { productId: product.id });
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Card style={styles.card}>
          <FastImage
            source={{
              uri: product.imageUrl,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
          <Card.Content style={styles.content}>
            <Text variant="titleSmall" numberOfLines={2} style={styles.name}>
              {product.name}
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              ${product.price.toFixed(2)}
            </Text>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              compact
              onPress={onAddToCart}
              icon="cart-plus"
            >
              Add
            </Button>
          </Card.Actions>
        </Card>
      </TouchableOpacity>
    );
  },
  // Custom comparison for memo
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price
    );
  }
);

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: 12,
  },
  image: {
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    paddingVertical: 8,
  },
  name: {
    marginBottom: 4,
    height: 36,
  },
  actions: {
    paddingTop: 0,
  },
});

export default ProductCard;
```

## Apollo Client Integration

### Apollo Client Setup

```typescript
// mobile/src/services/apollo.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// HTTP Link
const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
});

// Auth Link
const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('auth_token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Apollo Client
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            // Merge paginated results
            keyArgs: ['category', 'search'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
});
```

### GraphQL Queries

```typescript
// mobile/src/graphql/queries/products.ts
import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($limit: Int, $offset: Int, $category: String) {
    products(limit: $limit, offset: $offset, category: $category) {
      id
      name
      description
      price
      imageUrl
      inStock
      category {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      imageUrl
      inStock
      category {
        id
        name
      }
      variants {
        id
        name
        price
        inStock
      }
    }
  }
`;
```

## Theming

### Theme Configuration

```typescript
// mobile/src/theme/theme.ts
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'System',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    primaryContainer: '#EADDFF',
    secondary: '#625B71',
    secondaryContainer: '#E8DEF8',
    tertiary: '#7D5260',
    tertiaryContainer: '#FFD8E4',
    error: '#BA1A1A',
    errorContainer: '#FFDAD6',
    background: '#FFFBFE',
    surface: '#FFFBFE',
    surfaceVariant: '#E7E0EC',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#21005D',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#1D192B',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#31111D',
    onError: '#FFFFFF',
    onErrorContainer: '#410002',
    onBackground: '#1C1B1F',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    primaryContainer: '#4F378B',
    secondary: '#CCC2DC',
    secondaryContainer: '#4A4458',
    background: '#1C1B1F',
    surface: '#1C1B1F',
    onPrimary: '#381E72',
    onPrimaryContainer: '#EADDFF',
    onBackground: '#E6E1E5',
    onSurface: '#E6E1E5',
  },
  fonts: configureFonts({ config: fontConfig }),
};

export const theme = lightTheme;
```

## Performance Optimization

### FlatList Optimization

```typescript
// Optimized FlatList configuration
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  // Performance props
  removeClippedSubviews={true}        // Remove off-screen items
  maxToRenderPerBatch={10}            // Batch render limit
  updateCellsBatchingPeriod={50}      // Batch update interval
  windowSize={5}                       // Viewport size
  initialNumToRender={10}             // Initial render count
  // Optional layout optimization
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Image Optimization with FastImage

```typescript
// mobile/src/components/OptimizedImage.tsx
import React from 'react';
import FastImage, { FastImageProps } from 'react-native-fast-image';

interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  uri: string;
  priority?: 'low' | 'normal' | 'high';
}

export function OptimizedImage({
  uri,
  priority = 'normal',
  ...props
}: OptimizedImageProps) {
  return (
    <FastImage
      {...props}
      source={{
        uri,
        priority: FastImage.priority[priority],
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
}

// Preload critical images
FastImage.preload([
  { uri: 'https://example.com/hero.jpg' },
  { uri: 'https://example.com/logo.png' },
]);
```

### Memoization Patterns

```typescript
// Use React.memo for list items
const ListItem = React.memo(({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(item.id)}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
});

// Use useMemo for expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);

// Use useCallback for stable function references
const handlePress = useCallback((id: string) => {
  navigation.navigate('Detail', { id });
}, [navigation]);
```

## Testing

### Component Testing

```typescript
// __tests__/components/ProductCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import ProductCard from '../../src/components/ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 29.99,
  imageUrl: 'https://example.com/image.jpg',
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<PaperProvider>{component}</PaperProvider>);
};

describe('ProductCard', () => {
  it('renders product information', () => {
    const { getByText } = renderWithProvider(
      <ProductCard product={mockProduct} onAddToCart={jest.fn()} />
    );

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('$29.99')).toBeTruthy();
  });

  it('calls onAddToCart when button pressed', () => {
    const onAddToCart = jest.fn();
    const { getByText } = renderWithProvider(
      <ProductCard product={mockProduct} onAddToCart={onAddToCart} />
    );

    fireEvent.press(getByText('Add'));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });
});
```

## Related Skills

- **offline-first-standard** - Offline sync and queue patterns
- **mobile-deployment-standard** - App store deployment
- **redux-persist-state-manager** - State persistence patterns

## Related Commands

- `/implement-mobile-app` - Set up mobile application
