# Music Royalty Standard

Royalty tracking, distribution, and PRO (Performance Rights Organization) integration.

## Target Project
- **QuikSession** - Multi-tenant music industry platform

## Royalty Types

### 1. Performance Royalties
Collected when music is publicly performed (radio, streaming, live venues).

```typescript
interface PerformanceRoyalty {
  id: string;
  songId: string;
  source: 'streaming' | 'radio' | 'tv' | 'live' | 'digital';
  platform?: string;           // Spotify, Apple Music, etc.
  territory: string;           // ISO country code
  period: {
    start: Date;
    end: Date;
  };
  plays: number;
  grossAmount: number;
  currency: string;
  proCollection: PROCollection;
  distributions: RoyaltyDistribution[];
  status: 'pending' | 'processed' | 'distributed';
  createdAt: Date;
}

interface PROCollection {
  writerPro: 'ASCAP' | 'BMI' | 'SESAC' | 'GMR';
  publisherPro: string;
  collectionDate: Date;
  statementId: string;
}
```

### 2. Mechanical Royalties
Paid for reproduction of music (streams, downloads, physical copies).

```typescript
interface MechanicalRoyalty {
  id: string;
  songId: string;
  source: 'streaming' | 'download' | 'physical' | 'sync';
  platform?: string;
  territory: string;
  period: {
    start: Date;
    end: Date;
  };
  units: number;               // Streams, downloads, or copies
  ratePerUnit: number;         // Statutory rate or negotiated
  grossAmount: number;
  currency: string;
  mlcCollection?: {            // Mechanical Licensing Collective (US)
    statementId: string;
    collectionDate: Date;
  };
  distributions: RoyaltyDistribution[];
  status: 'pending' | 'processed' | 'distributed';
}
```

### 3. Sync Royalties
Paid for use of music in visual media (film, TV, commercials, games).

```typescript
interface SyncRoyalty {
  id: string;
  songId: string;
  licenseType: 'film' | 'tv' | 'commercial' | 'game' | 'trailer' | 'web';
  licensee: {
    name: string;
    company: string;
    contact: string;
  };
  project: {
    title: string;
    description: string;
    releaseDate?: Date;
  };
  terms: {
    territory: string[];
    duration: string;          // "In perpetuity", "3 years", etc.
    media: string[];           // "All media", "Theatrical only", etc.
    exclusivity: boolean;
  };
  fees: {
    masterFee: number;
    syncFee: number;
    totalFee: number;
    currency: string;
  };
  distributions: RoyaltyDistribution[];
  status: 'negotiating' | 'approved' | 'paid' | 'distributed';
}
```

## Royalty Distribution Engine

```typescript
export class RoyaltyDistributionService {
  /**
   * Calculate distributions based on split sheet
   */
  async calculateDistributions(
    royalty: PerformanceRoyalty | MechanicalRoyalty,
    splitSheet: SplitSheet
  ): Promise<RoyaltyDistribution[]> {
    const distributions: RoyaltyDistribution[] = [];
    const grossAmount = royalty.grossAmount;

    for (const split of splitSheet.splits) {
      const participantAmount = (grossAmount * split.percentage) / 100;

      // Writer's share
      distributions.push({
        id: generateId(),
        royaltyId: royalty.id,
        recipientId: split.participantId,
        recipientType: 'writer',
        percentage: split.percentage,
        grossAmount: participantAmount,
        fees: this.calculateFees(participantAmount, split),
        netAmount: participantAmount - this.calculateFees(participantAmount, split),
        status: 'pending'
      });

      // Publisher's share (if applicable)
      if (split.publisherInfo) {
        const publisherAmount = (participantAmount * split.publisherInfo.percentage) / 100;
        distributions.push({
          id: generateId(),
          royaltyId: royalty.id,
          recipientId: split.publisherInfo.id,
          recipientType: 'publisher',
          percentage: (split.percentage * split.publisherInfo.percentage) / 100,
          grossAmount: publisherAmount,
          fees: this.calculatePublisherFees(publisherAmount),
          netAmount: publisherAmount - this.calculatePublisherFees(publisherAmount),
          status: 'pending'
        });
      }
    }

    return distributions;
  }

  /**
   * Process royalty payout
   */
  async processDistributions(royaltyId: string): Promise<PayoutResult> {
    const distributions = await this.getDistributions(royaltyId);
    const results: PayoutResult = { successful: [], failed: [] };

    for (const dist of distributions) {
      try {
        // Get recipient's payout preferences
        const recipient = await this.getRecipient(dist.recipientId);

        if (dist.netAmount >= recipient.minimumPayout) {
          // Process payout via Stripe Connect
          const payout = await this.stripeService.createTransfer({
            amount: Math.round(dist.netAmount * 100), // cents
            currency: 'usd',
            destination: recipient.stripeAccountId,
            metadata: {
              royaltyId: royaltyId,
              distributionId: dist.id,
              type: dist.recipientType
            }
          });

          await this.updateDistributionStatus(dist.id, 'paid', payout.id);
          results.successful.push(dist);
        } else {
          // Hold for accumulation
          await this.updateDistributionStatus(dist.id, 'held');
        }
      } catch (error) {
        await this.updateDistributionStatus(dist.id, 'failed', null, error.message);
        results.failed.push({ distribution: dist, error: error.message });
      }
    }

    return results;
  }

  /**
   * Calculate platform/admin fees
   */
  private calculateFees(amount: number, split: Split): number {
    const adminFee = amount * 0.05;  // 5% platform fee
    return adminFee;
  }
}
```

## PRO Integration

```typescript
export class PROIntegrationService {
  /**
   * Register work with PRO
   */
  async registerWork(
    song: Song,
    splitSheet: SplitSheet,
    pro: 'ASCAP' | 'BMI' | 'SESAC'
  ): Promise<PRORegistration> {
    const workData = {
      title: song.title,
      alternativeTitles: song.alternativeTitles,
      iswc: song.iswc,
      writers: splitSheet.splits.map(s => ({
        name: s.participantName,
        ipiNumber: s.ipiNumber,
        role: this.mapRoleToPRO(s.role),
        share: s.percentage,
        proAffiliation: s.proAffiliation
      })),
      publishers: splitSheet.splits
        .filter(s => s.publisherInfo)
        .map(s => ({
          name: s.publisherInfo!.name,
          ipiNumber: s.publisherInfo!.ipiNumber,
          share: (s.percentage * s.publisherInfo!.percentage) / 100
        }))
    };

    // Call PRO-specific API
    switch (pro) {
      case 'ASCAP':
        return this.registerWithASCAP(workData);
      case 'BMI':
        return this.registerWithBMI(workData);
      case 'SESAC':
        return this.registerWithSESAC(workData);
    }
  }

  /**
   * Import royalty statements
   */
  async importStatement(
    pro: string,
    statementFile: Buffer
  ): Promise<ImportResult> {
    // Parse statement format (varies by PRO)
    const parser = this.getParser(pro);
    const entries = await parser.parse(statementFile);

    const results: ImportResult = {
      imported: 0,
      matched: 0,
      unmatched: []
    };

    for (const entry of entries) {
      // Match to internal song catalog
      const song = await this.matchSong(entry);

      if (song) {
        await this.createRoyaltyEntry(song, entry);
        results.matched++;
      } else {
        results.unmatched.push(entry);
      }
      results.imported++;
    }

    return results;
  }
}
```

## Royalty Dashboard

```typescript
interface RoyaltyDashboard {
  summary: {
    totalEarnings: number;
    pendingPayouts: number;
    lastPayoutDate: Date;
    lastPayoutAmount: number;
  };
  bySource: {
    streaming: number;
    radio: number;
    sync: number;
    mechanical: number;
    other: number;
  };
  byPeriod: {
    period: string;
    amount: number;
  }[];
  bySong: {
    songId: string;
    title: string;
    totalEarnings: number;
    plays: number;
  }[];
  recentActivity: RoyaltyActivity[];
}

// Dashboard API
router.get('/royalties/dashboard', async (req, res) => {
  const userId = req.auth.userId;
  const dashboard = await royaltyService.getDashboard(userId, {
    startDate: req.query.startDate,
    endDate: req.query.endDate
  });
  res.json(dashboard);
});
```

## Database Schema

```sql
-- Royalty Entries
CREATE TABLE royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  song_id UUID NOT NULL REFERENCES songs(id),
  type VARCHAR(50) NOT NULL,  -- performance, mechanical, sync
  source VARCHAR(50) NOT NULL,
  platform VARCHAR(100),
  territory VARCHAR(10),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  units BIGINT,
  rate_per_unit DECIMAL(10,6),
  gross_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  pro_statement_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Royalty Distributions
CREATE TABLE royalty_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  royalty_id UUID NOT NULL REFERENCES royalties(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  recipient_type VARCHAR(50) NOT NULL,  -- writer, publisher
  percentage DECIMAL(5,2) NOT NULL,
  gross_amount DECIMAL(12,2) NOT NULL,
  fees DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payout_id VARCHAR(100),  -- Stripe transfer ID
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync Licenses
CREATE TABLE sync_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  song_id UUID NOT NULL REFERENCES songs(id),
  license_type VARCHAR(50) NOT NULL,
  licensee_name VARCHAR(255) NOT NULL,
  licensee_company VARCHAR(255),
  project_title VARCHAR(255) NOT NULL,
  terms JSONB NOT NULL,
  master_fee DECIMAL(12,2),
  sync_fee DECIMAL(12,2),
  total_fee DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'negotiating',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_royalties_song ON royalties(song_id);
CREATE INDEX idx_royalties_period ON royalties(period_start, period_end);
CREATE INDEX idx_distributions_recipient ON royalty_distributions(recipient_id);
CREATE INDEX idx_distributions_status ON royalty_distributions(status);
```

## Stripe Connect Integration

```typescript
// Recipient onboarding for payouts
export class RoyaltyPayoutService {
  async onboardRecipient(userId: string): Promise<string> {
    const user = await this.userService.getUser(userId);

    const account = await stripe.accounts.create({
      type: 'express',
      country: user.country,
      email: user.email,
      capabilities: {
        transfers: { requested: true }
      },
      metadata: {
        userId: userId,
        type: 'royalty_recipient'
      }
    });

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.APP_URL}/royalties/onboarding/refresh`,
      return_url: `${process.env.APP_URL}/royalties/onboarding/complete`,
      type: 'account_onboarding'
    });

    return accountLink.url;
  }
}
```

## Related Skills
- `music-contracts-standard` - Split sheet management
- `music-session-collaboration-standard` - Session context
- `stripe-connect-specialist` - Payment processing
