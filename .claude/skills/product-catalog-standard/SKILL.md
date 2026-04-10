---
name: product-catalog-standard
description: Implement product catalog with CRUD operations, inventory management, search/filtering, and pre-orders. Use when building e-commerce catalogs, product management, or inventory systems. Triggers on requests for product catalog, inventory management, product search, or e-commerce products.
---

# Product Catalog Standard

Production-grade product catalog implementation with complete CRUD operations, inventory management, search/filtering, and pre-order support. Extracted from DreamiHairCare e-commerce platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT CATALOG SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐ │
│  │   Admin Panel   │    │  Storefront UI  │    │  Homepage Sync      │ │
│  │  - Create/Edit  │    │  - Browse/View  │    │  - Product Sync     │ │
│  │  - Inventory    │    │  - Search       │    │  - Cache Updates    │ │
│  │  - Status Mgmt  │    │  - Filter       │    │                     │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────────┘ │
│           │                      │                      │               │
│           └──────────────────────┼──────────────────────┘               │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │    GraphQL API Layer      │                        │
│                    │   ━━━━━━━━━━━━━━━━━━━━    │                        │
│                    │  Queries:                 │                        │
│                    │  • products (paginated)   │                        │
│                    │  • product (by ID/slug)   │                        │
│                    │  • productCategories      │                        │
│                    │  • productStats           │                        │
│                    │  • preOrderProducts       │                        │
│                    │                           │                        │
│                    │  Mutations:               │                        │
│                    │  • createProduct          │                        │
│                    │  • updateProduct          │                        │
│                    │  • deleteProduct          │                        │
│                    │  • updateProductStatus    │                        │
│                    │  • updateInventory        │                        │
│                    └─────────────┬─────────────┘                        │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │    Product Model          │                        │
│                    │   ━━━━━━━━━━━━━━━━━━━━    │                        │
│                    │  • UUID Primary Key       │                        │
│                    │  • Unique SKU & Slug      │                        │
│                    │  • Price/Compare/Cost     │                        │
│                    │  • Inventory Tracking     │                        │
│                    │  • Status Management      │                        │
│                    │  • Pre-Order Support      │                        │
│                    │  • SEO & Dimensions       │                        │
│                    └─────────────┬─────────────┘                        │
│                                  │                                      │
│                    ┌─────────────┴─────────────┐                        │
│                    │  PostgreSQL (products)    │                        │
│                    └───────────────────────────┘                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Critical Patterns

### 1. Product Status Enum (REQUIRED)

```typescript
// ALWAYS use these exact status values
export enum ProductStatus {
  ACTIVE = 'ACTIVE',       // Visible and purchasable
  INACTIVE = 'INACTIVE',   // Hidden from storefront
  DRAFT = 'DRAFT',         // Work in progress (default)
  ARCHIVED = 'ARCHIVED',   // Soft-deleted, historical
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',     // Ready to ship
  PRE_ORDER = 'PRE_ORDER',     // Available for pre-order
  OUT_OF_STOCK = 'OUT_OF_STOCK', // Not available
}
```

### 2. Authentication Pattern (CRITICAL)

```typescript
// EVERY admin mutation MUST check auth
if (!context.auth?.userId) {
  throw new GraphQLError('Authentication required', {
    extensions: { code: 'UNAUTHENTICATED' }
  });
}
```

### 3. Unique SKU and Slug Validation

```typescript
// SKU uniqueness check before create
const existingProduct = await Product.findOne({ where: { sku: input.sku } });
if (existingProduct) {
  throw new Error('Product with this SKU already exists');
}

// Slug generation with uniqueness
let baseSlug = input.name
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

let slug = baseSlug;
let counter = 1;
while (await Product.findOne({ where: { slug } })) {
  slug = `${baseSlug}-${counter}`;
  counter++;
}
```

### 4. Pagination Pattern

```typescript
// Standard pagination response structure
interface PaginatedProducts {
  nodes: Product[];
  pageInfo: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## Database Model

### Sequelize Model (Complete)

```typescript
// backend/src/models/Product.ts
import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, BeforeCreate, BeforeUpdate, HasMany,
} from 'sequelize-typescript';
import { Op } from 'sequelize';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  PRE_ORDER = 'PRE_ORDER',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

interface ProductSEO {
  title?: string;
  description?: string;
  keywords: string[];
}

interface ProductStats {
  totalViews: number;
  totalOrders: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
}

@Table({
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['sku'], unique: true },
    { fields: ['slug'], unique: true },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['price'] },
    { fields: ['inventory'] },
    { fields: ['createdAt'] },
  ],
})
export class Product extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  })
  declare price: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare sku: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare slug: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare category: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  })
  declare inventory: number;

  @Column({
    type: DataType.ENUM(...Object.values(ProductStatus)),
    allowNull: false,
    defaultValue: ProductStatus.DRAFT,
  })
  declare status: ProductStatus;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false, defaultValue: [] })
  declare images: string[];

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false, defaultValue: [] })
  declare tags: string[];

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: true, validate: { min: 0 } })
  declare weight?: number;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare dimensions?: ProductDimensions;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare seo?: ProductSEO;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true, validate: { min: 0 } })
  declare compareAtPrice?: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true, validate: { min: 0 } })
  declare costPrice?: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare trackInventory: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare requiresShipping: boolean;

  @Column({ type: DataType.INTEGER, allowNull: true, validate: { min: 0 } })
  declare lowStockThreshold?: number;

  @Column({
    type: DataType.ENUM(...Object.values(AvailabilityStatus)),
    allowNull: false,
    defaultValue: AvailabilityStatus.AVAILABLE,
  })
  declare availabilityStatus: AvailabilityStatus;

  @Column({ type: DataType.DATE, allowNull: true })
  declare preOrderReleaseDate?: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Virtual getters
  get isLowStock(): boolean {
    if (!this.trackInventory || this.lowStockThreshold === null) return false;
    return this.inventory <= (this.lowStockThreshold || 0);
  }

  get isOutOfStock(): boolean {
    return this.trackInventory && this.inventory === 0;
  }

  get isPreOrder(): boolean {
    return this.availabilityStatus === AvailabilityStatus.PRE_ORDER;
  }

  get isAvailable(): boolean {
    return this.status === ProductStatus.ACTIVE &&
           this.availabilityStatus === AvailabilityStatus.AVAILABLE &&
           (!this.trackInventory || this.inventory > 0);
  }

  get discountPercentage(): number | null {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) return null;
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }

  get margin(): number | null {
    if (!this.costPrice) return null;
    return ((this.price - this.costPrice) / this.price) * 100;
  }

  // Instance methods
  async updateInventory(quantity: number, operation: 'add' | 'subtract' = 'subtract'): Promise<void> {
    if (!this.trackInventory) return;
    const newInventory = operation === 'add'
      ? this.inventory + quantity
      : this.inventory - quantity;
    this.inventory = Math.max(0, newInventory);
    await this.save();
  }

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async generateSKU(instance: Product) {
    if (!instance.sku) {
      const prefix = 'PRD';
      const category = instance.category ? instance.category.substring(0, 4).toUpperCase() : 'PROD';
      const timestamp = Date.now().toString().slice(-6);
      instance.sku = `${prefix}-${category}-${timestamp}`;
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async generateSlug(instance: Product) {
    if (!instance.slug && instance.name) {
      let baseSlug = instance.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ where: { slug, id: { [Op.ne]: instance.id || '' } } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      instance.slug = slug;
    }
  }

  // Static methods
  static async findBySKU(sku: string): Promise<Product | null> {
    return this.findOne({ where: { sku: sku.toUpperCase() } });
  }

  static async findBySlug(slug: string): Promise<Product | null> {
    return this.findOne({ where: { slug: slug.toLowerCase() } });
  }

  static async findByCategory(category: string): Promise<Product[]> {
    return this.findAll({
      where: { category, status: ProductStatus.ACTIVE },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getLowStockProducts(threshold?: number): Promise<Product[]> {
    const products = await this.findAll({
      where: { status: ProductStatus.ACTIVE, trackInventory: true }
    });
    return products.filter(product => {
      const productThreshold = threshold || product.lowStockThreshold || 0;
      return product.inventory <= productThreshold;
    });
  }

  static async searchProducts(query: string): Promise<Product[]> {
    return this.findAll({
      where: {
        status: ProductStatus.ACTIVE,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
          { sku: { [Op.iLike]: `%${query}%` } },
          { tags: { [Op.contains]: [query] } }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
  }
}
```

### Migration Script

```typescript
// backend/src/migrations/YYYYMMDDHHMMSS-create-products-table.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create enum types first
  await queryInterface.sequelize.query(`
    CREATE TYPE "product_status" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED');
  `);

  await queryInterface.sequelize.query(`
    CREATE TYPE "availability_status" AS ENUM ('AVAILABLE', 'PRE_ORDER', 'OUT_OF_STOCK');
  `);

  await queryInterface.createTable('products', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inventory: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'DRAFT', 'ARCHIVED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    dimensions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    seo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    compare_at_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    track_inventory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    requires_shipping: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    availability_status: {
      type: DataTypes.ENUM('AVAILABLE', 'PRE_ORDER', 'OUT_OF_STOCK'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
    pre_order_release_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Create indexes
  await queryInterface.addIndex('products', ['sku'], { unique: true });
  await queryInterface.addIndex('products', ['slug'], { unique: true });
  await queryInterface.addIndex('products', ['status']);
  await queryInterface.addIndex('products', ['category']);
  await queryInterface.addIndex('products', ['price']);
  await queryInterface.addIndex('products', ['inventory']);
  await queryInterface.addIndex('products', ['created_at']);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('products');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "product_status";');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "availability_status";');
}
```

## GraphQL Schema

```graphql
# backend/src/graphql/schema/product.graphql

# Enums
enum ProductStatus {
  ACTIVE
  INACTIVE
  DRAFT
  ARCHIVED
}

enum AvailabilityStatus {
  AVAILABLE
  PRE_ORDER
  OUT_OF_STOCK
}

enum SortDirection {
  ASC
  DESC
}

# Types
type ProductDimensions {
  length: Float
  width: Float
  height: Float
}

type ProductSEO {
  title: String
  description: String
  keywords: [String!]
}

type ProductStats {
  totalViews: Int!
  totalOrders: Int!
  conversionRate: Float!
  averageRating: Float!
  reviewCount: Int!
}

type Product {
  id: ID!
  name: String!
  description: String!
  price: Float!
  sku: String!
  slug: String!
  category: String!
  inventory: Int!
  status: ProductStatus!
  images: [String!]!
  tags: [String!]!
  weight: Float
  dimensions: ProductDimensions
  seo: ProductSEO
  compareAtPrice: Float
  costPrice: Float
  trackInventory: Boolean!
  requiresShipping: Boolean!
  lowStockThreshold: Int
  availabilityStatus: AvailabilityStatus!
  preOrderReleaseDate: String
  createdAt: String!
  updatedAt: String!

  # Computed fields
  isLowStock: Boolean!
  isOutOfStock: Boolean!
  isPreOrder: Boolean!
  isAvailable: Boolean!
  discountPercentage: Int
  margin: Float
  stats: ProductStats!
}

# Pagination
type PageInfo {
  page: Int!
  limit: Int!
  total: Int!
  pages: Int!
  hasNext: Boolean!
  hasPrev: Boolean!
}

type PaginatedProducts {
  nodes: [Product!]!
  pageInfo: PageInfo!
}

# Input types
input ProductFilterInput {
  search: String
  status: ProductStatus
  category: String
  priceRange: PriceRangeInput
}

input PriceRangeInput {
  min: Float!
  max: Float!
}

input ProductSortInput {
  field: String!
  direction: SortDirection!
}

input ProductDimensionsInput {
  length: Float!
  width: Float!
  height: Float!
}

input ProductSEOInput {
  title: String
  description: String
  keywords: [String!]
}

input CreateProductInput {
  name: String!
  description: String!
  price: Float!
  sku: String!
  category: String!
  inventory: Int
  status: ProductStatus
  images: [String!]
  tags: [String!]
  weight: Float
  dimensions: ProductDimensionsInput
  seo: ProductSEOInput
  compareAtPrice: Float
  costPrice: Float
  trackInventory: Boolean
  requiresShipping: Boolean
  lowStockThreshold: Int
  availabilityStatus: AvailabilityStatus
  preOrderReleaseDate: String
}

input UpdateProductInput {
  name: String
  description: String
  price: Float
  sku: String
  category: String
  inventory: Int
  status: ProductStatus
  images: [String!]
  tags: [String!]
  weight: Float
  dimensions: ProductDimensionsInput
  seo: ProductSEOInput
  compareAtPrice: Float
  costPrice: Float
  trackInventory: Boolean
  requiresShipping: Boolean
  lowStockThreshold: Int
  availabilityStatus: AvailabilityStatus
  preOrderReleaseDate: String
}

input PaginationInput {
  page: Int
  limit: Int
}

# Product statistics for admin
type ProductStatsOverview {
  totalProducts: Int!
  activeProducts: Int!
  inactiveProducts: Int!
  lowStockProducts: Int!
  outOfStockProducts: Int!
  preOrderProducts: Int!
  availableProducts: Int!
  totalValue: Float!
}

# Queries
type Query {
  products(
    filter: ProductFilterInput
    sort: ProductSortInput
    page: Int
    limit: Int
  ): PaginatedProducts!

  product(id: ID!): Product

  productBySku(sku: String!): Product

  productCategories: [String!]!

  productStats: ProductStatsOverview!

  preOrderProducts(pagination: PaginationInput): PaginatedProducts!

  availableProducts(pagination: PaginationInput): PaginatedProducts!
}

# Mutations
type Mutation {
  createProduct(input: CreateProductInput!): Product!

  updateProduct(id: ID!, input: UpdateProductInput!): Product!

  deleteProduct(id: ID!): Boolean!

  updateProductStatus(id: ID!, status: ProductStatus!): Product!

  updateProductInventory(id: ID!, inventory: Int!): Product!

  updateProductAvailability(id: ID!, availabilityStatus: AvailabilityStatus!): Product!
}
```

## GraphQL Resolvers

```typescript
// backend/src/graphql/resolvers/productResolvers.ts
import { Op } from 'sequelize';
import { Product, ProductStatus, AvailabilityStatus } from '../../models/Product';
import { GraphQLError } from 'graphql';

export const productResolvers = {
  Query: {
    // Paginated product list with filtering and search
    products: async (
      _: any,
      { filter, sort, page = 1, limit = 10 }: {
        filter?: {
          search?: string;
          status?: string;
          category?: string;
          priceRange?: { min: number; max: number };
        };
        sort?: { field: string; direction: 'ASC' | 'DESC' };
        page: number;
        limit: number;
      },
      context: any
    ) => {
      const offset = (page - 1) * limit;
      const where: any = {};

      // Search across multiple fields
      if (filter?.search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${filter.search}%` } },
          { description: { [Op.iLike]: `%${filter.search}%` } },
          { sku: { [Op.iLike]: `%${filter.search}%` } },
          { tags: { [Op.contains]: [filter.search] } }
        ];
      }

      if (filter?.status) where.status = filter.status;
      if (filter?.category) where.category = filter.category;
      if (filter?.priceRange) {
        where.price = { [Op.between]: [filter.priceRange.min, filter.priceRange.max] };
      }

      const order: any = sort?.field
        ? [[sort.field, sort.direction || 'ASC']]
        : [['createdAt', 'DESC']];

      const { count, rows } = await Product.findAndCountAll({
        where, order, limit, offset
      });

      return {
        nodes: rows,
        pageInfo: {
          page, limit, total: count,
          pages: Math.ceil(count / limit),
          hasNext: offset + limit < count,
          hasPrev: page > 1
        }
      };
    },

    // Single product by ID or slug
    product: async (_: any, { id }: { id: string }) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (uuidRegex.test(id)) {
        return await Product.findByPk(id);
      }
      return await Product.findBySlug(id);
    },

    // Product by SKU
    productBySku: async (_: any, { sku }: { sku: string }) => {
      return await (Product as any).findBySKU(sku);
    },

    // All categories
    productCategories: async () => {
      const categories = await Product.findAll({
        attributes: ['category'],
        group: ['category'],
        where: { category: { [Op.ne]: null } }
      });
      return categories.map(p => (p as any).category).filter(Boolean);
    },

    // Admin stats (requires auth)
    productStats: async (_: any, __: any, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const [total, active, inactive, lowStock, outOfStock, preOrder, available] = await Promise.all([
        Product.count(),
        Product.count({ where: { status: 'ACTIVE' } }),
        Product.count({ where: { status: 'INACTIVE' } }),
        Product.count({ where: { inventory: { [Op.lt]: 10 } } }),
        Product.count({ where: { inventory: { [Op.lte]: 0 } } }),
        Product.count({ where: { status: 'ACTIVE', availabilityStatus: 'PRE_ORDER' } }),
        Product.count({ where: { status: 'ACTIVE', availabilityStatus: 'AVAILABLE' } }),
      ]);

      const products = await Product.findAll({
        attributes: ['price', 'inventory'],
        where: { status: 'ACTIVE' }
      });
      const totalValue = products.reduce((sum, p) =>
        sum + ((p as any).price * (p as any).inventory), 0);

      return {
        totalProducts: total,
        activeProducts: active,
        inactiveProducts: inactive,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock,
        preOrderProducts: preOrder,
        availableProducts: available,
        totalValue
      };
    },
  },

  Mutation: {
    createProduct: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      if (!input.name || !input.price || !input.sku) {
        throw new Error('Name, price, and SKU are required');
      }

      // Check SKU uniqueness
      const existing = await Product.findOne({ where: { sku: input.sku } });
      if (existing) throw new Error('Product with this SKU already exists');

      // Generate slug
      let baseSlug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      return await Product.create({ ...input, slug });
    },

    updateProduct: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const product = await Product.findByPk(id);
      if (!product) throw new Error('Product not found');

      // Check SKU uniqueness if updating
      if (input.sku && input.sku !== (product as any).sku) {
        const existing = await Product.findOne({
          where: { sku: input.sku, id: { [Op.ne]: id } }
        });
        if (existing) throw new Error('Product with this SKU already exists');
      }

      await product.update(input);
      return product;
    },

    deleteProduct: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const product = await Product.findByPk(id);
      if (!product) throw new Error('Product not found');

      await product.destroy();
      return true;
    },

    updateProductStatus: async (_: any, { id, status }: { id: string; status: string }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const product = await Product.findByPk(id);
      if (!product) throw new Error('Product not found');

      await product.update({ status });
      return product;
    },

    updateProductInventory: async (_: any, { id, inventory }: { id: string; inventory: number }, context: any) => {
      if (!context.auth?.userId) {
        throw new GraphQLError('Authentication required', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const product = await Product.findByPk(id);
      if (!product) throw new Error('Product not found');

      await product.update({ inventory });
      return product;
    },
  },

  // Type resolvers
  Product: {
    images: (parent: any) => parent.images || [],
    tags: (parent: any) => parent.tags || [],
    stats: (parent: any) => parent.stats || {
      totalViews: 0, totalOrders: 0, conversionRate: 0,
      averageRating: 0, reviewCount: 0
    },
  }
};
```

## Frontend Integration

### Apollo Client Queries

```typescript
// frontend/src/graphql/queries/products.ts
import { gql } from '@apollo/client';

export const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    description
    price
    sku
    slug
    category
    inventory
    status
    images
    tags
    compareAtPrice
    availabilityStatus
    preOrderReleaseDate
    isLowStock
    isOutOfStock
    isPreOrder
    isAvailable
    discountPercentage
    createdAt
    updatedAt
  }
`;

export const GET_PRODUCTS = gql`
  ${PRODUCT_FRAGMENT}
  query GetProducts(
    $filter: ProductFilterInput
    $sort: ProductSortInput
    $page: Int
    $limit: Int
  ) {
    products(filter: $filter, sort: $sort, page: $page, limit: $limit) {
      nodes {
        ...ProductFields
      }
      pageInfo {
        page
        limit
        total
        pages
        hasNext
        hasPrev
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  ${PRODUCT_FRAGMENT}
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductFields
      weight
      dimensions {
        length
        width
        height
      }
      seo {
        title
        description
        keywords
      }
      stats {
        totalViews
        totalOrders
        averageRating
        reviewCount
      }
    }
  }
`;

export const GET_PRODUCT_STATS = gql`
  query GetProductStats {
    productStats {
      totalProducts
      activeProducts
      inactiveProducts
      lowStockProducts
      outOfStockProducts
      preOrderProducts
      availableProducts
      totalValue
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetProductCategories {
    productCategories
  }
`;
```

### Apollo Client Mutations

```typescript
// frontend/src/graphql/mutations/products.ts
import { gql } from '@apollo/client';
import { PRODUCT_FRAGMENT } from '../queries/products';

export const CREATE_PRODUCT = gql`
  ${PRODUCT_FRAGMENT}
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ...ProductFields
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  ${PRODUCT_FRAGMENT}
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ...ProductFields
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const UPDATE_PRODUCT_STATUS = gql`
  ${PRODUCT_FRAGMENT}
  mutation UpdateProductStatus($id: ID!, $status: ProductStatus!) {
    updateProductStatus(id: $id, status: $status) {
      ...ProductFields
    }
  }
`;

export const UPDATE_PRODUCT_INVENTORY = gql`
  ${PRODUCT_FRAGMENT}
  mutation UpdateProductInventory($id: ID!, $inventory: Int!) {
    updateProductInventory(id: $id, inventory: $inventory) {
      ...ProductFields
    }
  }
`;
```

### React Hook Example

```typescript
// frontend/src/hooks/useProducts.ts
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_PRODUCTS, GET_PRODUCT, GET_PRODUCT_STATS } from '../graphql/queries/products';
import { CREATE_PRODUCT, UPDATE_PRODUCT, DELETE_PRODUCT } from '../graphql/mutations/products';

interface UseProductsOptions {
  filter?: {
    search?: string;
    status?: string;
    category?: string;
  };
  page?: number;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { filter, page = 1, limit = 10 } = options;

  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: { filter, page, limit },
  });

  return {
    products: data?.products?.nodes || [],
    pageInfo: data?.products?.pageInfo,
    loading,
    error,
    refetch,
  };
}

export function useProduct(id: string) {
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id },
    skip: !id,
  });

  return {
    product: data?.product,
    loading,
    error,
  };
}

export function useProductMutations() {
  const client = useApolloClient();

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }],
  });

  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);

  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }],
  });

  return {
    createProduct: (input: any) => createProduct({ variables: { input } }),
    updateProduct: (id: string, input: any) => updateProduct({ variables: { id, input } }),
    deleteProduct: (id: string) => deleteProduct({ variables: { id } }),
    loading: creating || updating || deleting,
  };
}
```

### Product Card Component

```tsx
// frontend/src/components/products/ProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: string;
    availabilityStatus: string;
    isPreOrder: boolean;
    discountPercentage?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const {
    name, slug, price, compareAtPrice, images, category,
    availabilityStatus, isPreOrder, discountPercentage
  } = product;

  return (
    <Card className="group overflow-hidden">
      <Link href={`/products/${slug}`}>
        <div className="relative aspect-square">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {discountPercentage && (
              <Badge variant="destructive">-{discountPercentage}%</Badge>
            )}
            {isPreOrder && (
              <Badge variant="secondary">Pre-Order</Badge>
            )}
            {availabilityStatus === 'OUT_OF_STOCK' && (
              <Badge variant="outline">Out of Stock</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{category}</p>
          <h3 className="line-clamp-2 font-medium">{name}</h3>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2">
            <span className="font-bold">{formatCurrency(price)}</span>
            {compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
```

## Environment Variables

```bash
# No product-specific environment variables required
# Database connection is handled by standard POSTGRES_* variables
# See backend/.env.example for database configuration
```

## Quality Checklist

Before completing product catalog implementation, verify:

### Database
- [ ] Products table created with all columns
- [ ] Indexes on sku, slug, status, category, price, inventory
- [ ] Enum types created for ProductStatus and AvailabilityStatus
- [ ] UUID primary key configured

### Backend
- [ ] All GraphQL queries implemented
- [ ] All GraphQL mutations implemented
- [ ] Authentication check on all admin mutations
- [ ] SKU uniqueness validation
- [ ] Slug auto-generation
- [ ] Pagination with proper pageInfo

### Frontend
- [ ] Product listing with pagination
- [ ] Product detail page
- [ ] Search functionality
- [ ] Filter by status/category/price
- [ ] Admin CRUD forms
- [ ] Loading and error states

### Testing
- [ ] Unit tests for model methods
- [ ] Integration tests for resolvers
- [ ] E2E tests for product CRUD

## Related Skills

- **stripe-connect-standard** - Payment processing for product purchases
- **shopping-cart-standard** - Cart management (uses products)
- **checkout-flow-standard** - Checkout process (uses products)
- **order-management-standard** - Order processing (references products)

## Version History

- **1.0.0** - Initial release with DreamiHairCare patterns
