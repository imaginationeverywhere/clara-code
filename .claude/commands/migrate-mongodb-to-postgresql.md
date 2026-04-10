# Migrate MongoDB to PostgreSQL

Guide for migrating a MongoDB-based Next.js application to the PostgreSQL + Sequelize boilerplate architecture. Designed specifically for site962 and similar projects.

## Command Usage

```
/migrate-mongodb-to-postgresql [project-path] [options]
```

### Options
- `--analyze` - Analyze current MongoDB schema only
- `--generate-models` - Generate Sequelize models from MongoDB collections
- `--generate-migrations` - Create migration files
- `--export-data` - Export MongoDB data to JSON
- `--full` - Complete migration workflow (default)

## Pre-Migration Analysis

### Step 1: Document Current MongoDB Collections

```bash
# Connect to MongoDB and list collections
mongosh "mongodb://localhost:27017/site962" --eval "db.getCollectionNames()"

# Get schema samples from each collection
mongosh "mongodb://localhost:27017/site962" --eval "
  db.getCollectionNames().forEach(function(coll) {
    print('=== ' + coll + ' ===');
    printjson(db[coll].findOne());
  });
"
```

### Step 2: Identify Data Relationships

Common patterns to look for:
- `ObjectId` references (foreign keys)
- Embedded documents (need normalization)
- Arrays of references (many-to-many)
- Denormalized data (need restructuring)

## MongoDB → PostgreSQL Type Mapping

| MongoDB Type | PostgreSQL Type | Sequelize Type |
|--------------|-----------------|----------------|
| ObjectId | UUID | DataTypes.UUID |
| String | VARCHAR/TEXT | DataTypes.STRING/TEXT |
| Number | INTEGER/DECIMAL | DataTypes.INTEGER/DECIMAL |
| Boolean | BOOLEAN | DataTypes.BOOLEAN |
| Date | TIMESTAMP | DataTypes.DATE |
| Array | JSONB / junction table | DataTypes.JSONB / association |
| Embedded Object | JSONB / related table | DataTypes.JSONB / association |
| Mixed | JSONB | DataTypes.JSONB |

## Schema Transformation Examples

### Example 1: Simple Document → Table

**MongoDB (Mongoose):**
```javascript
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ['user', 'admin', 'organizer'] },
  createdAt: { type: Date, default: Date.now }
});
```

**PostgreSQL (Sequelize):**
```typescript
// backend/src/models/User.ts
import { DataTypes, Model } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export class User extends Model {
  declare id: string;
  declare email: string;
  declare name: string | null;
  declare role: 'user' | 'admin' | 'organizer';
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'organizer'),
    defaultValue: 'user',
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  underscored: true,
});
```

### Example 2: Reference → Foreign Key

**MongoDB:**
```javascript
const EventSchema = new Schema({
  title: String,
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  venue: { type: Schema.Types.ObjectId, ref: 'Venue' }
});
```

**PostgreSQL:**
```typescript
// backend/src/models/Event.ts
Event.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  organizerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    field: 'organizer_id',
  },
  venueId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'venues',
      key: 'id',
    },
    field: 'venue_id',
  },
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'events',
  underscored: true,
});

// Associations
Event.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
Event.belongsTo(Venue, { foreignKey: 'venueId', as: 'venue' });
```

### Example 3: Embedded Array → Junction Table

**MongoDB:**
```javascript
const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }]
});
```

**PostgreSQL:**
```typescript
// orders table
Order.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2) },
});

// order_items table (junction)
OrderItem.init({
  id: { type: DataTypes.UUID, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false },
  productId: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.INTEGER },
  price: { type: DataTypes.DECIMAL(10, 2) },
});

// Associations
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
```

## Migration Workflow

### Phase 1: Create Boilerplate Project

```bash
# Copy boilerplate
cp -r /Volumes/X10-Pro/Native-Projects/AI/quik-nation-ai-boilerplate site962-v2
cd site962-v2

# Update project identity
# - package.json: name, version, description
# - docs/PRD.md: project requirements
# - .claude/commands: project-specific commands
```

### Phase 2: Design PostgreSQL Schema

Create migration files for each table:

```bash
cd backend
npx sequelize-cli migration:generate --name create-organizations
npx sequelize-cli migration:generate --name create-users
npx sequelize-cli migration:generate --name create-venues
npx sequelize-cli migration:generate --name create-events
npx sequelize-cli migration:generate --name create-tickets
npx sequelize-cli migration:generate --name create-orders
npx sequelize-cli migration:generate --name create-products
```

### Phase 3: Export MongoDB Data

```javascript
// scripts/export-mongodb.js
const mongoose = require('mongoose');
const fs = require('fs');

async function exportCollection(collectionName) {
  const docs = await mongoose.connection.db.collection(collectionName).find({}).toArray();

  // Transform ObjectIds to UUIDs
  const transformed = docs.map(doc => ({
    ...doc,
    _id: generateUUIDFromObjectId(doc._id),
    // Transform other ObjectId fields
  }));

  fs.writeFileSync(`exports/${collectionName}.json`, JSON.stringify(transformed, null, 2));
}

// Run for all collections
['users', 'organizations', 'events', 'venues', 'orders', 'products', 'tickets']
  .forEach(exportCollection);
```

### Phase 4: Import to PostgreSQL

```typescript
// scripts/import-to-postgres.ts
import { sequelize } from '../src/config/database';
import * as fs from 'fs';

async function importCollection(tableName: string, modelClass: any) {
  const data = JSON.parse(fs.readFileSync(`exports/${tableName}.json`, 'utf-8'));

  await sequelize.transaction(async (t) => {
    for (const record of data) {
      await modelClass.create(record, { transaction: t });
    }
  });

  console.log(`Imported ${data.length} records to ${tableName}`);
}
```

### Phase 5: State Management Migration

**From React Context:**
```typescript
// OLD: context/CartContext.tsx
const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // ...
}
```

**To Redux Persist:**
```typescript
// NEW: store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  items: CartItem[];
  // ...
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      state.items.push(action.payload);
    },
    // ...
  },
});

// Persist configuration in store.ts
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['cart'],
};
```

## site962-Specific Migration Notes

### Collections to Migrate

1. **organizations** → `organizations` table (tenant isolation)
2. **users** → `users` table (Clerk sync)
3. **events** → `events` table
4. **venues** → `venues` table
5. **tickets** → `tickets` table (PassKit integration)
6. **orders** → `orders` + `order_items` tables
7. **products** → `products` table (POS inventory)
8. **permissions** → `roles` + `user_roles` tables

### Special Considerations

1. **PassKit Integration:** Maintain ticket generation logic
2. **Stripe Connect:** Preserve organization payment accounts
3. **DocuSign:** Keep contract signing workflow
4. **POS System:** Ensure inventory management works with PostgreSQL

### Preserve Features

- Multi-tenant organization system
- Role-based permissions
- Event ticketing with check-in
- POS with inventory tracking
- Analytics dashboard
- Email notifications (SendGrid)
- Push notifications (if any)

## Verification Checklist

### Database
- [ ] All tables created with proper indexes
- [ ] Foreign key relationships established
- [ ] UUID primary keys on all tables
- [ ] tenant_id on all tenant-scoped tables
- [ ] Data migration complete and validated

### Backend
- [ ] GraphQL schema matches new models
- [ ] All resolvers use DataLoader
- [ ] Authentication validates context.auth?.userId
- [ ] Stripe Connect integration working
- [ ] PassKit ticket generation working

### Frontend
- [ ] Redux Persist configured for cart/checkout
- [ ] All pages converted to App Router
- [ ] Client components properly marked
- [ ] Server actions implemented where needed

### Testing
- [ ] Unit tests for new services
- [ ] Integration tests for GraphQL
- [ ] E2E tests for critical flows
- [ ] Data integrity validation

## Related Skills

- **sequelize-model-standard** - Model patterns
- **graphql-schema-standard** - Schema design
- **redux-persist-standard** - State management
- **clerk-auth-standard** - Authentication

## Related Commands

- `/implement-data-layer` - Set up data layer
- `/implement-auth` - Authentication setup
- `/implement-payments` - Stripe integration
