# Food Delivery Standard

Uber Eats-like food delivery platform with restaurant management, order routing, and real-time tracking.

## Target Projects
- **Quik Delivers** - Food and non-food delivery platform

## Core Components

### 1. Restaurant Management

```typescript
interface Restaurant {
  id: string;
  tenantId: string;
  ownerId: string;

  // Basic info
  name: string;
  description: string;
  cuisineTypes: string[];
  priceRange: 1 | 2 | 3 | 4;       // $ to $$$$

  // Location
  address: Address;
  coordinates: { lat: number; lng: number };
  deliveryRadius: number;          // km
  deliveryZones: DeliveryZone[];

  // Contact
  phone: string;
  email: string;

  // Hours
  operatingHours: OperatingHours[];
  holidaySchedule: HolidaySchedule[];
  acceptingOrders: boolean;
  temporarilyClosed: boolean;
  closedReason?: string;

  // Menu
  menuCategories: MenuCategory[];
  featuredItems: string[];

  // Settings
  settings: RestaurantSettings;

  // Ratings
  rating: number;
  totalRatings: number;
  totalOrders: number;

  // Media
  logo: string;
  coverImage: string;
  gallery: string[];

  // Status
  status: 'pending' | 'active' | 'suspended' | 'closed';
  verifiedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

interface RestaurantSettings {
  minOrderAmount: number;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  preparationTime: number;         // minutes
  acceptsScheduledOrders: boolean;
  maxAdvanceOrderDays: number;
  autoAcceptOrders: boolean;
  tipSuggestions: number[];
  packagingFee?: number;
}

interface DeliveryZone {
  id: string;
  name: string;
  polygon: GeoPolygon;
  deliveryFee: number;
  estimatedTime: number;           // minutes
  minOrder?: number;
}
```

### 2. Menu Management

```typescript
interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  sortOrder: number;
  availabilityHours?: TimeRange[];  // If category-specific hours
  items: MenuItem[];
  isActive: boolean;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;

  // Customization
  modifierGroups: ModifierGroup[];
  specialInstructions: boolean;

  // Dietary info
  dietary: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    halal?: boolean;
    kosher?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
  };

  // Nutrition
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    allergens?: string[];
  };

  // Media
  image?: string;
  gallery?: string[];

  // Availability
  available: boolean;
  availabilityHours?: TimeRange[];
  stockCount?: number;             // If limited

  // Popularity
  orderCount: number;
  rating?: number;

  // Flags
  featured: boolean;
  popular: boolean;
  isNew: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;

  sortOrder: number;
}

interface ModifierGroup {
  id: string;
  name: string;                    // "Size", "Toppings", "Sides"
  required: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: Modifier[];
}

interface Modifier {
  id: string;
  name: string;
  price: number;                   // Additional cost
  isDefault: boolean;
  available: boolean;
}
```

### 3. Order Management

```typescript
interface FoodOrder {
  id: string;
  orderNumber: string;
  tenantId: string;
  restaurantId: string;
  customerId: string;

  // Type
  orderType: 'delivery' | 'pickup' | 'dine_in';

  // Items
  items: OrderItem[];

  // Delivery
  deliveryAddress?: Address;
  deliveryInstructions?: string;
  contactlessDelivery: boolean;

  // Scheduling
  isScheduled: boolean;
  scheduledTime?: Date;
  requestedTime?: Date;

  // Pricing
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  packagingFee: number;
  tax: number;
  tip: number;
  discount: number;
  total: number;
  promoCode?: string;

  // Payment
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;

  // Status tracking
  status: FoodOrderStatus;
  statusHistory: StatusChange[];

  // Assignment
  driverId?: string;
  driverAssignedAt?: Date;

  // Timing
  estimatedPrepTime?: number;
  estimatedDeliveryTime?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;

  // Special requests
  specialInstructions?: string;
  utensilsRequired: boolean;

  // Rating
  restaurantRating?: number;
  driverRating?: number;
  feedback?: string;

  createdAt: Date;
  updatedAt: Date;
}

type FoodOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'driver_assigned'
  | 'picked_up'
  | 'on_the_way'
  | 'arrived'
  | 'delivered'
  | 'cancelled';

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: SelectedModifier[];
  modifiersTotal: number;
  specialInstructions?: string;
  total: number;
}
```

### 4. Order Flow Service

```typescript
export class FoodOrderService {
  /**
   * Create new order
   */
  async createOrder(
    customerId: string,
    restaurantId: string,
    items: OrderItemInput[],
    deliveryAddress: Address,
    options: OrderOptions
  ): Promise<FoodOrder> {
    const restaurant = await this.restaurantService.getRestaurant(restaurantId);

    // Validate restaurant is accepting orders
    if (!restaurant.acceptingOrders || restaurant.temporarilyClosed) {
      throw new Error('Restaurant is not accepting orders');
    }

    // Validate delivery address is in range
    const zone = this.findDeliveryZone(restaurant, deliveryAddress);
    if (!zone) {
      throw new Error('Address is outside delivery area');
    }

    // Build order items
    const orderItems = await this.buildOrderItems(items, restaurant);

    // Calculate pricing
    const pricing = this.calculatePricing(
      orderItems,
      zone,
      restaurant.settings,
      options.promoCode
    );

    // Validate minimum order
    if (pricing.subtotal < (zone.minOrder || restaurant.settings.minOrderAmount)) {
      throw new Error(`Minimum order amount is $${zone.minOrder || restaurant.settings.minOrderAmount}`);
    }

    // Create order
    const order: FoodOrder = {
      id: generateId(),
      orderNumber: await this.generateOrderNumber(restaurantId),
      tenantId: restaurant.tenantId,
      restaurantId,
      customerId,
      orderType: 'delivery',
      items: orderItems,
      deliveryAddress,
      deliveryInstructions: options.deliveryInstructions,
      contactlessDelivery: options.contactlessDelivery || false,
      isScheduled: !!options.scheduledTime,
      scheduledTime: options.scheduledTime,
      ...pricing,
      paymentStatus: 'pending',
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed'
      }],
      utensilsRequired: options.utensilsRequired ?? true,
      specialInstructions: options.specialInstructions,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.orderRepository.save(order);

    // Notify restaurant
    await this.notifyRestaurant(order);

    return order;
  }

  /**
   * Restaurant confirms order
   */
  async confirmOrder(
    orderId: string,
    restaurantId: string,
    prepTime: number
  ): Promise<FoodOrder> {
    const order = await this.getOrder(orderId);

    if (order.restaurantId !== restaurantId) {
      throw new Error('Unauthorized');
    }

    if (order.status !== 'pending') {
      throw new Error('Order cannot be confirmed');
    }

    order.status = 'confirmed';
    order.estimatedPrepTime = prepTime;

    // Calculate estimated delivery time
    order.estimatedDeliveryTime = new Date(
      Date.now() + (prepTime + 15) * 60 * 1000  // prep + 15 min delivery
    );

    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: `Estimated preparation: ${prepTime} minutes`
    });

    await this.orderRepository.save(order);

    // Notify customer
    await this.notificationService.sendOrderConfirmed(order);

    // Start driver matching when order is close to ready
    setTimeout(() => {
      this.initiateDriverMatching(order);
    }, Math.max(0, (prepTime - 10) * 60 * 1000));

    return order;
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    newStatus: FoodOrderStatus,
    actorId: string,
    note?: string
  ): Promise<FoodOrder> {
    const order = await this.getOrder(orderId);

    // Validate status transition
    if (!this.isValidTransition(order.status, newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      actorId,
      note
    });

    // Handle specific status changes
    switch (newStatus) {
      case 'preparing':
        await this.notificationService.sendPreparingNotification(order);
        break;

      case 'ready_for_pickup':
        await this.notificationService.sendReadyForPickup(order);
        // Urgently find driver if not assigned
        if (!order.driverId) {
          await this.initiateDriverMatching(order);
        }
        break;

      case 'picked_up':
        order.actualPickupTime = new Date();
        await this.notificationService.sendPickedUp(order);
        break;

      case 'on_the_way':
        await this.notificationService.sendOnTheWay(order);
        break;

      case 'delivered':
        order.actualDeliveryTime = new Date();
        await this.notificationService.sendDelivered(order);
        await this.processDeliveryCompletion(order);
        break;

      case 'cancelled':
        await this.processCancellation(order, note);
        break;
    }

    await this.orderRepository.save(order);
    return order;
  }
}
```

### 5. Real-Time Order Tracking

```typescript
export class OrderTrackingService {
  /**
   * Get order tracking info
   */
  async getTrackingInfo(orderId: string): Promise<OrderTrackingInfo> {
    const order = await this.orderService.getOrder(orderId);

    const tracking: OrderTrackingInfo = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,

      // Restaurant info
      restaurant: {
        name: order.restaurantName,
        address: order.restaurantAddress,
        phone: order.restaurantPhone
      },

      // Delivery info
      deliveryAddress: order.deliveryAddress,
      estimatedDeliveryTime: order.estimatedDeliveryTime,

      // Driver info (if assigned)
      driver: null,
      driverLocation: null,
      driverETA: null,

      // Timeline
      timeline: this.buildTimeline(order)
    };

    // Add driver info if assigned
    if (order.driverId && ['driver_assigned', 'picked_up', 'on_the_way', 'arrived'].includes(order.status)) {
      const driver = await this.driverService.getDriver(order.driverId);
      const location = await this.driverService.getLocation(order.driverId);

      tracking.driver = {
        name: driver.firstName,
        photo: driver.profilePhoto,
        phone: driver.phone,
        rating: driver.rating,
        vehicle: driver.vehicleDescription
      };

      tracking.driverLocation = location;

      // Calculate ETA
      const destination = order.status === 'driver_assigned'
        ? order.restaurantLocation
        : order.deliveryAddress;

      tracking.driverETA = await this.calculateETA(location, destination);
    }

    return tracking;
  }

  /**
   * Stream order updates via WebSocket
   */
  async streamOrderUpdates(
    orderId: string,
    ws: WebSocket
  ): Promise<void> {
    const channelKey = `order:${orderId}`;

    // Subscribe to order updates
    await this.pubsub.subscribe(channelKey, (message) => {
      ws.send(JSON.stringify(message));
    });

    // Send initial state
    const tracking = await this.getTrackingInfo(orderId);
    ws.send(JSON.stringify({
      type: 'tracking_update',
      data: tracking
    }));

    // If driver assigned, stream location updates
    const order = await this.orderService.getOrder(orderId);
    if (order.driverId) {
      const locationChannel = `driver:${order.driverId}:location`;
      await this.pubsub.subscribe(locationChannel, (location) => {
        ws.send(JSON.stringify({
          type: 'driver_location',
          data: location
        }));
      });
    }

    ws.on('close', () => {
      this.pubsub.unsubscribe(channelKey);
    });
  }

  /**
   * Build order timeline
   */
  private buildTimeline(order: FoodOrder): TimelineStep[] {
    const steps: TimelineStep[] = [
      {
        label: 'Order Placed',
        status: 'completed',
        time: order.createdAt
      },
      {
        label: 'Confirmed',
        status: order.status === 'pending' ? 'pending' : 'completed',
        time: this.getStatusTime(order, 'confirmed')
      },
      {
        label: 'Preparing',
        status: this.getTimelineStatus(order, 'preparing'),
        time: this.getStatusTime(order, 'preparing')
      },
      {
        label: 'Ready for Pickup',
        status: this.getTimelineStatus(order, 'ready_for_pickup'),
        time: this.getStatusTime(order, 'ready_for_pickup')
      },
      {
        label: 'On the Way',
        status: this.getTimelineStatus(order, 'on_the_way'),
        time: this.getStatusTime(order, 'on_the_way')
      },
      {
        label: 'Delivered',
        status: this.getTimelineStatus(order, 'delivered'),
        time: order.actualDeliveryTime
      }
    ];

    return steps;
  }
}
```

## Database Schema

```sql
-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cuisine_types TEXT[],
  price_range INTEGER DEFAULT 2,
  address JSONB NOT NULL,
  coordinates POINT NOT NULL,
  delivery_radius DECIMAL(5,2) DEFAULT 5.00,
  phone VARCHAR(20),
  email VARCHAR(255),
  operating_hours JSONB NOT NULL,
  settings JSONB NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  logo VARCHAR(500),
  cover_image VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  accepting_orders BOOLEAN DEFAULT true,
  temporarily_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  availability_hours JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  modifier_groups JSONB DEFAULT '[]',
  dietary JSONB DEFAULT '{}',
  nutrition JSONB,
  image VARCHAR(500),
  available BOOLEAN DEFAULT true,
  stock_count INTEGER,
  order_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  featured BOOLEAN DEFAULT false,
  popular BOOLEAN DEFAULT false,
  spicy_level INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food Orders
CREATE TABLE food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  order_type VARCHAR(50) NOT NULL,
  items JSONB NOT NULL,
  delivery_address JSONB,
  delivery_instructions TEXT,
  contactless_delivery BOOLEAN DEFAULT false,
  is_scheduled BOOLEAN DEFAULT false,
  scheduled_time TIMESTAMPTZ,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  packaging_fee DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL,
  tip DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  promo_code VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_intent_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  status_history JSONB DEFAULT '[]',
  driver_id UUID REFERENCES drivers(id),
  driver_assigned_at TIMESTAMPTZ,
  estimated_prep_time INTEGER,
  estimated_delivery_time TIMESTAMPTZ,
  actual_pickup_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  restaurant_rating INTEGER,
  driver_rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_restaurants_location ON restaurants USING gist(coordinates);
CREATE INDEX idx_restaurants_cuisine ON restaurants USING gin(cuisine_types);
CREATE INDEX idx_restaurants_status ON restaurants(status, accepting_orders);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_orders_restaurant ON food_orders(restaurant_id);
CREATE INDEX idx_orders_customer ON food_orders(customer_id);
CREATE INDEX idx_orders_status ON food_orders(status);
CREATE INDEX idx_orders_driver ON food_orders(driver_id);
```

## Related Skills
- `non-food-delivery-standard` - Package delivery
- `delivery-driver-standard` - Driver management
- `ride-sharing-standard` - Shared logistics patterns
