# Music Copyright Standard

Copyright registration, management, and conflict detection for music works.

## Target Project
- **QuikSession** - Multi-tenant music industry platform

## Copyright Types

### Sound Recording (Master)
The actual recorded performance - owned by record label or artist.

### Musical Composition (Publishing)
The underlying song (lyrics + melody) - owned by writers/publishers.

```typescript
interface Copyright {
  id: string;
  workId: string;
  type: 'sound_recording' | 'musical_composition';
  title: string;
  alternativeTitles: string[];

  // Identifiers
  isrc?: string;              // Sound recordings (International Standard Recording Code)
  iswc?: string;              // Compositions (International Standard Musical Work Code)
  upc?: string;               // Releases (Universal Product Code)

  // Registration
  registrationStatus: 'unregistered' | 'pending' | 'registered';
  registrationNumber?: string;
  registrationDate?: Date;
  registrationTerritory: string;

  // Ownership
  owners: CopyrightOwner[];

  // Metadata
  creationDate: Date;
  publicationDate?: Date;
  duration?: number;          // In seconds

  // Chain of title
  chainOfTitle: ChainOfTitleEntry[];

  createdAt: Date;
  updatedAt: Date;
}

interface CopyrightOwner {
  id: string;
  name: string;
  type: 'individual' | 'company';
  ownershipPercentage: number;
  role: 'author' | 'composer' | 'publisher' | 'label' | 'heir';
  territory: string[];        // Where ownership applies
  startDate: Date;
  endDate?: Date;             // If ownership transferred
}

interface ChainOfTitleEntry {
  id: string;
  date: Date;
  type: 'creation' | 'assignment' | 'license' | 'reversion' | 'termination';
  fromParty?: string;
  toParty: string;
  percentage: number;
  territory: string[];
  documentRef?: string;
  notes?: string;
}
```

## ISRC/ISWC Management

```typescript
export class MusicIdentifierService {
  private isrcPrefix: string;  // Assigned by RIAA
  private isrcYear: string;
  private isrcCounter: number;

  /**
   * Generate ISRC for new recording
   * Format: CC-XXX-YY-NNNNN
   * CC = Country, XXX = Registrant, YY = Year, NNNNN = Designation
   */
  async generateISRC(recording: Recording): Promise<string> {
    const country = 'US';
    const registrant = this.isrcPrefix;  // e.g., 'QZK'
    const year = new Date().getFullYear().toString().slice(-2);
    const designation = String(await this.getNextDesignation()).padStart(5, '0');

    const isrc = `${country}${registrant}${year}${designation}`;

    // Store and return
    await this.storeISRC(recording.id, isrc);
    return isrc;
  }

  /**
   * Validate ISRC format
   */
  validateISRC(isrc: string): boolean {
    // Remove hyphens for validation
    const normalized = isrc.replace(/-/g, '');

    // ISRC is always 12 characters
    if (normalized.length !== 12) return false;

    // First 2 chars are country code (letters)
    if (!/^[A-Z]{2}/.test(normalized)) return false;

    // Next 3 chars are registrant (alphanumeric)
    if (!/^[A-Z]{2}[A-Z0-9]{3}/.test(normalized)) return false;

    // Next 2 chars are year (digits)
    if (!/^[A-Z]{2}[A-Z0-9]{3}\d{2}/.test(normalized)) return false;

    // Last 5 chars are designation (digits)
    if (!/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(normalized)) return false;

    return true;
  }

  /**
   * Request ISWC from agency
   * (Typically assigned by PROs or music publishers)
   */
  async requestISWC(composition: Composition): Promise<ISWCRequest> {
    return {
      id: generateId(),
      compositionId: composition.id,
      title: composition.title,
      writers: composition.writers,
      status: 'pending',
      submittedAt: new Date()
    };
  }
}
```

## Copyright Registration Service

```typescript
export class CopyrightRegistrationService {
  /**
   * Prepare US Copyright Office registration
   */
  async prepareUSRegistration(
    work: Copyright,
    type: 'SR' | 'PA'  // SR = Sound Recording, PA = Performing Arts
  ): Promise<RegistrationPackage> {
    const package: RegistrationPackage = {
      formType: type,
      title: {
        titleOfWork: work.title,
        previousOrAlternativeTitles: work.alternativeTitles,
        yearOfCompletion: work.creationDate.getFullYear(),
        dateOfFirstPublication: work.publicationDate,
        nationOfFirstPublication: 'United States'
      },
      authors: work.owners
        .filter(o => ['author', 'composer'].includes(o.role))
        .map(o => ({
          name: o.name,
          citizenship: 'United States',
          domicile: 'United States',
          authorCreated: type === 'SR' ? 'Sound Recording' : 'Music and Lyrics',
          workMadeForHire: false
        })),
      claimants: work.owners
        .filter(o => o.ownershipPercentage > 0)
        .map(o => ({
          name: o.name,
          address: o.address,
          transferStatement: o.role !== 'author'
            ? 'By written agreement'
            : undefined
        })),
      deposit: {
        type: 'digital',
        format: type === 'SR' ? 'audio/wav' : 'application/pdf'
      },
      fee: type === 'SR' ? 65 : 45  // Current USCO fees
    };

    return package;
  }

  /**
   * Submit to Copyright Office API
   */
  async submitRegistration(
    package: RegistrationPackage,
    depositFiles: Buffer[]
  ): Promise<RegistrationResult> {
    // Copyright Office API integration
    const submission = await this.copyrightOfficeApi.submit({
      form: package,
      deposits: depositFiles,
      payment: {
        method: 'credit_card',
        amount: package.fee
      }
    });

    return {
      submissionId: submission.id,
      status: 'pending',
      estimatedProcessingTime: '3-6 months',
      submittedAt: new Date()
    };
  }
}
```

## Conflict Detection

```typescript
export class CopyrightConflictService {
  /**
   * Check for potential conflicts before registration
   */
  async checkConflicts(work: Copyright): Promise<ConflictReport> {
    const conflicts: Conflict[] = [];

    // 1. Check internal catalog for similar titles
    const similarTitles = await this.findSimilarTitles(work.title);
    for (const similar of similarTitles) {
      if (similar.similarity > 0.85) {
        conflicts.push({
          type: 'title_similarity',
          severity: 'warning',
          existingWork: similar,
          message: `Similar title found: "${similar.title}" (${Math.round(similar.similarity * 100)}% match)`
        });
      }
    }

    // 2. Check for overlapping ownership claims
    const ownershipConflicts = await this.checkOwnershipConflicts(work);
    conflicts.push(...ownershipConflicts);

    // 3. Check for existing registrations
    const existingRegistrations = await this.searchRegistrations(work);
    if (existingRegistrations.length > 0) {
      conflicts.push({
        type: 'existing_registration',
        severity: 'error',
        existingWork: existingRegistrations[0],
        message: 'This work may already be registered'
      });
    }

    // 4. Audio fingerprint check (for sound recordings)
    if (work.type === 'sound_recording' && work.audioFingerprint) {
      const fingerPrintMatches = await this.checkAudioFingerprint(work.audioFingerprint);
      for (const match of fingerPrintMatches) {
        conflicts.push({
          type: 'audio_match',
          severity: match.matchPercentage > 0.95 ? 'error' : 'warning',
          existingWork: match,
          message: `Audio fingerprint matches existing recording (${Math.round(match.matchPercentage * 100)}%)`
        });
      }
    }

    return {
      workId: work.id,
      hasConflicts: conflicts.length > 0,
      conflicts,
      checkedAt: new Date()
    };
  }

  /**
   * Fuzzy title matching
   */
  private async findSimilarTitles(title: string): Promise<SimilarWork[]> {
    // Normalize title
    const normalized = this.normalizeTitle(title);

    // Search with trigram similarity (PostgreSQL pg_trgm)
    const results = await this.db.query(`
      SELECT id, title,
             similarity(normalized_title, $1) as similarity
      FROM copyrights
      WHERE similarity(normalized_title, $1) > 0.3
      ORDER BY similarity DESC
      LIMIT 10
    `, [normalized]);

    return results.rows;
  }

  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
```

## Rights Management

```typescript
interface RightsCheck {
  workId: string;
  requestedRights: RequestedRight[];
  territory: string;
  startDate: Date;
  endDate: Date;
}

interface RequestedRight {
  type: 'sync' | 'mechanical' | 'performance' | 'print' | 'master';
  scope: 'exclusive' | 'non-exclusive';
  media: string[];
}

export class RightsManagementService {
  /**
   * Check if rights are available for licensing
   */
  async checkRightsAvailability(request: RightsCheck): Promise<RightsAvailability> {
    const work = await this.getCopyright(request.workId);
    const availability: RightsAvailability = {
      available: true,
      rights: []
    };

    for (const right of request.requestedRights) {
      // Check existing licenses
      const existingLicenses = await this.getExistingLicenses(
        request.workId,
        right.type,
        request.territory,
        request.startDate,
        request.endDate
      );

      // Check for exclusivity conflicts
      const exclusiveConflict = existingLicenses.some(
        l => l.scope === 'exclusive' && this.datesOverlap(l, request)
      );

      availability.rights.push({
        type: right.type,
        available: !exclusiveConflict,
        existingLicenses: existingLicenses,
        owners: work.owners.filter(o => this.ownerHasRight(o, right.type))
      });

      if (exclusiveConflict) {
        availability.available = false;
      }
    }

    return availability;
  }

  /**
   * Record rights transfer
   */
  async recordTransfer(
    workId: string,
    transfer: RightsTransfer
  ): Promise<ChainOfTitleEntry> {
    // Validate transfer
    const validation = await this.validateTransfer(workId, transfer);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create chain of title entry
    const entry: ChainOfTitleEntry = {
      id: generateId(),
      date: transfer.effectiveDate,
      type: 'assignment',
      fromParty: transfer.fromParty,
      toParty: transfer.toParty,
      percentage: transfer.percentage,
      territory: transfer.territory,
      documentRef: transfer.documentId,
      notes: transfer.notes
    };

    // Update ownership records
    await this.updateOwnership(workId, transfer);

    // Record in chain of title
    await this.addChainOfTitleEntry(workId, entry);

    return entry;
  }
}
```

## Database Schema

```sql
-- Copyrights
CREATE TABLE copyrights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  work_id UUID,  -- Reference to song or recording
  type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  normalized_title VARCHAR(500),
  alternative_titles TEXT[],
  isrc VARCHAR(12),
  iswc VARCHAR(15),
  registration_status VARCHAR(50) DEFAULT 'unregistered',
  registration_number VARCHAR(100),
  registration_date DATE,
  registration_territory VARCHAR(10),
  creation_date DATE NOT NULL,
  publication_date DATE,
  duration INTEGER,  -- seconds
  audio_fingerprint BYTEA,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copyright Owners
CREATE TABLE copyright_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copyright_id UUID NOT NULL REFERENCES copyrights(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES users(id),
  owner_name VARCHAR(255) NOT NULL,
  owner_type VARCHAR(50) NOT NULL,
  ownership_percentage DECIMAL(5,2) NOT NULL,
  role VARCHAR(50) NOT NULL,
  territory TEXT[],
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chain of Title
CREATE TABLE chain_of_title (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copyright_id UUID NOT NULL REFERENCES copyrights(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  from_party VARCHAR(255),
  to_party VARCHAR(255) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  territory TEXT[],
  document_ref VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copyright Registrations
CREATE TABLE copyright_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copyright_id UUID NOT NULL REFERENCES copyrights(id),
  submission_id VARCHAR(100),
  form_type VARCHAR(10) NOT NULL,  -- SR, PA, etc.
  status VARCHAR(50) DEFAULT 'pending',
  registration_number VARCHAR(100),
  submission_data JSONB,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_copyrights_isrc ON copyrights(isrc);
CREATE INDEX idx_copyrights_iswc ON copyrights(iswc);
CREATE INDEX idx_copyrights_title_trgm ON copyrights USING gin(normalized_title gin_trgm_ops);
CREATE INDEX idx_owners_copyright ON copyright_owners(copyright_id);
CREATE INDEX idx_chain_copyright ON chain_of_title(copyright_id);
```

## API Endpoints

```typescript
// Copyright Routes
router.post('/copyrights', createCopyright);
router.get('/copyrights/:id', getCopyright);
router.put('/copyrights/:id', updateCopyright);
router.get('/copyrights/:id/chain-of-title', getChainOfTitle);

// Registration
router.post('/copyrights/:id/register', initiateRegistration);
router.get('/copyrights/:id/registration-status', getRegistrationStatus);

// Conflict Detection
router.post('/copyrights/check-conflicts', checkConflicts);

// Rights Management
router.post('/copyrights/:id/check-availability', checkRightsAvailability);
router.post('/copyrights/:id/transfer', recordTransfer);

// Identifiers
router.post('/recordings/:id/generate-isrc', generateISRC);
router.post('/compositions/:id/request-iswc', requestISWC);
```

## Related Skills
- `music-contracts-standard` - Split sheet management
- `music-royalty-standard` - Royalty distribution
- `music-session-collaboration-standard` - Session context
