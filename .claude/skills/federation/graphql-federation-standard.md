# GraphQL Federation Standard

## Overview
Apollo Federation architecture for composing multiple GraphQL services into a unified supergraph. Handles subgraph design, entity resolution, cross-service queries, federated schema composition, and gateway configuration for the Quik Nation multi-tenant ecosystem.

## Domain Context
- **Primary Projects**: All Quik Nation platforms (shared infrastructure)
- **Related Domains**: All backend services, API Gateway
- **Key Integration**: Apollo Router, Apollo Studio, Apollo Server, AWS AppSync

## Core Interfaces

```typescript
interface FederatedSchema {
  id: string;
  name: string;
  version: string;
  subgraphs: Subgraph[];
  supergraphSdl: string;
  compositionErrors?: CompositionError[];
  status: 'healthy' | 'degraded' | 'error';
  lastComposedAt: Date;
  deployedAt?: Date;
}

interface Subgraph {
  id: string;
  name: string;
  routingUrl: string;
  schema: string;
  version: string;
  status: SubgraphStatus;
  entities: EntityDefinition[];
  operations: OperationMetrics;
  healthCheck: HealthCheckConfig;
  authentication: SubgraphAuth;
  headers?: HeaderConfig[];
}

type SubgraphStatus = 'active' | 'inactive' | 'error' | 'deploying';

interface EntityDefinition {
  name: string;
  keys: EntityKey[];
  fields: EntityField[];
  resolvable: boolean;
  shareable: boolean;
  external: boolean;
  requires?: string[];
  provides?: string[];
}

interface EntityKey {
  fields: string;
  resolvable: boolean;
}

interface EntityField {
  name: string;
  type: string;
  external: boolean;
  shareable: boolean;
  override?: string;
  requires?: string;
  provides?: string;
  inaccessible: boolean;
}

interface SubgraphAuth {
  type: 'none' | 'api_key' | 'jwt' | 'mtls';
  config: AuthConfig;
}

interface HeaderConfig {
  name: string;
  value?: string;
  propagate: boolean;
  required: boolean;
}

interface GatewayConfig {
  id: string;
  name: string;
  type: 'apollo_router' | 'apollo_gateway' | 'aws_appsync';
  supergraphSource: SupergraphSource;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  caching: CachingConfig;
  tracing: TracingConfig;
  plugins: GatewayPlugin[];
  authentication: GatewayAuth;
}

interface SupergraphSource {
  type: 'managed' | 'file' | 'url';
  apolloGraphRef?: string;
  apolloKey?: string;
  filePath?: string;
  url?: string;
  pollInterval?: number;
}

interface CachingConfig {
  enabled: boolean;
  defaultMaxAge: number;
  sharedMaxAge?: number;
  storage: 'memory' | 'redis';
  redisUrl?: string;
  entityCaching: boolean;
  queryPlanCaching: boolean;
  automaticPersistedQueries: boolean;
}

interface RateLimitConfig {
  enabled: boolean;
  defaultLimit: number;
  windowMs: number;
  keyPrefix: string;
  skipList?: string[];
  overrides?: RateLimitOverride[];
}

interface RateLimitOverride {
  operation?: string;
  clientId?: string;
  limit: number;
  windowMs?: number;
}

interface TracingConfig {
  enabled: boolean;
  samplingRate: number;
  exporters: TracingExporter[];
  includeVariables: boolean;
  includeErrors: boolean;
  propagation: 'w3c' | 'b3' | 'jaeger';
}

interface GatewayAuth {
  providers: AuthProvider[];
  requireAuth: boolean;
  defaultClaims?: ClaimMapping[];
  headerPropagation: HeaderPropagation;
}

interface AuthProvider {
  type: 'jwt' | 'api_key' | 'oauth2' | 'custom';
  name: string;
  config: Record<string, any>;
  claimMapping?: ClaimMapping[];
}

interface ClaimMapping {
  claim: string;
  header?: string;
  context?: string;
}

interface QueryPlan {
  id: string;
  operationName?: string;
  operationType: 'query' | 'mutation' | 'subscription';
  hash: string;
  plan: QueryPlanNode;
  subgraphFetches: SubgraphFetch[];
  estimatedCost: number;
  createdAt: Date;
}

interface QueryPlanNode {
  kind: 'Sequence' | 'Parallel' | 'Fetch' | 'Flatten' | 'Defer';
  nodes?: QueryPlanNode[];
  subgraphName?: string;
  operation?: string;
  requires?: string[];
}

interface SubgraphFetch {
  subgraphName: string;
  operation: string;
  variables: string[];
  representations?: boolean;
  parallel: boolean;
  order: number;
}

interface FederationDirective {
  name: string;
  locations: string[];
  arguments?: DirectiveArgument[];
  description: string;
  usage: string;
}

interface DirectiveArgument {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

// Federation 2.0 Directives
const FEDERATION_DIRECTIVES: FederationDirective[] = [
  {
    name: '@key',
    locations: ['OBJECT', 'INTERFACE'],
    arguments: [
      { name: 'fields', type: 'FieldSet!', required: true, description: 'The set of fields that uniquely identify the entity' },
      { name: 'resolvable', type: 'Boolean', required: false, description: 'Whether this subgraph can resolve the entity' }
    ],
    description: 'Designates an object type as an entity and specifies its key fields',
    usage: '@key(fields: "id")'
  },
  {
    name: '@shareable',
    locations: ['OBJECT', 'FIELD_DEFINITION'],
    description: 'Indicates a field can be resolved by multiple subgraphs',
    usage: '@shareable'
  },
  {
    name: '@external',
    locations: ['FIELD_DEFINITION'],
    description: 'Marks a field as externally defined in another subgraph',
    usage: '@external'
  },
  {
    name: '@requires',
    locations: ['FIELD_DEFINITION'],
    arguments: [
      { name: 'fields', type: 'FieldSet!', required: true, description: 'Fields required from parent entity' }
    ],
    description: 'Specifies fields from the parent entity needed to resolve this field',
    usage: '@requires(fields: "price quantity")'
  },
  {
    name: '@provides',
    locations: ['FIELD_DEFINITION'],
    arguments: [
      { name: 'fields', type: 'FieldSet!', required: true, description: 'Fields this field provides' }
    ],
    description: 'Specifies fields this field can provide when returning an entity',
    usage: '@provides(fields: "name email")'
  },
  {
    name: '@override',
    locations: ['FIELD_DEFINITION'],
    arguments: [
      { name: 'from', type: 'String!', required: true, description: 'Subgraph name to override from' }
    ],
    description: 'Overrides resolution of a field from another subgraph',
    usage: '@override(from: "products")'
  },
  {
    name: '@inaccessible',
    locations: ['FIELD_DEFINITION', 'OBJECT', 'INTERFACE', 'UNION', 'ARGUMENT_DEFINITION', 'SCALAR', 'ENUM', 'ENUM_VALUE', 'INPUT_OBJECT', 'INPUT_FIELD_DEFINITION'],
    description: 'Hides a schema element from the supergraph API',
    usage: '@inaccessible'
  },
  {
    name: '@tag',
    locations: ['FIELD_DEFINITION', 'OBJECT', 'INTERFACE', 'UNION', 'ARGUMENT_DEFINITION', 'SCALAR', 'ENUM', 'ENUM_VALUE', 'INPUT_OBJECT', 'INPUT_FIELD_DEFINITION'],
    arguments: [
      { name: 'name', type: 'String!', required: true, description: 'Tag name' }
    ],
    description: 'Applies arbitrary tags to schema elements for organization',
    usage: '@tag(name: "internal")'
  }
];

interface EntityReference {
  __typename: string;
  [key: string]: any;
}

interface EntityResolver<T> {
  __resolveReference: (reference: EntityReference, context: Context) => Promise<T | null>;
}
```

## Service Implementation

```typescript
class FederationService {
  // Schema management
  async composeSupergraph(subgraphs: SubgraphInput[]): Promise<CompositionResult>;
  async validateSubgraphSchema(schema: string): Promise<ValidationResult>;
  async publishSubgraph(subgraph: SubgraphPublishInput): Promise<Subgraph>;
  async removeSubgraph(subgraphName: string): Promise<void>;
  async getSupergraphSdl(): Promise<string>;

  // Gateway configuration
  async configureGateway(config: GatewayConfigInput): Promise<GatewayConfig>;
  async updateGatewayConfig(updates: Partial<GatewayConfig>): Promise<GatewayConfig>;
  async getGatewayHealth(): Promise<GatewayHealth>;

  // Query planning
  async explainQuery(query: string, variables?: Record<string, any>): Promise<QueryPlan>;
  async getQueryPlanCache(): Promise<QueryPlanCacheStats>;
  async invalidateQueryPlanCache(): Promise<void>;

  // Entity resolution
  async resolveEntity(typename: string, reference: EntityReference): Promise<any>;
  async batchResolveEntities(representations: EntityReference[]): Promise<any[]>;

  // Monitoring
  async getSubgraphMetrics(subgraphName: string, timeRange: TimeRange): Promise<SubgraphMetrics>;
  async getOperationMetrics(timeRange: TimeRange): Promise<OperationMetrics[]>;
  async getSlowOperations(threshold: number): Promise<SlowOperation[]>;
  async getErrorRates(): Promise<ErrorRateReport>;

  // Schema checks
  async checkSchemaCompatibility(proposedSchema: string, subgraphName: string): Promise<CompatibilityResult>;
  async getSchemaChanges(fromVersion: string, toVersion: string): Promise<SchemaChange[]>;
  async runContractChecks(contractName: string): Promise<ContractCheckResult>;
}

// Subgraph base class
abstract class FederatedSubgraph {
  abstract name: string;
  abstract typeDefs: string;
  abstract resolvers: Resolvers;

  // Entity resolver helper
  protected createEntityResolver<T>(
    typename: string,
    resolver: (reference: EntityReference, context: Context) => Promise<T | null>
  ): EntityResolver<T> {
    return {
      __resolveReference: resolver
    };
  }

  // Reference resolver for cross-subgraph queries
  protected async resolveReference<T>(
    typename: string,
    key: Record<string, any>,
    loader: DataLoader<string, T>
  ): Promise<T | null> {
    const keyString = JSON.stringify(key);
    return loader.load(keyString);
  }
}
```

## Subgraph Examples

```typescript
// Users Subgraph
const usersSubgraph = `
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3"
          import: ["@key", "@shareable", "@external"])

  type Query {
    user(id: ID!): User
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    email: String!
    name: String!
    avatar: String
    role: UserRole!
    createdAt: DateTime!
  }

  enum UserRole {
    ADMIN
    USER
    GUEST
  }
`;

// Products Subgraph
const productsSubgraph = `
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3"
          import: ["@key", "@shareable", "@external", "@requires"])

  type Query {
    product(id: ID!): Product
    products(filter: ProductFilter): ProductConnection!
  }

  type Product @key(fields: "id") @key(fields: "sku") {
    id: ID!
    sku: String!
    name: String!
    description: String
    price: Money!
    inventory: Int!
    category: Category
  }

  type Category @key(fields: "id") {
    id: ID!
    name: String!
    products: [Product!]!
  }

  # Extend User from users subgraph
  type User @key(fields: "id") {
    id: ID! @external
    purchasedProducts: [Product!]!
  }
`;

// Orders Subgraph
const ordersSubgraph = `
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3"
          import: ["@key", "@shareable", "@external", "@requires", "@provides"])

  type Query {
    order(id: ID!): Order
    orders(userId: ID, status: OrderStatus): [Order!]!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!
  }

  type Order @key(fields: "id") {
    id: ID!
    user: User!
    items: [OrderItem!]!
    total: Money!
    status: OrderStatus!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    product: Product!
    quantity: Int!
    unitPrice: Money!
    total: Money! @requires(fields: "quantity unitPrice { amount currency }")
  }

  # Extend User from users subgraph
  type User @key(fields: "id") {
    id: ID! @external
    orders: [Order!]!
    totalSpent: Money!
  }

  # Extend Product from products subgraph
  type Product @key(fields: "id") {
    id: ID! @external
    name: String! @external
    price: Money! @external
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    SHIPPED
    DELIVERED
    CANCELLED
  }
`;

// Entity resolvers example
const ordersResolvers = {
  Order: {
    __resolveReference: async (ref: { id: string }, context: Context) => {
      return context.dataSources.orders.getOrderById(ref.id);
    },
    user: async (order: Order, _args: any, context: Context) => {
      return { __typename: 'User', id: order.userId };
    },
    items: async (order: Order, _args: any, context: Context) => {
      return context.dataSources.orders.getOrderItems(order.id);
    }
  },
  OrderItem: {
    product: async (item: OrderItem) => {
      return { __typename: 'Product', id: item.productId };
    },
    total: (item: OrderItem) => {
      return {
        amount: item.unitPrice.amount * item.quantity,
        currency: item.unitPrice.currency
      };
    }
  },
  User: {
    orders: async (user: { id: string }, _args: any, context: Context) => {
      return context.dataSources.orders.getOrdersByUserId(user.id);
    },
    totalSpent: async (user: { id: string }, _args: any, context: Context) => {
      return context.dataSources.orders.calculateTotalSpent(user.id);
    }
  },
  Query: {
    order: async (_parent: any, { id }: { id: string }, context: Context) => {
      return context.dataSources.orders.getOrderById(id);
    },
    orders: async (_parent: any, args: OrdersArgs, context: Context) => {
      return context.dataSources.orders.getOrders(args);
    }
  }
};
```

## Gateway Configuration

```yaml
# Apollo Router configuration (router.yaml)
supergraph:
  listen: 0.0.0.0:4000
  introspection: true

include_subgraph_errors:
  all: true

headers:
  all:
    request:
      - propagate:
          named: "Authorization"
      - propagate:
          named: "X-Tenant-ID"
      - insert:
          name: "X-Request-ID"
          value: "${uuid()}"

authentication:
  router:
    jwt:
      jwks:
        url: "https://auth.quik.nation/.well-known/jwks.json"
      header_name: Authorization
      header_value_prefix: "Bearer "

authorization:
  require_authentication: false
  directives:
    enabled: true

traffic_shaping:
  all:
    timeout: 30s
    rate_limit:
      capacity: 1000
      interval: 1s

telemetry:
  apollo:
    client_name_header: "apollographql-client-name"
    client_version_header: "apollographql-client-version"
  tracing:
    trace_config:
      service_name: "quik-gateway"
      sampler:
        parent_based:
          root:
            ratio: 0.1
    otlp:
      endpoint: "http://otel-collector:4317"

plugins:
  - name: rhai
    path: ./plugins/tenant_context.rhai
```

## Database Schema

```sql
-- Subgraph registry
CREATE TABLE federation_subgraphs (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  routing_url TEXT NOT NULL,
  schema_sdl TEXT NOT NULL,
  version VARCHAR(50) NOT NULL,
  status VARCHAR(30) DEFAULT 'active',
  entities JSONB DEFAULT '[]',
  health_check_url TEXT,
  auth_type VARCHAR(30),
  auth_config JSONB,
  headers JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supergraph versions
CREATE TABLE federation_supergraphs (
  id UUID PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  supergraph_sdl TEXT NOT NULL,
  composition_errors JSONB,
  status VARCHAR(30) DEFAULT 'healthy',
  subgraph_versions JSONB NOT NULL,
  composed_at TIMESTAMPTZ DEFAULT NOW(),
  deployed_at TIMESTAMPTZ,
  deployed_by UUID
);

-- Query plans cache
CREATE TABLE federation_query_plans (
  id UUID PRIMARY KEY,
  operation_hash VARCHAR(64) UNIQUE NOT NULL,
  operation_name VARCHAR(255),
  operation_type VARCHAR(20) NOT NULL,
  query_plan JSONB NOT NULL,
  subgraph_fetches JSONB NOT NULL,
  estimated_cost INTEGER,
  execution_count BIGINT DEFAULT 0,
  avg_duration_ms DECIMAL(10,2),
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema history
CREATE TABLE federation_schema_history (
  id UUID PRIMARY KEY,
  subgraph_name VARCHAR(100) NOT NULL,
  schema_sdl TEXT NOT NULL,
  version VARCHAR(50) NOT NULL,
  changes JSONB,
  published_by UUID,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operation metrics
CREATE TABLE federation_operation_metrics (
  id UUID PRIMARY KEY,
  operation_hash VARCHAR(64) NOT NULL,
  operation_name VARCHAR(255),
  client_name VARCHAR(100),
  client_version VARCHAR(50),
  duration_ms INTEGER NOT NULL,
  subgraph_fetches INTEGER,
  cache_hit BOOLEAN,
  error BOOLEAN,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subgraphs_name ON federation_subgraphs(name);
CREATE INDEX idx_supergraphs_version ON federation_supergraphs(version);
CREATE INDEX idx_query_plans_hash ON federation_query_plans(operation_hash);
CREATE INDEX idx_schema_history_subgraph ON federation_schema_history(subgraph_name);
CREATE INDEX idx_metrics_timestamp ON federation_operation_metrics(timestamp);
CREATE INDEX idx_metrics_operation ON federation_operation_metrics(operation_hash);
```

## API Endpoints

```typescript
// POST /api/federation/compose - Compose supergraph
// POST /api/federation/subgraphs - Publish subgraph
// GET /api/federation/subgraphs - List subgraphs
// GET /api/federation/subgraphs/:name - Get subgraph
// DELETE /api/federation/subgraphs/:name - Remove subgraph
// GET /api/federation/supergraph - Get supergraph SDL
// POST /api/federation/validate - Validate subgraph schema
// POST /api/federation/check - Check schema compatibility
// GET /api/federation/health - Get gateway health
// POST /api/federation/explain - Explain query plan
// GET /api/federation/metrics - Get operation metrics
// GET /api/federation/metrics/:subgraph - Get subgraph metrics
// GET /api/federation/slow-operations - Get slow operations
// POST /api/federation/cache/invalidate - Invalidate query plan cache
```

## Related Skills
- `tenant-management-standard.md` - Multi-tenant context
- `graphql-backend-enforcer` - Subgraph implementation
- `graphql-apollo-frontend` - Client consumption

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: Federation
