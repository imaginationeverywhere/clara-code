---
name: realtime-updates-standard
description: Implement real-time updates with WebSockets, room-based messaging, presence tracking, and GraphQL subscriptions. Use when building live notifications, chat systems, or real-time collaboration features. Triggers on requests for WebSocket setup, real-time notifications, live updates, or GraphQL subscriptions.
---

# Real-Time Updates Standard

Production-grade real-time notification and collaboration system following DreamiHairCare's battle-tested WebSocket patterns with room-based messaging, presence tracking, and GraphQL subscriptions.

## Overview

This skill defines the standard patterns for implementing real-time updates, live collaboration, and WebSocket-based notifications in Quik Nation AI Boilerplate projects.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME UPDATE SYSTEM                       │
├─────────────────────────────────────────────────────────────────┤
│  CLIENT LAYER                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Hooks: useWebSocket, useSubscription, usePresence  │  │
│  └──────────────────────────────────┬───────────────────────┘  │
│                                     │                           │
│  TRANSPORT LAYER                    ▼                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              WebSocket Connection Manager                 │  │
│  │  ┌────────────────┐  ┌────────────────┐                  │  │
│  │  │ Auto-Reconnect │  │  Heartbeat     │                  │  │
│  │  └────────────────┘  └────────────────┘                  │  │
│  └──────────────────────────────┬───────────────────────────┘  │
│                                 │                               │
│  SERVER LAYER                   ▼                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               WebSocketService (Singleton)                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Clients   │  │    Rooms    │  │   Sessions  │      │  │
│  │  │    Map      │  │    Map      │  │     Map     │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  └──────────────────────────────┬───────────────────────────┘  │
│                                 │                               │
│  BROADCAST LAYER                ▼                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Message Types: Updates, Notifications, Presence, Typing │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Critical Interfaces

### WebSocket Client

```typescript
// backend/src/types/WebSocketTypes.ts
export interface WebSocketClient {
  id: string;
  userId?: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    connectedAt: Date;
    lastActivity: Date;
  };
}
```

### Message Types

```typescript
export interface CollaborationMessage {
  type: MessageType;
  payload: any;
  timestamp: Date;
  userId?: string;
  customerId?: string;
  broadcastTo?: 'all' | 'specific' | 'room';
  roomId?: string;
  userIds?: string[];
}

export type MessageType =
  | 'connection_established'
  | 'subscription_confirmed'
  | 'room_joined'
  | 'room_left'
  | 'ping'
  | 'pong'
  // Business messages
  | 'customer_update'
  | 'order_update'
  | 'stage_change'
  | 'inventory_update'
  // Collaboration messages
  | 'user_activity'
  | 'user_joined_room'
  | 'user_left_room'
  | 'typing_indicator'
  // Notification messages
  | 'notification'
  | 'alert'
  | 'bulk_update';
```

## WebSocket Service Implementation

### Core Service (Singleton Pattern)

```typescript
// backend/src/services/WebSocketService.ts
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map(); // roomId -> clientIds
  private userSessions: Map<string, Set<string>> = new Map(); // userId -> clientIds

  constructor() {
    this.setupHeartbeat();
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server: any): void {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this),
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 WebSocket server initialized');
  }

  /**
   * Verify client connection (authentication)
   */
  private verifyClient(info: { req: IncomingMessage }): boolean {
    // OPTIONAL: Implement authentication verification
    // For now, allow all connections
    return true;
  }

  /**
   * Handle new connection
   */
  private handleConnection(socket: WebSocket, request: IncomingMessage): void {
    const clientId = this.generateClientId();
    const url = parse(request.url || '', true);
    const token = url.query.token as string;

    console.log(`🔌 New WebSocket connection: ${clientId}`);

    const client: WebSocketClient = {
      id: clientId,
      socket,
      subscriptions: new Set(),
      metadata: {
        userAgent: request.headers['user-agent'],
        ipAddress: this.getClientIP(request),
        connectedAt: new Date(),
        lastActivity: new Date(),
      },
    };

    // Authenticate if token provided
    if (token) {
      this.authenticateClient(client, token);
    }

    this.clients.set(clientId, client);

    // Set up handlers
    socket.on('message', (data: Buffer) => this.handleMessage(clientId, data));
    socket.on('close', () => this.handleDisconnection(clientId));
    socket.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection_established',
      payload: {
        clientId,
        timestamp: new Date(),
        features: ['real_time_updates', 'collaboration', 'presence'],
      },
    });
  }

  /**
   * Authenticate client from JWT token
   */
  private async authenticateClient(client: WebSocketClient, token: string): Promise<void> {
    try {
      // Decode JWT (use proper verification in production)
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const userId = decoded.sub || decoded.userId;

      if (userId) {
        client.userId = userId;

        // Add to user sessions
        if (!this.userSessions.has(userId)) {
          this.userSessions.set(userId, new Set());
        }
        this.userSessions.get(userId)!.add(client.id);

        console.log(`🔐 Client ${client.id} authenticated as user ${userId}`);
      }
    } catch (error) {
      console.warn(`Failed to authenticate client ${client.id}:`, error);
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(clientId: string, data: Buffer): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.metadata.lastActivity = new Date();

    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscription(clientId, message.payload);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message.payload);
          break;
        case 'join_room':
          this.handleJoinRoom(clientId, message.payload.roomId);
          break;
        case 'leave_room':
          this.handleLeaveRoom(clientId, message.payload.roomId);
          break;
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', payload: { timestamp: new Date() } });
          break;
        case 'typing_indicator':
          this.handleTypingIndicator(clientId, message.payload);
          break;
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling message from client ${clientId}:`, error);
    }
  }

  // === SUBSCRIPTION HANDLING ===

  private handleSubscription(clientId: string, payload: { subscriptions: string[] }): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    payload.subscriptions.forEach(sub => client.subscriptions.add(sub));

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      payload: {
        subscriptions: Array.from(client.subscriptions),
        timestamp: new Date(),
      },
    });
  }

  private handleUnsubscription(clientId: string, payload: { subscriptions: string[] }): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    payload.subscriptions.forEach(sub => client.subscriptions.delete(sub));
  }

  // === ROOM HANDLING ===

  private handleJoinRoom(clientId: string, roomId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(clientId);

    this.sendToClient(clientId, {
      type: 'room_joined',
      payload: { roomId, timestamp: new Date() },
    });

    // Notify other room members
    this.broadcastToRoom(roomId, {
      type: 'user_joined_room',
      payload: { roomId, clientId, timestamp: new Date() },
      timestamp: new Date(),
    }, [clientId]);
  }

  private handleLeaveRoom(clientId: string, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    this.sendToClient(clientId, {
      type: 'room_left',
      payload: { roomId, timestamp: new Date() },
    });

    // Notify other room members
    this.broadcastToRoom(roomId, {
      type: 'user_left_room',
      payload: { roomId, clientId, timestamp: new Date() },
      timestamp: new Date(),
    });
  }

  // === TYPING INDICATOR ===

  private handleTypingIndicator(clientId: string, payload: { roomId: string; isTyping: boolean; field?: string }): void {
    const client = this.clients.get(clientId);
    if (!client || !client.userId) return;

    this.broadcastToRoom(payload.roomId, {
      type: 'typing_indicator',
      payload: {
        userId: client.userId,
        isTyping: payload.isTyping,
        field: payload.field,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    }, [clientId]);
  }

  // === DISCONNECTION ===

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log(`🔌 Client disconnected: ${clientId}`);

    // Remove from user sessions
    if (client.userId) {
      const userSessions = this.userSessions.get(client.userId);
      if (userSessions) {
        userSessions.delete(clientId);
        if (userSessions.size === 0) {
          this.userSessions.delete(client.userId);
        }
      }
    }

    // Remove from all rooms
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.has(clientId)) {
        room.delete(clientId);
        if (room.size === 0) {
          this.rooms.delete(roomId);
        } else {
          this.broadcastToRoom(roomId, {
            type: 'user_left_room',
            payload: { roomId, clientId, timestamp: new Date() },
            timestamp: new Date(),
          });
        }
      }
    }

    this.clients.delete(clientId);
  }

  // === PUBLIC BROADCAST METHODS ===

  /**
   * Broadcast to all connected clients
   */
  public broadcast(message: CollaborationMessage, excludeClients: string[] = []): void {
    for (const [clientId, client] of this.clients.entries()) {
      if (excludeClients.includes(clientId)) continue;

      if (client.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, message);
      }
    }
  }

  /**
   * Broadcast to specific room
   */
  public broadcastToRoom(roomId: string, message: CollaborationMessage, excludeClients: string[] = []): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const clientId of room) {
      if (excludeClients.includes(clientId)) continue;

      const client = this.clients.get(clientId);
      if (client && client.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, message);
      }
    }
  }

  /**
   * Send notification to specific user (all their connections)
   */
  public sendNotificationToUser(userId: string, notification: any): void {
    const clientIds = this.getClientIdsByUserId(userId);

    clientIds.forEach(clientId => {
      this.sendToClient(clientId, {
        type: 'notification',
        payload: notification,
        timestamp: new Date(),
      });
    });
  }

  // === BUSINESS-SPECIFIC BROADCASTS ===

  /**
   * Broadcast order update
   */
  public broadcastOrderUpdate(orderId: string, updateData: any, excludeUserId?: string): void {
    const message: CollaborationMessage = {
      type: 'order_update',
      payload: { orderId, updateData, timestamp: new Date() },
      timestamp: new Date(),
      broadcastTo: 'room',
      roomId: `order:${orderId}`,
    };

    this.broadcastToRoom(
      `order:${orderId}`,
      message,
      excludeUserId ? this.getClientIdsByUserId(excludeUserId) : []
    );
  }

  /**
   * Broadcast inventory update
   */
  public broadcastInventoryUpdate(productId: string, newQuantity: number): void {
    const message: CollaborationMessage = {
      type: 'inventory_update',
      payload: { productId, newQuantity, timestamp: new Date() },
      timestamp: new Date(),
      broadcastTo: 'all',
    };

    this.broadcast(message);
  }

  /**
   * Broadcast customer update to viewers
   */
  public broadcastCustomerUpdate(customerId: string, updateData: any, excludeUserId?: string): void {
    const message: CollaborationMessage = {
      type: 'customer_update',
      payload: { customerId, updateData, timestamp: new Date() },
      timestamp: new Date(),
      broadcastTo: 'room',
      roomId: `customer:${customerId}`,
    };

    this.broadcastToRoom(
      `customer:${customerId}`,
      message,
      excludeUserId ? this.getClientIdsByUserId(excludeUserId) : []
    );
  }

  // === HELPER METHODS ===

  private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) return;

    try {
      client.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message to client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    }
  }

  private getClientIdsByUserId(userId: string): string[] {
    return Array.from(this.userSessions.get(userId) || []);
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(request: IncomingMessage): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0];
    }
    return request.socket.remoteAddress || 'unknown';
  }

  // === HEARTBEAT / KEEPALIVE ===

  private setupHeartbeat(): void {
    setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.socket.readyState === WebSocket.OPEN) {
          const now = new Date();
          const inactiveTime = now.getTime() - client.metadata.lastActivity.getTime();

          // Ping if inactive for 30 seconds
          if (inactiveTime > 30000) {
            this.sendToClient(clientId, { type: 'ping', payload: { timestamp: now } });
          }

          // Disconnect if inactive for 5 minutes
          if (inactiveTime > 300000) {
            console.log(`Disconnecting inactive client: ${clientId}`);
            client.socket.terminate();
            this.handleDisconnection(clientId);
          }
        } else {
          this.handleDisconnection(clientId);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  // === STATS / MONITORING ===

  public getStats(): {
    userCount: number;
    totalConnections: number;
    activeRooms: number;
    roomStats: { roomId: string; clientCount: number }[];
  } {
    return {
      userCount: this.userSessions.size,
      totalConnections: this.clients.size,
      activeRooms: this.rooms.size,
      roomStats: Array.from(this.rooms.entries()).map(([roomId, clients]) => ({
        roomId,
        clientCount: clients.size,
      })),
    };
  }

  public isUserOnline(userId: string): boolean {
    return this.userSessions.has(userId);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.userSessions.keys());
  }

  public getUsersInRoom(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const userIds: string[] = [];
    for (const clientId of room) {
      const client = this.clients.get(clientId);
      if (client?.userId) {
        userIds.push(client.userId);
      }
    }

    return [...new Set(userIds)];
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
```

## Server Integration

### Express Server Setup

```typescript
// backend/src/index.ts
import express from 'express';
import { createServer } from 'http';
import { webSocketService } from './services/WebSocketService';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket on the HTTP server
webSocketService.initialize(httpServer);

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
});
```

## Frontend Integration

### React WebSocket Hook

```typescript
// frontend/src/hooks/useWebSocket.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp?: Date;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const { getToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());

  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const token = await getToken();
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws${token ? `?token=${token}` : ''}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Handle pong
          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: new Date() } }));
            return;
          }

          // Call registered handlers
          const handlers = messageHandlersRef.current.get(message.type);
          if (handlers) {
            handlers.forEach(handler => handler(message.payload));
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(connect, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [getToken, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const subscribe = useCallback((types: string[]) => {
    send('subscribe', { subscriptions: types });
  }, [send]);

  const unsubscribe = useCallback((types: string[]) => {
    send('unsubscribe', { subscriptions: types });
  }, [send]);

  const joinRoom = useCallback((roomId: string) => {
    send('join_room', { roomId });
  }, [send]);

  const leaveRoom = useCallback((roomId: string) => {
    send('leave_room', { roomId });
  }, [send]);

  const onMessage = useCallback((type: string, handler: (payload: any) => void) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, new Set());
    }
    messageHandlersRef.current.get(type)!.add(handler);

    // Return cleanup function
    return () => {
      messageHandlersRef.current.get(type)?.delete(handler);
    };
  }, []);

  const sendTypingIndicator = useCallback((roomId: string, isTyping: boolean, field?: string) => {
    send('typing_indicator', { roomId, isTyping, field });
  }, [send]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    joinRoom,
    leaveRoom,
    onMessage,
    sendTypingIndicator,
  };
}
```

### Presence Hook

```typescript
// frontend/src/hooks/usePresence.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface PresenceUser {
  id: string;
  name?: string;
  avatar?: string;
  lastSeen: Date;
  isTyping?: boolean;
  typingField?: string;
}

export function usePresence(roomId: string) {
  const { isConnected, joinRoom, leaveRoom, onMessage, sendTypingIndicator } = useWebSocket();
  const [users, setUsers] = useState<Map<string, PresenceUser>>(new Map());

  useEffect(() => {
    if (!isConnected || !roomId) return;

    // Join room
    joinRoom(roomId);

    // Handle user joined
    const cleanupJoined = onMessage('user_joined_room', (payload) => {
      if (payload.roomId === roomId) {
        setUsers(prev => {
          const next = new Map(prev);
          next.set(payload.userId, {
            id: payload.userId,
            lastSeen: new Date(payload.timestamp),
          });
          return next;
        });
      }
    });

    // Handle user left
    const cleanupLeft = onMessage('user_left_room', (payload) => {
      if (payload.roomId === roomId) {
        setUsers(prev => {
          const next = new Map(prev);
          next.delete(payload.userId);
          return next;
        });
      }
    });

    // Handle typing indicator
    const cleanupTyping = onMessage('typing_indicator', (payload) => {
      setUsers(prev => {
        const next = new Map(prev);
        const user = next.get(payload.userId);
        if (user) {
          next.set(payload.userId, {
            ...user,
            isTyping: payload.isTyping,
            typingField: payload.field,
            lastSeen: new Date(),
          });
        }
        return next;
      });
    });

    // Cleanup
    return () => {
      leaveRoom(roomId);
      cleanupJoined();
      cleanupLeft();
      cleanupTyping();
    };
  }, [isConnected, roomId, joinRoom, leaveRoom, onMessage]);

  const setTyping = useCallback((isTyping: boolean, field?: string) => {
    sendTypingIndicator(roomId, isTyping, field);
  }, [roomId, sendTypingIndicator]);

  return {
    users: Array.from(users.values()),
    setTyping,
    isConnected,
  };
}
```

### Real-Time Updates Hook

```typescript
// frontend/src/hooks/useRealtimeUpdates.ts
'use client';

import { useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

type UpdateHandler<T> = (data: T) => void;

export function useRealtimeUpdates<T>(
  entityType: 'order' | 'customer' | 'product' | 'inventory',
  entityId: string,
  onUpdate: UpdateHandler<T>
) {
  const { isConnected, joinRoom, leaveRoom, onMessage } = useWebSocket();

  useEffect(() => {
    if (!isConnected || !entityId) return;

    const roomId = `${entityType}:${entityId}`;

    // Join entity room
    joinRoom(roomId);

    // Handle updates
    const cleanup = onMessage(`${entityType}_update`, (payload) => {
      if (payload[`${entityType}Id`] === entityId) {
        onUpdate(payload.updateData);
      }
    });

    return () => {
      leaveRoom(roomId);
      cleanup();
    };
  }, [isConnected, entityType, entityId, joinRoom, leaveRoom, onMessage, onUpdate]);
}

// Usage example:
// useRealtimeUpdates('order', orderId, (data) => {
//   setOrder(prev => ({ ...prev, ...data }));
// });
```

## GraphQL Subscriptions (Alternative)

### Apollo Server Setup

```typescript
// backend/src/graphql/subscriptions.ts
import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

// Event types
export const EVENTS = {
  ORDER_UPDATED: 'ORDER_UPDATED',
  INVENTORY_CHANGED: 'INVENTORY_CHANGED',
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
};

// Publish helpers
export const publishOrderUpdate = (orderId: string, data: any) => {
  pubsub.publish(EVENTS.ORDER_UPDATED, { orderUpdated: { orderId, ...data } });
};

export const publishInventoryChange = (productId: string, newQuantity: number) => {
  pubsub.publish(EVENTS.INVENTORY_CHANGED, {
    inventoryChanged: { productId, newQuantity },
  });
};
```

### Subscription Resolvers

```typescript
// backend/src/graphql/resolvers/subscriptionResolvers.ts
import { pubsub, EVENTS } from '../subscriptions';
import { withFilter } from 'graphql-subscriptions';

export const subscriptionResolvers = {
  Subscription: {
    orderUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([EVENTS.ORDER_UPDATED]),
        (payload, variables) => {
          return payload.orderUpdated.orderId === variables.orderId;
        }
      ),
    },

    inventoryChanged: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([EVENTS.INVENTORY_CHANGED]),
        (payload, variables) => {
          // Optionally filter by productId
          if (variables.productId) {
            return payload.inventoryChanged.productId === variables.productId;
          }
          return true;
        }
      ),
    },

    notificationCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([EVENTS.NOTIFICATION_CREATED]),
        (payload, variables, context) => {
          // Only send to target user
          return payload.notificationCreated.userId === context.auth?.userId;
        }
      ),
    },
  },
};
```

### GraphQL Schema

```graphql
# backend/src/graphql/schema/subscriptions.graphql
type OrderUpdatePayload {
  orderId: ID!
  status: OrderStatus
  paymentStatus: PaymentStatus
  trackingNumber: String
  updatedAt: DateTime!
}

type InventoryChangePayload {
  productId: ID!
  newQuantity: Int!
  previousQuantity: Int
  timestamp: DateTime!
}

type NotificationPayload {
  id: ID!
  type: String!
  title: String!
  message: String!
  userId: ID!
  createdAt: DateTime!
}

type Subscription {
  orderUpdated(orderId: ID!): OrderUpdatePayload!
  inventoryChanged(productId: ID): InventoryChangePayload!
  notificationCreated: NotificationPayload!
}
```

## Environment Variables

```bash
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:4000

# For production with SSL
NEXT_PUBLIC_WS_URL=wss://api.example.com

# Heartbeat Configuration
WS_HEARTBEAT_INTERVAL=30000  # 30 seconds
WS_INACTIVE_TIMEOUT=300000   # 5 minutes
```

## Quality Checklist

### Server Setup
- [ ] WebSocket server initialized on HTTP server
- [ ] Authentication/token verification implemented
- [ ] Heartbeat/keepalive mechanism active
- [ ] Client disconnection cleanup working
- [ ] Room management functional

### Client Setup
- [ ] Auto-reconnect implemented
- [ ] Token passed on connection
- [ ] Pong response to ping
- [ ] Message handlers registered
- [ ] Cleanup on unmount

### Features
- [ ] Room-based messaging working
- [ ] Presence tracking functional
- [ ] Typing indicators working
- [ ] Broadcast to all clients
- [ ] Broadcast to specific users

### Monitoring
- [ ] Connection stats available
- [ ] User online status trackable
- [ ] Room membership queryable
- [ ] Error logging in place

## Related Skills

- **email-notifications-standard** - Email notification patterns
- **sms-notifications-standard** - SMS notification patterns
- **order-management-standard** - Order update triggers
