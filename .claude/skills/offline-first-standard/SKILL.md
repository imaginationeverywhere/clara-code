---
name: offline-first-standard
description: Implement offline-first architecture for React Native with network state management, request queuing, and sync. Use when building mobile apps with offline support, data sync, or conflict resolution. Triggers on requests for offline mode, data synchronization, network handling, or mobile offline support.
---

# Offline-First Standard Skill

Enterprise-grade offline-first architecture for React Native applications. Includes network state management, offline request queuing, data synchronization, and conflict resolution patterns.

## Skill Metadata

```yaml
name: offline-first-standard
version: 1.0.0
category: mobile
dependencies:
  - @react-native-async-storage/async-storage
  - @react-native-community/netinfo
triggers:
  - offline support
  - offline-first
  - offline queue
  - data synchronization
  - network state management
```

## Architecture Overview

### Offline-First Principles

1. **Network Independence** - App works without network
2. **Local-First Data** - Data stored locally, synced when online
3. **Optimistic Updates** - UI updates immediately, syncs later
4. **Conflict Resolution** - Handle data conflicts gracefully
5. **Background Sync** - Sync data when connectivity returns

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native App                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Redux     │  │   Apollo    │  │   Offline Queue     │ │
│  │   Store     │  │   Cache     │  │   Manager           │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          ▼                                  │
│              ┌───────────────────────┐                      │
│              │   AsyncStorage        │                      │
│              │   (Persistent Store)  │                      │
│              └───────────────────────┘                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Network State Manager                    │   │
│  │  (NetInfo + Connectivity Detection + Auto-Sync)      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Network State Management

### NetworkStateProvider

```typescript
// mobile/src/providers/NetworkStateProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextValue {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  checkConnectivity: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkStateProvider({ children }: { children: React.ReactNode }) {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState(state);

      // Trigger sync when coming back online
      if (state.isConnected && state.isInternetReachable) {
        syncManager.processOfflineQueue();
      }
    });

    // Get initial state
    NetInfo.fetch().then(setNetworkState);

    return () => unsubscribe();
  }, []);

  const checkConnectivity = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  };

  const value: NetworkContextValue = {
    isOnline: networkState?.isConnected ?? false,
    isInternetReachable: networkState?.isInternetReachable ?? null,
    connectionType: networkState?.type ?? null,
    checkConnectivity,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetworkState() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkState must be used within NetworkStateProvider');
  }
  return context;
}
```

### Network-Aware Hook

```typescript
// mobile/src/hooks/useNetworkAware.ts
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNetworkState } from '../providers/NetworkStateProvider';
import { offlineQueue } from '../services/OfflineQueueManager';

interface NetworkAwareOptions {
  requiresNetwork?: boolean;
  queueIfOffline?: boolean;
  showOfflineAlert?: boolean;
}

export function useNetworkAware() {
  const { isOnline, isInternetReachable, checkConnectivity } = useNetworkState();

  const executeWithNetwork = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: NetworkAwareOptions = {}
    ): Promise<T | null> => {
      const {
        requiresNetwork = true,
        queueIfOffline = true,
        showOfflineAlert = true,
      } = options;

      // Check network status
      const hasNetwork = await checkConnectivity();

      if (!hasNetwork && requiresNetwork) {
        if (showOfflineAlert) {
          Alert.alert(
            'No Internet Connection',
            queueIfOffline
              ? 'Your request will be processed when you\'re back online.'
              : 'Please check your connection and try again.'
          );
        }

        if (queueIfOffline) {
          // Queue the operation for later
          return null;
        }

        throw new Error('Network required but not available');
      }

      return operation();
    },
    [checkConnectivity]
  );

  return {
    isOnline,
    isInternetReachable,
    executeWithNetwork,
    checkConnectivity,
  };
}
```

## Offline Queue Manager

### Complete Queue Implementation

```typescript
// mobile/src/services/OfflineQueueManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { EventEmitter } from 'events';

interface QueuedRequest {
  id: string;
  type: 'API' | 'GRAPHQL' | 'SYNC';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: number;
  retryCount: number;
  maxRetries: number;
  payload: {
    url?: string;
    method?: string;
    data?: any;
    query?: string;
    variables?: any;
  };
  metadata?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    action?: string;
  };
}

interface QueueConfig {
  maxRetries: number;
  retryDelay: number;
  maxQueueSize: number;
  persistKey: string;
}

class OfflineQueueManager extends EventEmitter {
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private isOnline = true;
  private config: QueueConfig;

  constructor(config: Partial<QueueConfig> = {}) {
    super();
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      maxQueueSize: config.maxQueueSize ?? 100,
      persistKey: config.persistKey ?? 'offline_queue',
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Load persisted queue
    await this.loadQueue();

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected === true && state.isInternetReachable === true;

      if (wasOffline && this.isOnline) {
        console.log('[OfflineQueue] Back online - processing queue');
        this.emit('online');
        this.processQueue();
      } else if (!this.isOnline) {
        this.emit('offline');
      }
    });
  }

  /**
   * Add request to queue
   */
  async enqueue(request: Omit<QueuedRequest, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      // Remove oldest low-priority items
      this.queue = this.queue
        .sort((a, b) => {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, this.config.maxQueueSize - 1);
    }

    const queuedRequest: QueuedRequest = {
      ...request,
      id: this.generateId(),
      createdAt: Date.now(),
      retryCount: 0,
      maxRetries: request.maxRetries ?? this.config.maxRetries,
    };

    this.queue.push(queuedRequest);
    await this.persistQueue();

    this.emit('enqueued', queuedRequest);
    console.log(`[OfflineQueue] Enqueued request: ${queuedRequest.id}`);

    // Try to process immediately if online
    if (this.isOnline && !this.isProcessing) {
      this.processQueue();
    }

    return queuedRequest.id;
  }

  /**
   * Process all queued requests
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.emit('processing:start', this.queue.length);

    // Sort by priority and creation time
    const sortedQueue = [...this.queue].sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : a.createdAt - b.createdAt;
    });

    const results: { success: string[]; failed: string[] } = {
      success: [],
      failed: [],
    };

    for (const request of sortedQueue) {
      try {
        await this.processRequest(request);
        results.success.push(request.id);
        this.removeFromQueue(request.id);
        this.emit('processed', request);
      } catch (error) {
        console.error(`[OfflineQueue] Failed to process ${request.id}:`, error);

        // Increment retry count
        request.retryCount++;

        if (request.retryCount >= request.maxRetries) {
          results.failed.push(request.id);
          this.removeFromQueue(request.id);
          this.emit('failed', request, error);
        } else {
          // Keep in queue for retry
          this.emit('retry', request, request.retryCount);
        }
      }

      // Small delay between requests
      await this.delay(100);
    }

    await this.persistQueue();
    this.isProcessing = false;
    this.emit('processing:complete', results);
  }

  /**
   * Process a single request
   */
  private async processRequest(request: QueuedRequest): Promise<void> {
    switch (request.type) {
      case 'API':
        await this.processApiRequest(request);
        break;
      case 'GRAPHQL':
        await this.processGraphQLRequest(request);
        break;
      case 'SYNC':
        await this.processSyncRequest(request);
        break;
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  private async processApiRequest(request: QueuedRequest): Promise<void> {
    const { url, method, data } = request.payload;
    if (!url || !method) throw new Error('Invalid API request');

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
  }

  private async processGraphQLRequest(request: QueuedRequest): Promise<void> {
    const { query, variables } = request.payload;
    if (!query) throw new Error('Invalid GraphQL request');

    // Use Apollo Client or fetch
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
  }

  private async processSyncRequest(request: QueuedRequest): Promise<void> {
    // Custom sync logic based on metadata
    const { entityType, entityId, action } = request.metadata || {};

    // Implement sync logic based on entity type
    console.log(`[OfflineQueue] Syncing ${entityType}:${entityId} (${action})`);
  }

  /**
   * Remove request from queue
   */
  private removeFromQueue(id: string): void {
    this.queue = this.queue.filter((r) => r.id !== id);
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queueSize: number;
    isProcessing: boolean;
    isOnline: boolean;
    pendingByPriority: Record<string, number>;
  } {
    const pendingByPriority = this.queue.reduce((acc, r) => {
      acc[r.priority] = (acc[r.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      isOnline: this.isOnline,
      pendingByPriority,
    };
  }

  /**
   * Get pending requests
   */
  getPendingRequests(): QueuedRequest[] {
    return [...this.queue];
  }

  /**
   * Clear all queued requests
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.persistQueue();
    this.emit('cleared');
  }

  /**
   * Persist queue to storage
   */
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.config.persistKey,
        JSON.stringify(this.queue)
      );
    } catch (error) {
      console.error('[OfflineQueue] Failed to persist queue:', error);
    }
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.config.persistKey);
      if (data) {
        this.queue = JSON.parse(data);
        console.log(`[OfflineQueue] Loaded ${this.queue.length} pending requests`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
      this.queue = [];
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueueManager();
```

## Offline-Aware API Service

### Complete Implementation

```typescript
// mobile/src/services/OfflineAwareApiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineQueue } from './OfflineQueueManager';

interface CacheConfig {
  enabled: boolean;
  ttl: number; // milliseconds
  key: string;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  fromCache: boolean;
}

class OfflineAwareApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadAuthToken();
  }

  private async loadAuthToken(): Promise<void> {
    this.authToken = await AsyncStorage.getItem('auth_token');
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    AsyncStorage.setItem('auth_token', token);
  }

  /**
   * GET request with offline support
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    cacheConfig?: CacheConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, params);
    const cacheKey = cacheConfig?.key || `cache:${url}`;

    // Try cache first
    if (cacheConfig?.enabled) {
      const cached = await this.getFromCache<T>(cacheKey);
      if (cached) {
        return { data: cached, status: 200, fromCache: true };
      }
    }

    try {
      const response = await this.fetch<T>(url, { method: 'GET' });

      // Cache successful response
      if (cacheConfig?.enabled && response.status === 200) {
        await this.setCache(cacheKey, response.data, cacheConfig.ttl);
      }

      return { ...response, fromCache: false };
    } catch (error) {
      // Return cached data if available during network errors
      if (cacheConfig?.enabled) {
        const cached = await this.getFromCache<T>(cacheKey);
        if (cached) {
          return { data: cached, status: 200, fromCache: true };
        }
      }
      throw error;
    }
  }

  /**
   * POST request with offline queueing
   */
  async post<T>(
    endpoint: string,
    data: any,
    options: { queueIfOffline?: boolean; priority?: 'HIGH' | 'MEDIUM' | 'LOW' } = {}
  ): Promise<ApiResponse<T> | { queued: true; queueId: string }> {
    const url = this.buildURL(endpoint);
    const { queueIfOffline = true, priority = 'MEDIUM' } = options;

    try {
      const response = await this.fetch<T>(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return { ...response, fromCache: false };
    } catch (error: any) {
      // Queue if offline
      if (queueIfOffline && this.isNetworkError(error)) {
        const queueId = await offlineQueue.enqueue({
          type: 'API',
          priority,
          maxRetries: 3,
          payload: {
            url,
            method: 'POST',
            data,
          },
        });

        return { queued: true, queueId };
      }
      throw error;
    }
  }

  /**
   * PUT request with offline queueing
   */
  async put<T>(
    endpoint: string,
    data: any,
    options: { queueIfOffline?: boolean; priority?: 'HIGH' | 'MEDIUM' | 'LOW' } = {}
  ): Promise<ApiResponse<T> | { queued: true; queueId: string }> {
    const url = this.buildURL(endpoint);
    const { queueIfOffline = true, priority = 'MEDIUM' } = options;

    try {
      const response = await this.fetch<T>(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return { ...response, fromCache: false };
    } catch (error: any) {
      if (queueIfOffline && this.isNetworkError(error)) {
        const queueId = await offlineQueue.enqueue({
          type: 'API',
          priority,
          maxRetries: 3,
          payload: {
            url,
            method: 'PUT',
            data,
          },
        });

        return { queued: true, queueId };
      }
      throw error;
    }
  }

  /**
   * DELETE request with offline queueing
   */
  async delete<T>(
    endpoint: string,
    options: { queueIfOffline?: boolean; priority?: 'HIGH' | 'MEDIUM' | 'LOW' } = {}
  ): Promise<ApiResponse<T> | { queued: true; queueId: string }> {
    const url = this.buildURL(endpoint);
    const { queueIfOffline = true, priority = 'HIGH' } = options; // DELETE is high priority

    try {
      const response = await this.fetch<T>(url, { method: 'DELETE' });
      return { ...response, fromCache: false };
    } catch (error: any) {
      if (queueIfOffline && this.isNetworkError(error)) {
        const queueId = await offlineQueue.enqueue({
          type: 'API',
          priority,
          maxRetries: 3,
          payload: {
            url,
            method: 'DELETE',
          },
        });

        return { queued: true, queueId };
      }
      throw error;
    }
  }

  /**
   * Core fetch method
   */
  private async fetch<T>(
    url: string,
    options: RequestInit
  ): Promise<{ data: T; status: number }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers },
    });

    if (!response.ok) {
      throw {
        status: response.status,
        message: response.statusText,
        isNetworkError: false,
      };
    }

    const data = await response.json();
    return { data, status: response.status };
  }

  /**
   * Cache operations
   */
  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);

      // Check if expired
      if (Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private async setCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await AsyncStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
          ttl,
        })
      );
    } catch (error) {
      console.error('[ApiService] Cache write failed:', error);
    }
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = `${this.baseURL}${endpoint}`;
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return `${url}?${searchParams.toString()}`;
  }

  private isNetworkError(error: any): boolean {
    return (
      error.message === 'Network request failed' ||
      error.name === 'TypeError' ||
      error.code === 'NETWORK_ERROR'
    );
  }
}

export const apiService = new OfflineAwareApiService('https://api.example.com');
```

## Redux Offline Integration

### Offline-Aware Slice

```typescript
// mobile/src/store/slices/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { offlineQueue } from '../../services/OfflineQueueManager';
import { apiService } from '../../services/OfflineAwareApiService';

interface Order {
  id: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  total: number;
  status: 'pending' | 'synced' | 'failed';
  createdAt: number;
  syncedAt?: number;
}

interface OrdersState {
  orders: Order[];
  pendingSyncCount: number;
  lastSyncAt: number | null;
  syncError: string | null;
}

const initialState: OrdersState = {
  orders: [],
  pendingSyncCount: 0,
  lastSyncAt: null,
  syncError: null,
};

// Create order (works offline)
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: Omit<Order, 'id' | 'status' | 'createdAt'>, { rejectWithValue }) => {
    const localOrder: Order = {
      ...orderData,
      id: `local-${Date.now()}`,
      status: 'pending',
      createdAt: Date.now(),
    };

    try {
      const result = await apiService.post<Order>('/orders', orderData, {
        queueIfOffline: true,
        priority: 'HIGH',
      });

      if ('queued' in result) {
        // Queued for later sync
        return { ...localOrder, status: 'pending' as const };
      }

      return { ...result.data, status: 'synced' as const };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Sync pending orders
export const syncOrders = createAsyncThunk(
  'orders/sync',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { orders: OrdersState };
    const pendingOrders = state.orders.orders.filter((o) => o.status === 'pending');

    const results: { synced: string[]; failed: string[] } = {
      synced: [],
      failed: [],
    };

    for (const order of pendingOrders) {
      try {
        const result = await apiService.post<Order>('/orders/sync', order);
        if (!('queued' in result)) {
          results.synced.push(order.id);
        }
      } catch {
        results.failed.push(order.id);
      }
    }

    return results;
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    markAsSynced: (state, action: PayloadAction<string>) => {
      const order = state.orders.find((o) => o.id === action.payload);
      if (order) {
        order.status = 'synced';
        order.syncedAt = Date.now();
      }
      state.pendingSyncCount = state.orders.filter((o) => o.status === 'pending').length;
    },

    clearSyncError: (state) => {
      state.syncError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.pendingSyncCount = state.orders.filter((o) => o.status === 'pending').length;
      })
      .addCase(syncOrders.fulfilled, (state, action) => {
        const { synced } = action.payload;
        state.orders.forEach((order) => {
          if (synced.includes(order.id)) {
            order.status = 'synced';
            order.syncedAt = Date.now();
          }
        });
        state.pendingSyncCount = state.orders.filter((o) => o.status === 'pending').length;
        state.lastSyncAt = Date.now();
      })
      .addCase(syncOrders.rejected, (state, action) => {
        state.syncError = action.payload as string;
      });
  },
});

export const { markAsSynced, clearSyncError } = ordersSlice.actions;
export default ordersSlice.reducer;
```

## Conflict Resolution

### Conflict Resolution Strategy

```typescript
// mobile/src/services/ConflictResolver.ts

interface ConflictResolution<T> {
  strategy: 'SERVER_WINS' | 'CLIENT_WINS' | 'MERGE' | 'MANUAL';
  resolve: (local: T, remote: T) => T;
}

class ConflictResolver {
  /**
   * Last-write-wins based on timestamp
   */
  static lastWriteWins<T extends { updatedAt: number }>(
    local: T,
    remote: T
  ): T {
    return local.updatedAt > remote.updatedAt ? local : remote;
  }

  /**
   * Server always wins
   */
  static serverWins<T>(_local: T, remote: T): T {
    return remote;
  }

  /**
   * Client always wins
   */
  static clientWins<T>(local: T, _remote: T): T {
    return local;
  }

  /**
   * Deep merge objects
   */
  static merge<T extends object>(local: T, remote: T): T {
    const merged = { ...remote };

    for (const key of Object.keys(local) as (keyof T)[]) {
      if (local[key] !== undefined && local[key] !== null) {
        if (typeof local[key] === 'object' && !Array.isArray(local[key])) {
          merged[key] = this.merge(
            local[key] as object,
            (remote[key] || {}) as object
          ) as T[keyof T];
        } else {
          merged[key] = local[key];
        }
      }
    }

    return merged;
  }

  /**
   * Resolve array conflicts by union
   */
  static unionArrays<T extends { id: string }>(
    local: T[],
    remote: T[]
  ): T[] {
    const merged = new Map<string, T>();

    for (const item of remote) {
      merged.set(item.id, item);
    }

    for (const item of local) {
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      } else {
        // Use last-write-wins for duplicates
        const existing = merged.get(item.id)!;
        if ('updatedAt' in item && 'updatedAt' in existing) {
          merged.set(
            item.id,
            this.lastWriteWins(
              item as T & { updatedAt: number },
              existing as T & { updatedAt: number }
            )
          );
        }
      }
    }

    return Array.from(merged.values());
  }
}

export default ConflictResolver;
```

## Sync Status UI Component

```typescript
// mobile/src/components/SyncStatusIndicator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Badge, IconButton, useTheme } from 'react-native-paper';
import { useNetworkState } from '../providers/NetworkStateProvider';
import { useAppSelector } from '../store/hooks';

export function SyncStatusIndicator() {
  const theme = useTheme();
  const { isOnline } = useNetworkState();
  const pendingSyncCount = useAppSelector(
    (state) => state.orders.pendingSyncCount
  );

  if (isOnline && pendingSyncCount === 0) {
    return null; // Don't show when everything is synced
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
          <Text style={styles.badgeText}>Offline</Text>
        </View>
      )}
      {pendingSyncCount > 0 && (
        <View
          style={[styles.badge, { backgroundColor: theme.colors.tertiary }]}
        >
          <Text style={styles.badgeText}>
            {pendingSyncCount} pending sync
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
```

## Related Skills

- **react-native-standard** - React Native core patterns
- **mobile-deployment-standard** - App deployment
- **caching-standard** - Data caching patterns

## Related Commands

- `/implement-mobile-app` - Set up mobile application
