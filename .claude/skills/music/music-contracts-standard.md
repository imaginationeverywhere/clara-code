# Music Contracts Standard

Music industry contract management including split sheets, publishing agreements, and DocuSign integration.

## Target Project
- **QuikSession** - Multi-tenant music industry platform

## Contract Types

### 1. Split Sheet
Defines ownership percentages for a recording or composition.

```typescript
interface SplitSheet {
  id: string;
  sessionId: string;
  songTitle: string;
  type: 'recording' | 'composition' | 'both';
  status: 'draft' | 'pending_signatures' | 'executed' | 'disputed';
  splits: Split[];
  totalPercentage: number;  // Must equal 100
  createdBy: string;
  createdAt: Date;
  executedAt?: Date;
  docusignEnvelopeId?: string;
}

interface Split {
  participantId: string;
  participantName: string;
  role: 'writer' | 'producer' | 'artist' | 'publisher';
  percentage: number;
  publisherInfo?: PublisherInfo;
  proAffiliation?: 'ASCAP' | 'BMI' | 'SESAC' | 'GMR';
  ipiNumber?: string;
  signature?: SignatureInfo;
}

interface PublisherInfo {
  name: string;
  percentage: number;  // Of the participant's share
  ipiNumber?: string;
}
```

### 2. Recording Agreement
```typescript
interface RecordingAgreement {
  id: string;
  sessionId: string;
  type: 'master_license' | 'work_for_hire' | 'collaboration' | 'producer_agreement';
  parties: ContractParty[];
  terms: RecordingTerms;
  status: ContractStatus;
  documents: ContractDocument[];
  createdAt: Date;
}

interface RecordingTerms {
  masterOwnership: OwnershipSplit[];
  advanceAmount?: number;
  royaltyRate?: number;
  territory: string[];
  term: {
    type: 'perpetual' | 'fixed' | 'options';
    years?: number;
    options?: number;
  };
  deliverables: Deliverable[];
}
```

### 3. Publishing Agreement
```typescript
interface PublishingAgreement {
  id: string;
  sessionId: string;
  type: 'admin_deal' | 'co_pub' | 'traditional' | 'work_for_hire';
  writer: ContractParty;
  publisher: ContractParty;
  terms: PublishingTerms;
  status: ContractStatus;
}

interface PublishingTerms {
  publisherShare: number;      // Typically 50% of publisher's share
  writerShare: number;         // Writer always keeps writer's share
  advanceAmount?: number;
  territory: string[];
  term: {
    type: 'life_of_copyright' | 'fixed' | 'reversion';
    years?: number;
    reversionConditions?: string;
  };
  adminFee?: number;           // For admin deals
}
```

## Split Sheet Calculator

```typescript
export class SplitSheetCalculator {
  /**
   * Calculate splits with publisher shares
   */
  calculateTotalSplits(splits: Split[]): CalculatedSplits {
    const result: CalculatedSplits = {
      writerShares: [],
      publisherShares: [],
      totalWriter: 0,
      totalPublisher: 0
    };

    splits.forEach(split => {
      // Writer's share (performance royalties)
      const writerShare = split.percentage;
      result.writerShares.push({
        participantId: split.participantId,
        name: split.participantName,
        percentage: writerShare,
        type: 'writer'
      });
      result.totalWriter += writerShare;

      // Publisher's share (mechanical royalties)
      if (split.publisherInfo) {
        const pubShare = (split.percentage * split.publisherInfo.percentage) / 100;
        result.publisherShares.push({
          participantId: split.participantId,
          name: split.publisherInfo.name,
          percentage: pubShare,
          type: 'publisher'
        });
        result.totalPublisher += pubShare;
      }
    });

    return result;
  }

  /**
   * Validate split sheet totals
   */
  validateSplits(splits: Split[]): ValidationResult {
    const total = splits.reduce((sum, s) => sum + s.percentage, 0);

    if (Math.abs(total - 100) > 0.001) {
      return {
        valid: false,
        error: `Splits must equal 100%. Current total: ${total}%`
      };
    }

    // Check for duplicate participants
    const participantIds = splits.map(s => s.participantId);
    const duplicates = participantIds.filter((id, i) => participantIds.indexOf(id) !== i);

    if (duplicates.length > 0) {
      return {
        valid: false,
        error: 'Duplicate participants found in split sheet'
      };
    }

    return { valid: true };
  }
}
```

## DocuSign Integration

```typescript
import { ApiClient, EnvelopesApi, EnvelopeDefinition } from 'docusign-esign';

export class MusicContractDocuSignService {
  private envelopesApi: EnvelopesApi;
  private accountId: string;

  constructor() {
    const apiClient = new ApiClient();
    apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH!);
    apiClient.addDefaultHeader('Authorization', `Bearer ${this.getAccessToken()}`);
    this.envelopesApi = new EnvelopesApi(apiClient);
    this.accountId = process.env.DOCUSIGN_ACCOUNT_ID!;
  }

  /**
   * Send split sheet for signatures
   */
  async sendSplitSheetForSignature(
    splitSheet: SplitSheet,
    participants: Participant[]
  ): Promise<string> {
    // Generate PDF from split sheet data
    const pdfContent = await this.generateSplitSheetPDF(splitSheet);

    // Create envelope with signers
    const envelope: EnvelopeDefinition = {
      emailSubject: `Split Sheet for "${splitSheet.songTitle}" - Signature Required`,
      documents: [{
        documentBase64: pdfContent,
        name: `Split Sheet - ${splitSheet.songTitle}.pdf`,
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: participants.map((p, index) => ({
          email: p.email,
          name: p.name,
          recipientId: String(index + 1),
          routingOrder: String(index + 1),
          tabs: {
            signHereTabs: [{
              documentId: '1',
              pageNumber: '1',
              recipientId: String(index + 1),
              xPosition: '100',
              yPosition: String(200 + (index * 50))
            }],
            dateSignedTabs: [{
              documentId: '1',
              pageNumber: '1',
              recipientId: String(index + 1),
              xPosition: '300',
              yPosition: String(200 + (index * 50))
            }]
          }
        }))
      },
      status: 'sent'
    };

    const result = await this.envelopesApi.createEnvelope(this.accountId, { envelopeDefinition: envelope });
    return result.envelopeId!;
  }

  /**
   * Check envelope status
   */
  async getEnvelopeStatus(envelopeId: string): Promise<EnvelopeStatus> {
    const envelope = await this.envelopesApi.getEnvelope(this.accountId, envelopeId);

    return {
      status: envelope.status as ContractStatus,
      sentDateTime: envelope.sentDateTime,
      completedDateTime: envelope.completedDateTime,
      recipients: await this.getRecipientStatus(envelopeId)
    };
  }

  /**
   * Handle DocuSign webhook for signature completion
   */
  async handleWebhook(payload: DocuSignWebhookPayload): Promise<void> {
    const { envelopeId, status } = payload;

    if (status === 'completed') {
      // Update split sheet status
      await this.splitSheetRepository.update(
        { docusignEnvelopeId: envelopeId },
        { status: 'executed', executedAt: new Date() }
      );

      // Notify all participants
      const splitSheet = await this.splitSheetRepository.findByEnvelopeId(envelopeId);
      await this.notificationService.notifyContractExecuted(splitSheet);
    }
  }
}
```

## Contract Templates

### Split Sheet PDF Template
```typescript
interface SplitSheetTemplate {
  header: {
    title: string;
    songTitle: string;
    date: string;
    sessionId: string;
  };
  sections: {
    writerInfo: {
      columns: ['Name', 'Role', 'Percentage', 'PRO', 'IPI Number'];
      rows: SplitRow[];
    };
    publisherInfo: {
      columns: ['Writer', 'Publisher', 'Publisher %', 'IPI Number'];
      rows: PublisherRow[];
    };
    signatures: {
      participants: SignatureBlock[];
    };
    terms: {
      text: string;  // Legal boilerplate
    };
  };
}
```

## Database Schema

```sql
-- Split Sheets
CREATE TABLE split_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  session_id UUID REFERENCES sessions(id),
  song_title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_percentage DECIMAL(5,2) DEFAULT 100.00,
  docusign_envelope_id VARCHAR(100),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- Split Sheet Participants
CREATE TABLE split_sheet_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  split_sheet_id UUID NOT NULL REFERENCES split_sheets(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES users(id),
  participant_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  pro_affiliation VARCHAR(50),
  ipi_number VARCHAR(20),
  publisher_name VARCHAR(255),
  publisher_percentage DECIMAL(5,2),
  publisher_ipi VARCHAR(20),
  signature_status VARCHAR(50) DEFAULT 'pending',
  signed_at TIMESTAMPTZ
);

-- Recording Agreements
CREATE TABLE recording_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  session_id UUID REFERENCES sessions(id),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  terms JSONB NOT NULL,
  docusign_envelope_id VARCHAR(100),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contract Audit Log
CREATE TABLE contract_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type VARCHAR(50) NOT NULL,
  contract_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id UUID NOT NULL REFERENCES users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

```typescript
// Split Sheet Routes
router.post('/sessions/:sessionId/split-sheets', createSplitSheet);
router.get('/sessions/:sessionId/split-sheets', getSplitSheets);
router.get('/split-sheets/:id', getSplitSheet);
router.put('/split-sheets/:id', updateSplitSheet);
router.post('/split-sheets/:id/send-for-signature', sendForSignature);
router.get('/split-sheets/:id/status', getSignatureStatus);

// Contract Templates
router.get('/contract-templates', getContractTemplates);
router.post('/contract-templates', createContractTemplate);
```

## Testing Requirements

- Unit tests for split calculation
- Integration tests for DocuSign workflow
- E2E tests for complete contract lifecycle
- Validation tests for percentage totals

## Related Skills
- `music-session-collaboration-standard` - Session management
- `music-royalty-standard` - Royalty tracking
