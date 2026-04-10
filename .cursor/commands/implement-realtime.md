# Implement Real-Time Updates

Implement production-grade real-time update system following DreamiHairCare's battle-tested WebSocket patterns with room-based messaging, presence tracking, and live collaboration.

## Command Usage

```
/implement-realtime [options]
```

### Options
- `--full` - Complete real-time stack (WebSocket + subscriptions) (default)
- `--websocket-only` - WebSocket server only
- `--subscriptions-only` - GraphQL subscriptions only
- `--frontend-only` - Frontend hooks only (requires backend)
- `--audit` - Audit existing implementation against standards

### Feature Options
- `--with-presence` - Include user presence tracking
- `--with-typing` - Include typing indicators
- `--with-rooms` - Include room-based messaging
- `--with-reconnect` - Include auto-reconnection logic

## Pre-Implementation Checklist

- [ ] Express.js server running
- [ ] HTTP server accessible (for WebSocket upgrade)
- [ ] Authentication system (Clerk/JWT) configured
- [ ] Frontend can make WebSocket connections

### Environment Variables
```bash
# Backend
WS_PATH=/ws
WS_HEARTBEAT_INTERVAL=30000
WS_INACTIVE_TIMEOUT=300000

# Frontend
NEXT_PUBLIC_WS_URL=ws://localhost:4000
# Production: wss://api.example.com
```

## Implementation Phases

### Phase 1: WebSocket Server Setup

#### Install Dependencies
```bash
# Backend
npm install ws

# Types (if using TypeScript)
npm install -D @types/ws
```

#### Server Integration
```typescript
// backend/src/index.ts
import express from 'express';
import { createServer } from 'http';
import { webSocketService } from './services/WebSocketService';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket on the same HTTP server
webSocketService.initialize(httpServer);

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
});
```

### Phase 2: WebSocket Service

```typescript
// backend/src/services/WebSocketService.ts
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

interface WebSocketClient {
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

interface Message {
  type: string;
  payload: any;
  timestamp?: Date;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();

  constructor() {
    this.setupHeartbeat();
  }

  initialize(server: any): void {
    this.wss = new WebSocketServer({
      server,
      path: process.env.WS_PATH || '/ws',
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 WebSocket server initialized');
  }

  private handleConnection(socket: WebSocket, request: IncomingMessage): void {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      console.error(`WebSocket error for ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Send welcome
    this.sendToClient(clientId, {
      type: 'connection_established',
      payload: { clientId, timestamp: new Date() },
    });
  }

  private authenticateClient(client: WebSocketClient, token: string): void {
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const userId = decoded.sub || decoded.userId;

      if (userId) {
        client.userId = userId;
        if (!this.userSessions.has(userId)) {
          this.userSessions.set(userId, new Set());
        }
        this.userSessions.get(userId)!.add(client.id);
        console.log(`🔐 Client ${client.id} authenticated as ${userId}`);
      }
    } catch (error) {
      console.warn(`Auth failed for ${client.id}:`, error);
    }
  }

  private handleMessage(clientId: string, data: Buffer): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.metadata.lastActivity = new Date();

    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, message.payload.subscriptions);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(clientId, message.payload.subscriptions);
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
      console.error(`Message handling error for ${clientId}:`, error);
    }
  }

  // === ROOM MANAGEMENT ===

  private handleJoinRoom(clientId: string, roomId: string): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(clientId);

    this.sendToClient(clientId, {
      type: 'room_joined',
      payload: { roomId, timestamp: new Date() },
    });

    // Notify others
    this.broadcastToRoom(roomId, {
      type: 'user_joined_room',
      payload: { roomId, clientId, timestamp: new Date() },
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

    // Notify others
    this.broadcastToRoom(roomId, {
      type: 'user_left_room',
      payload: { roomId, clientId, timestamp: new Date() },
    });
  }

  private handleTypingIndicator(clientId: string, payload: { roomId: string; isTyping: boolean; field?: string }): void {
    const client = this.clients.get(clientId);
    if (!client?.userId) return;

    this.broadcastToRoom(payload.roomId, {
      type: 'typing_indicator',
      payload: {
        userId: client.userId,
        isTyping: payload.isTyping,
        field: payload.field,
        timestamp: new Date(),
      },
    }, [clientId]);
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log(`🔌 Client disconnected: ${clientId}`);

    // Remove from user sessions
    if (client.userId) {
      const sessions = this.userSessions.get(client.userId);
      if (sessions) {
        sessions.delete(clientId);
        if (sessions.size === 0) {
          this.userSessions.delete(client.userId);
        }
      }
    }

    // Remove from rooms
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.has(clientId)) {
        room.delete(clientId);
        if (room.size === 0) {
          this.rooms.delete(roomId);
        } else {
          this.broadcastToRoom(roomId, {
            type: 'user_left_room',
            payload: { roomId, clientId, timestamp: new Date() },
          });
        }
      }
    }

    this.clients.delete(clientId);
  }

  // === PUBLIC METHODS ===

  public broadcast(message: Message, excludeClients: string[] = []): void {
    for (const [clientId, client] of this.clients.entries()) {
      if (excludeClients.includes(clientId)) continue;
      if (client.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, message);
      }
    }
  }

  public broadcastToRoom(roomId: string, message: Message, excludeClients: string[] = []): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const clientId of room) {
      if (excludeClients.includes(clientId)) continue;
      const client = this.clients.get(clientId);
      if (client?.socket.readyState === WebSocket.OPEN) {
        this.sendToClient(clientId, message);
      }
    }
  }

  public sendToUser(userId: string, message: Message): void {
    const clientIds = this.userSessions.get(userId);
    if (!clientIds) return;

    for (const clientId of clientIds) {
      this.sendToClient(clientId, message);
    }
  }

  // Business-specific broadcasts
  public broadcastOrderUpdate(orderId: string, data: any): void {
    this.broadcastToRoom(`order:${orderId}`, {
      type: 'order_update',
      payload: { orderId, ...data, timestamp: new Date() },
    });
  }

  public broadcastInventoryUpdate(productId: string, newQuantity: number): void {
    this.broadcast({
      type: 'inventory_update',
      payload: { productId, newQuantity, timestamp: new Date() },
    });
  }

  // === HELPERS ===

  private sendToClient(clientId: string, message: Message): void {
    const client = this.clients.get(clientId);
    if (!client || client.socket.readyState !== WebSocket.OPEN) return;

    try {
      client.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Send failed for ${clientId}:`, error);
      this.handleDisconnection(clientId);
    }
  }

  private getClientIP(request: IncomingMessage): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0];
    return request.socket.remoteAddress || 'unknown';
  }

  private setupHeartbeat(): void {
    const interval = Number(process.env.WS_HEARTBEAT_INTERVAL) || 30000;
    const timeout = Number(process.env.WS_INACTIVE_TIMEOUT) || 300000;

    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((client, clientId) => {
        if (client.socket.readyState !== WebSocket.OPEN) {
          this.handleDisconnection(clientId);
          return;
        }

        const inactiveTime = now - client.metadata.lastActivity.getTime();

        if (inactiveTime > timeout) {
          console.log(`Disconnecting inactive client: ${clientId}`);
          client.socket.terminate();
          this.handleDisconnection(clientId);
        } else if (inactiveTime > interval) {
          this.sendToClient(clientId, { type: 'ping', payload: { timestamp: new Date() } });
        }
      });
    }, interval);
  }

  // === STATS ===

  public getStats() {
    return {
      totalConnections: this.clients.size,
      authenticatedUsers: this.userSessions.size,
      activeRooms: this.rooms.size,
    };
  }

  public isUserOnline(userId: string): boolean {
    return this.userSessions.has(userId);
  }
}

export const webSocketService = new WebSocketService();
```

### Phase 3: Frontend React Hooks

#### useWebSocket Hook
```typescript
// frontend/src/hooks/useWebSocket.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface UseWebSocketReturn {
  isConnected: boolean;
  send: (type: string, payload: any) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  onMessage: (type: string, handler: (payload: any) => void) => () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const { getToken } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const handlersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());

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
          const message = JSON.parse(event.data);

          if (message.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', payload: { timestamp: new Date() } }));
            return;
          }

          const handlers = handlersRef.current.get(message.type);
          handlers?.forEach(handler => handler(message.payload));
        } catch (error) {
          console.error('Message parse error:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        if (reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current++;
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = (error) => console.error('WebSocket error:', error);
      wsRef.current = ws;
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }, [getToken]);

  const send = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const joinRoom = useCallback((roomId: string) => send('join_room', { roomId }), [send]);
  const leaveRoom = useCallback((roomId: string) => send('leave_room', { roomId }), [send]);

  const onMessage = useCallback((type: string, handler: (payload: any) => void) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);

    return () => handlersRef.current.get(type)?.delete(handler);
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  return { isConnected, send, joinRoom, leaveRoom, onMessage };
}
```

#### useRealtimeOrder Hook
```typescript
// frontend/src/hooks/useRealtimeOrder.ts
'use client';

import { useEffect, useCallback, useState } from 'react';
import { useWebSocket } from './useWebSocket';

export function useRealtimeOrder(orderId: string) {
  const { isConnected, joinRoom, leaveRoom, onMessage } = useWebSocket();
  const [orderUpdates, setOrderUpdates] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected || !orderId) return;

    joinRoom(`order:${orderId}`);

    const cleanup = onMessage('order_update', (payload) => {
      if (payload.orderId === orderId) {
        setOrderUpdates(prev => [...prev, payload]);
      }
    });

    return () => {
      leaveRoom(`order:${orderId}`);
      cleanup();
    };
  }, [isConnected, orderId, joinRoom, leaveRoom, onMessage]);

  return { orderUpdates, isConnected };
}
```

### Phase 4: Integration with Business Logic

```typescript
// backend/src/graphql/resolvers/orderResolvers.ts
import { webSocketService } from '../../services/WebSocketService';

export const orderResolvers = {
  Mutation: {
    updateOrderStatus: async (_, { id, status }, context) => {
      const order = await Order.findByPk(id);
      if (!order) throw new Error('Order not found');

      await order.update({ status });

      // Broadcast real-time update
      webSocketService.broadcastOrderUpdate(id, {
        status,
        updatedAt: new Date(),
        updatedBy: context.auth?.userId,
      });

      return order;
    },

    updateInventory: async (_, { productId, quantity }, context) => {
      const product = await Product.findByPk(productId);
      if (!product) throw new Error('Product not found');

      await product.update({ stockQuantity: quantity });

      // Broadcast to all clients
      webSocketService.broadcastInventoryUpdate(productId, quantity);

      return product;
    },
  },
};
```

## GraphQL Subscriptions (Alternative)

If you prefer GraphQL subscriptions over raw WebSockets:

```typescript
// backend/src/graphql/subscriptions.ts
import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const EVENTS = {
  ORDER_UPDATED: 'ORDER_UPDATED',
  INVENTORY_CHANGED: 'INVENTORY_CHANGED',
};
```

```graphql
type Subscription {
  orderUpdated(orderId: ID!): OrderUpdatePayload!
  inventoryChanged(productId: ID): InventoryChangePayload!
}
```

## Verification Checklist

### Backend
- [ ] WebSocket server starts with HTTP server
- [ ] Client connections accepted
- [ ] Authentication from token working
- [ ] Room join/leave working
- [ ] Heartbeat keeping connections alive
- [ ] Broadcasts reaching correct clients

### Frontend
- [ ] WebSocket connects on page load
- [ ] Token passed for authentication
- [ ] Auto-reconnect on disconnect
- [ ] Room joining working
- [ ] Messages received and handled

### Integration
- [ ] Order updates broadcast in real-time
- [ ] Inventory changes broadcast to all
- [ ] Presence tracking working
- [ ] Typing indicators working

## Related Skills

- **realtime-updates-standard** - Full WebSocket patterns
- **email-notifications-standard** - Email notification patterns
- **sms-notifications-standard** - SMS notification patterns
- **order-management-standard** - Order event triggers
