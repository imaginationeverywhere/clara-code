# Setup Google Analytics Backend Integration Command

## Overview
Implement comprehensive backend integration for Google Analytics including server-side tracking, database schema, API endpoints, remarketing services, and abandoned cart recovery systems.

## Prerequisites

⚠️ **REQUIRED**:
- Completed `setup-google-analytics` command
- GA4 service account with Reporting API access
- PostgreSQL database running
- Express.js backend server
- Redis for caching (optional but recommended)

## Command Usage

**In Claude Code:**
```
setup-ga-backend-integration
```

Or ask Claude naturally:
```
"Set up Google Analytics backend integration with database tracking"
"Implement server-side GA4 tracking and remarketing system"
```

## Step-by-Step Implementation

### Step 1: Service Account Setup
```
1. Create GA4 Service Account
   - Go to Google Cloud Console
   - Select your project
   - Navigate to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: "ga4-reporting-api"
   - Grant "Viewer" role

2. Download Service Account Key
   - Click on created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create New Key"
   - Select JSON format
   - Download and save securely

3. Add GA4 API Permissions
   - Go to Google Analytics → Admin
   - Select Property → Property Access Management
   - Add service account email with "Viewer" permissions
```

### Step 2: Environment Configuration
```bash
# Add to backend .env
GA_TRACKING_ID=G-XXXXXXXXXX
GA_PROPERTY_ID=123456789
GA_SERVICE_ACCOUNT_EMAIL=ga4-reporting-api@project.iam.gserviceaccount.com
GA_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/[PROJECT_NAME]

# Redis Cache (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Database Schema Creation
```sql
-- Analytics Events Storage
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    referrer TEXT,
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_content VARCHAR(255),
    utm_term VARCHAR(255),
    properties JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GA4 Raw Data Storage
CREATE TABLE ga4_raw_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    dimensions JSONB,
    metrics JSONB,
    raw_response JSONB,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processed Analytics Reports
CREATE TABLE analytics_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exit Tracking for Remarketing
CREATE TABLE exit_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    exit_page TEXT NOT NULL,
    time_on_page INTEGER, -- seconds
    scroll_depth INTEGER, -- percentage
    elements_clicked TEXT[], -- array of element IDs
    destination_domain TEXT,
    remarketing_segment VARCHAR(100),
    exit_intent BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Remarketing Audiences
CREATE TABLE remarketing_audiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    conditions JSONB NOT NULL,
    membership_duration_days INTEGER DEFAULT 30,
    user_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audience Membership
CREATE TABLE audience_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audience_id UUID REFERENCES remarketing_audiences(id),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(audience_id, user_id)
);

-- Abandoned Cart Tracking
CREATE TABLE abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    cart_data JSONB NOT NULL,
    cart_value DECIMAL(10,2),
    abandonment_stage VARCHAR(100), -- 'cart', 'checkout', 'payment'
    abandoned_at TIMESTAMPTZ DEFAULT NOW(),
    recovered_at TIMESTAMPTZ,
    recovery_email_sent BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_exit_tracking_session_id ON exit_tracking(session_id);
CREATE INDEX idx_exit_tracking_timestamp ON exit_tracking(timestamp);
CREATE INDEX idx_abandoned_carts_session_id ON abandoned_carts(session_id);
CREATE INDEX idx_audience_memberships_user_id ON audience_memberships(user_id);
```

### Step 4: Install Dependencies
```bash
# In your backend directory
npm install @google-analytics/data redis node-cron express-rate-limit
```

### Step 5: GA4 Service Implementation
```typescript
// src/services/ga4Service.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export class GA4Service {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor() {
    this.client = new BetaAnalyticsDataClient({
      keyFilename: process.env.GA_SERVICE_ACCOUNT_KEY_PATH,
    });
    this.propertyId = `properties/${process.env.GA_PROPERTY_ID}`;
  }

  async getOverviewReport(startDate: string, endDate: string) {
    const [response] = await this.client.runReport({
      property: this.propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'sessions' },
        { name: 'users' },
        { name: 'newUsers' },
        { name: 'sessionDuration' },
        { name: 'bounceRate' },
        { name: 'conversions' },
        { name: 'totalRevenue' }
      ],
    });

    return this.processReportData(response);
  }

  async getEcommerceReport(startDate: string, endDate: string) {
    const [response] = await this.client.runReport({
      property: this.propertyId,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'itemId' },
        { name: 'itemName' },
        { name: 'itemCategory' }
      ],
      metrics: [
        { name: 'itemRevenue' },
        { name: 'itemsPurchased' },
        { name: 'cartToViewRate' },
        { name: 'purchaseToViewRate' }
      ],
      orderBys: [{ metric: { metricName: 'itemRevenue' }, desc: true }]
    });

    return this.processEcommerceData(response);
  }

  async getRealtimeReport() {
    const [response] = await this.client.runRealtimeReport({
      property: this.propertyId,
      dimensions: [
        { name: 'country' },
        { name: 'deviceCategory' },
        { name: 'unifiedPageScreen' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'conversions' }
      ],
    });

    return this.processRealtimeData(response);
  }

  private processReportData(response: any) {
    return {
      summary: this.extractSummaryMetrics(response),
      timeSeries: this.extractTimeSeriesData(response),
      totals: this.extractTotals(response)
    };
  }

  private processEcommerceData(response: any) {
    return {
      products: response.rows?.map((row: any) => ({
        id: row.dimensionValues[0]?.value,
        name: row.dimensionValues[1]?.value,
        category: row.dimensionValues[2]?.value,
        revenue: parseFloat(row.metricValues[0]?.value || '0'),
        quantity: parseInt(row.metricValues[1]?.value || '0'),
        cartToViewRate: parseFloat(row.metricValues[2]?.value || '0'),
        purchaseToViewRate: parseFloat(row.metricValues[3]?.value || '0')
      })) || []
    };
  }
}
```

### Step 6: Analytics API Routes
```typescript
// src/routes/analytics.ts
import express from 'express';
import { GA4Service } from '../services/ga4Service';
import { RemarketingService } from '../services/remarketingService';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting middleware
const eventRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many analytics events, please try again later.',
});

// Event collection endpoint
router.post('/events', eventRateLimit, async (req, res) => {
  try {
    const { event, properties, timestamp, url, userAgent } = req.body;
    
    // Store event in database
    await db.query(`
      INSERT INTO analytics_events 
      (event_name, session_id, timestamp, page_url, user_agent, properties)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [event, req.sessionID, timestamp, url, userAgent, properties]);
    
    // Process for remarketing if applicable
    const remarketingService = new RemarketingService();
    await remarketingService.processRemarketingEvent(event, properties, req.sessionID);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics event error:', error);
    res.status(500).json({ error: 'Failed to store event' });
  }
});

// GA4 data retrieval endpoints
router.get('/reports/:reportType', async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate } = req.query;
    
    const ga4Service = new GA4Service();
    let report;
    
    switch (reportType) {
      case 'overview':
        report = await ga4Service.getOverviewReport(startDate as string, endDate as string);
        break;
      case 'ecommerce':
        report = await ga4Service.getEcommerceReport(startDate as string, endDate as string);
        break;
      case 'realtime':
        report = await ga4Service.getRealtimeReport();
        break;
      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('GA4 report error:', error);
    res.status(500).json({ error: 'Failed to retrieve report' });
  }
});

export default router;
```

### Step 7: Remarketing Service Implementation
```typescript
// src/services/remarketingService.ts
export class RemarketingService {
  
  async processRemarketingEvent(eventName: string, properties: any, sessionId: string) {
    switch (eventName) {
      case 'add_to_cart':
        await this.addToAudience('cart_abandoners', sessionId, properties);
        break;
      case 'view_item':
        if (!await this.hasRecentPurchase(sessionId)) {
          await this.addToAudience('product_viewers', sessionId, properties);
        }
        break;
      case 'page_exit':
        await this.processExitEvent(properties, sessionId);
        break;
      case 'purchase':
        await this.removeFromAudience('cart_abandoners', sessionId);
        await this.addToAudience('purchasers', sessionId, properties);
        break;
    }
  }

  async createDefaultAudiences() {
    const defaultAudiences = [
      {
        name: 'cart_abandoners',
        description: 'Users who added items to cart but did not purchase',
        conditions: { events: ['add_to_cart'], exclude_events: ['purchase'] },
        duration: 30
      },
      {
        name: 'product_viewers',
        description: 'Users who viewed products but did not add to cart',
        conditions: { events: ['view_item'], exclude_events: ['add_to_cart'] },
        duration: 30
      },
      {
        name: 'engaged_browsers',
        description: 'Users with high engagement but no purchase',
        conditions: { 
          session_duration: { min: 60 },
          scroll_depth: { min: 50 },
          exclude_events: ['purchase']
        },
        duration: 60
      }
    ];

    for (const audience of defaultAudiences) {
      await db.query(`
        INSERT INTO remarketing_audiences (name, description, conditions, membership_duration_days)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [audience.name, audience.description, audience.conditions, audience.duration]);
    }
  }

  async addToAudience(audienceName: string, sessionId: string, properties: any) {
    const audience = await db.query(`
      SELECT id FROM remarketing_audiences WHERE name = $1
    `, [audienceName]);

    if (audience.rows.length > 0) {
      const audienceId = audience.rows[0].id;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const userId = await this.getUserIdFromSession(sessionId);

      await db.query(`
        INSERT INTO audience_memberships (audience_id, user_id, session_id, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (audience_id, user_id) DO UPDATE SET
        joined_at = NOW(),
        expires_at = $4
      `, [audienceId, userId, sessionId, expiresAt]);

      await this.updateAudienceSize(audienceId);
    }
  }
}
```

### Step 8: Background Processing Setup
```typescript
// src/jobs/analyticsProcessor.ts
import cron from 'node-cron';

export class AnalyticsProcessor {
  
  // Run every hour to process events
  setupEventProcessing() {
    cron.schedule('0 * * * *', async () => {
      console.log('Processing analytics events...');
      await this.processUnprocessedEvents();
    });
  }

  // Run daily to generate reports
  setupReportGeneration() {
    cron.schedule('0 2 * * *', async () => {
      console.log('Generating daily reports...');
      await this.generateDailyReports();
    });
  }

  // Run weekly to clean old data
  setupDataCleanup() {
    cron.schedule('0 3 * * 0', async () => {
      console.log('Cleaning old analytics data...');
      await this.cleanupOldData();
    });
  }

  async processUnprocessedEvents() {
    const events = await db.query(`
      SELECT * FROM analytics_events 
      WHERE processed = FALSE 
      ORDER BY timestamp ASC
      LIMIT 1000
    `);

    for (const event of events.rows) {
      await this.processEvent(event);
      
      await db.query(`
        UPDATE analytics_events 
        SET processed = TRUE 
        WHERE id = $1
      `, [event.id]);
    }
  }
}
```

### Step 9: Express App Integration
```typescript
// Add to your existing Express app (src/index.ts or main server file)
import analyticsRoutes from './routes/analytics';
import { AnalyticsProcessor } from './jobs/analyticsProcessor';
import { RemarketingService } from './services/remarketingService';

// Add analytics routes
app.use('/api/analytics', analyticsRoutes);

// Initialize background processing
const analyticsProcessor = new AnalyticsProcessor();
analyticsProcessor.setupEventProcessing();
analyticsProcessor.setupReportGeneration();
analyticsProcessor.setupDataCleanup();

// Initialize default remarketing audiences
const remarketingService = new RemarketingService();
remarketingService.createDefaultAudiences();
```

## Template Variables

When configuring this command for your project, replace:
- `[PROJECT_NAME]` → Your project name
- Service account details with your actual values
- Database connection details
- File paths with your actual project structure

## Success Criteria

✅ **Backend Integration Complete When**:
- Database schema created and indexed
- GA4 service account configured and working
- Analytics API endpoints responding
- Event collection storing data properly
- Remarketing audiences created and populating
- Background processing jobs running
- Admin dashboard displaying backend data
- Rate limiting and security measures active

## Monitoring & Maintenance

After setup, monitor:
- Database performance and storage usage
- GA4 API quota consumption
- Event processing pipeline health
- Audience membership updates
- Background job completion
- Redis cache performance (if used)

## Next Steps

After backend integration:
- Configure admin dashboard analytics tabs
- Set up abandoned cart recovery emails
- Implement advanced audience export
- Add custom industry-specific events
- Optimize performance based on usage patterns