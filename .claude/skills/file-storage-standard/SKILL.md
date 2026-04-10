---
name: file-storage-standard
description: Implement AWS S3 file storage with pre-signed URLs, CloudFront CDN, and multipart uploads. Use when handling file uploads, configuring S3, or setting up CDN. Triggers on requests for file upload, S3 storage, CloudFront setup, or file management.
---

# File Storage Standard

Production-grade AWS S3 file storage patterns from DreamiHairCare and Pink Collar Contractors implementations with direct browser uploads, pre-signed URLs, CloudFront CDN, multipart uploads, and comprehensive security controls.

## Skill Metadata

- **Name:** file-storage-standard
- **Version:** 1.0.0
- **Category:** Data Architecture
- **Source:** DreamiHairCare & Pink Collar Contractors Production Implementation
- **Related Skills:** aws-deployment-standard, multi-tenancy-standard

## When to Use This Skill

Use this skill when:
- Implementing file upload functionality
- Setting up AWS S3 buckets
- Configuring CloudFront CDN for file delivery
- Generating pre-signed URLs
- Implementing multipart uploads for large files
- Managing file metadata in database
- Implementing access control for files

## Core Patterns

### 1. S3 Bucket Structure

```
[project-name]-files-[environment]/
├── projects/
│   ├── {project-id}/
│   │   ├── documents/          # General documents
│   │   ├── images/             # Product/profile images
│   │   │   ├── original/       # Full resolution
│   │   │   └── thumbnails/     # Generated thumbnails
│   │   └── uploads/            # User uploads
├── users/
│   ├── {user-id}/
│   │   ├── avatar/             # Profile pictures
│   │   └── documents/          # User documents
├── temp-uploads/               # 24hr lifecycle - pending processing
├── company-assets/             # Logos, templates (long cache)
└── system/
    ├── thumbnails/             # Generated previews
    └── processed/              # Converted files
```

### 2. Backend File Service

```typescript
// backend/src/services/FileStorageService.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

interface UploadConfig {
  maxFileSize: number;      // bytes
  allowedMimeTypes: string[];
  urlExpirationSeconds: number;
}

interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  tenantId: string;
  category: 'document' | 'image' | 'video' | 'other';
}

interface PresignedUploadResponse {
  uploadUrl: string;
  fileKey: string;
  expiresAt: Date;
}

const DEFAULT_CONFIG: UploadConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/quicktime',
  ],
  urlExpirationSeconds: 900, // 15 minutes for uploads
};

export class FileStorageService {
  private s3Client: S3Client;
  private bucketName: string;
  private cdnDomain: string;
  private config: UploadConfig;

  constructor(config: Partial<UploadConfig> = {}) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bucketName = process.env.S3_BUCKET_NAME!;
    this.cdnDomain = process.env.CLOUDFRONT_DOMAIN!;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Generate pre-signed URL for direct browser upload
  async generateUploadUrl(
    metadata: FileMetadata
  ): Promise<PresignedUploadResponse> {
    // Validate file type
    if (!this.config.allowedMimeTypes.includes(metadata.mimeType)) {
      throw new Error(`File type not allowed: ${metadata.mimeType}`);
    }

    // Validate file size
    if (metadata.size > this.config.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.config.maxFileSize / 1024 / 1024}MB`);
    }

    // Generate unique file key
    const fileExtension = this.getExtension(metadata.originalName);
    const fileKey = this.generateFileKey(metadata, fileExtension);

    // Create pre-signed URL
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: metadata.mimeType,
      ContentLength: metadata.size,
      Metadata: {
        'original-name': encodeURIComponent(metadata.originalName),
        'uploaded-by': metadata.uploadedBy,
        'tenant-id': metadata.tenantId,
        'category': metadata.category,
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.config.urlExpirationSeconds,
    });

    const expiresAt = new Date(
      Date.now() + this.config.urlExpirationSeconds * 1000
    );

    return {
      uploadUrl,
      fileKey,
      expiresAt,
    };
  }

  // Generate pre-signed URL for download
  async generateDownloadUrl(
    fileKey: string,
    expirationSeconds: number = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expirationSeconds,
    });
  }

  // Get CDN URL for public/cached files
  getCdnUrl(fileKey: string): string {
    return `https://${this.cdnDomain}/${fileKey}`;
  }

  // Multipart upload initialization for large files
  async initiateMultipartUpload(
    metadata: FileMetadata
  ): Promise<{
    uploadId: string;
    fileKey: string;
    partSize: number;
  }> {
    const fileExtension = this.getExtension(metadata.originalName);
    const fileKey = this.generateFileKey(metadata, fileExtension);

    const command = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: metadata.mimeType,
      Metadata: {
        'original-name': encodeURIComponent(metadata.originalName),
        'uploaded-by': metadata.uploadedBy,
        'tenant-id': metadata.tenantId,
      },
    });

    const response = await this.s3Client.send(command);

    return {
      uploadId: response.UploadId!,
      fileKey,
      partSize: 5 * 1024 * 1024, // 5MB per part (S3 minimum)
    };
  }

  // Generate pre-signed URL for multipart upload part
  async generatePartUploadUrl(
    fileKey: string,
    uploadId: string,
    partNumber: number
  ): Promise<string> {
    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour for part uploads
    });
  }

  // Complete multipart upload
  async completeMultipartUpload(
    fileKey: string,
    uploadId: string,
    parts: { partNumber: number; etag: string }[]
  ): Promise<void> {
    const command = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(p => ({
          PartNumber: p.partNumber,
          ETag: p.etag,
        })),
      },
    });

    await this.s3Client.send(command);
  }

  // Abort multipart upload
  async abortMultipartUpload(fileKey: string, uploadId: string): Promise<void> {
    const command = new AbortMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      UploadId: uploadId,
    });

    await this.s3Client.send(command);
  }

  // Delete file
  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }

  // Helper: Generate file key with tenant isolation
  private generateFileKey(metadata: FileMetadata, extension: string): string {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);

    // Include tenant_id in path for isolation
    return `projects/${metadata.tenantId}/${metadata.category}/${timestamp}-${uniqueId}${extension}`;
  }

  // Helper: Get file extension
  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
  }
}

export default new FileStorageService();
```

### 3. GraphQL Schema and Resolvers

```graphql
# backend/src/graphql/schema/file.graphql
type File {
  id: ID!
  tenantId: ID!
  key: String!
  originalName: String!
  mimeType: String!
  size: Int!
  category: FileCategory!
  uploadedBy: ID!
  downloadUrl: String
  cdnUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum FileCategory {
  DOCUMENT
  IMAGE
  VIDEO
  OTHER
}

type PresignedUploadResponse {
  uploadUrl: String!
  fileKey: String!
  expiresAt: DateTime!
}

type MultipartUploadResponse {
  uploadId: String!
  fileKey: String!
  partSize: Int!
}

type PartUploadUrl {
  partNumber: Int!
  uploadUrl: String!
}

input FileMetadataInput {
  originalName: String!
  mimeType: String!
  size: Int!
  category: FileCategory!
}

input UploadPartInput {
  partNumber: Int!
  etag: String!
}

type Query {
  file(id: ID!): File
  files(category: FileCategory, limit: Int, offset: Int): [File!]!
}

type Mutation {
  # Simple upload (< 100MB)
  generateUploadUrl(input: FileMetadataInput!): PresignedUploadResponse!

  # Multipart upload (> 100MB)
  initiateMultipartUpload(input: FileMetadataInput!): MultipartUploadResponse!
  generatePartUploadUrls(
    fileKey: String!
    uploadId: String!
    partCount: Int!
  ): [PartUploadUrl!]!
  completeMultipartUpload(
    fileKey: String!
    uploadId: String!
    parts: [UploadPartInput!]!
  ): File!
  abortMultipartUpload(fileKey: String!, uploadId: String!): Boolean!

  # File operations
  confirmUpload(fileKey: String!): File!
  deleteFile(id: ID!): Boolean!
}
```

```typescript
// backend/src/graphql/resolvers/file.ts
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';
import FileStorageService from '../../services/FileStorageService';
import FileMetadata from '../../models/FileMetadata';

export const fileResolvers = {
  Query: {
    file: async (_, { id }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const file = await FileMetadata.findByPk(id);

      // CRITICAL: Validate tenant ownership
      if (file && file.tenant_id !== context.auth.tenantId) {
        throw new ForbiddenError('Access denied');
      }

      return file;
    },

    files: async (_, { category, limit = 50, offset = 0 }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const where: any = {
        tenant_id: context.auth.tenantId, // CRITICAL: Always filter by tenant
      };

      if (category) {
        where.category = category;
      }

      return FileMetadata.findAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']],
      });
    },
  },

  Mutation: {
    generateUploadUrl: async (_, { input }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      return FileStorageService.generateUploadUrl({
        ...input,
        uploadedBy: context.auth.userId,
        tenantId: context.auth.tenantId,
      });
    },

    initiateMultipartUpload: async (_, { input }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      return FileStorageService.initiateMultipartUpload({
        ...input,
        uploadedBy: context.auth.userId,
        tenantId: context.auth.tenantId,
      });
    },

    generatePartUploadUrls: async (_, { fileKey, uploadId, partCount }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const urls = await Promise.all(
        Array.from({ length: partCount }, (_, i) =>
          FileStorageService.generatePartUploadUrl(fileKey, uploadId, i + 1)
            .then(uploadUrl => ({
              partNumber: i + 1,
              uploadUrl,
            }))
        )
      );

      return urls;
    },

    completeMultipartUpload: async (_, { fileKey, uploadId, parts }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      await FileStorageService.completeMultipartUpload(fileKey, uploadId, parts);

      // Create metadata record
      return FileMetadata.create({
        tenant_id: context.auth.tenantId,
        key: fileKey,
        uploaded_by: context.auth.userId,
        status: 'completed',
      });
    },

    confirmUpload: async (_, { fileKey }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      // Verify file exists and create/update metadata
      return FileMetadata.create({
        tenant_id: context.auth.tenantId,
        key: fileKey,
        uploaded_by: context.auth.userId,
        status: 'completed',
      });
    },

    deleteFile: async (_, { id }, context) => {
      if (!context.auth?.userId) {
        throw new AuthenticationError('Authentication required');
      }

      const file = await FileMetadata.findByPk(id);

      if (!file || file.tenant_id !== context.auth.tenantId) {
        throw new ForbiddenError('Access denied');
      }

      // Delete from S3
      await FileStorageService.deleteFile(file.key);

      // Delete metadata
      await file.destroy();

      return true;
    },
  },

  File: {
    downloadUrl: async (file) => {
      return FileStorageService.generateDownloadUrl(file.key);
    },

    cdnUrl: (file) => {
      return FileStorageService.getCdnUrl(file.key);
    },
  },
};
```

### 4. Frontend Upload Component

```tsx
// frontend/src/components/FileUpload/FileUpload.tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, gql } from '@apollo/client';

const GENERATE_UPLOAD_URL = gql`
  mutation GenerateUploadUrl($input: FileMetadataInput!) {
    generateUploadUrl(input: $input) {
      uploadUrl
      fileKey
      expiresAt
    }
  }
`;

const CONFIRM_UPLOAD = gql`
  mutation ConfirmUpload($fileKey: String!) {
    confirmUpload(fileKey: $fileKey) {
      id
      key
      cdnUrl
    }
  }
`;

interface FileUploadProps {
  onUploadComplete?: (file: { id: string; key: string; cdnUrl: string }) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  category?: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'OTHER';
}

export function FileUpload({
  onUploadComplete,
  maxSize = 100 * 1024 * 1024, // 100MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
  },
  category = 'DOCUMENT',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [generateUploadUrl] = useMutation(GENERATE_UPLOAD_URL);
  const [confirmUpload] = useMutation(CONFIRM_UPLOAD);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get pre-signed URL
      const { data } = await generateUploadUrl({
        variables: {
          input: {
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            category,
          },
        },
      });

      const { uploadUrl, fileKey } = data.generateUploadUrl;

      // 2. Upload directly to S3
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // 3. Confirm upload and get file record
      const confirmResult = await confirmUpload({
        variables: { fileKey },
      });

      onUploadComplete?.(confirmResult.data.confirmUpload);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [generateUploadUrl, confirmUpload, category, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && uploadFile(files[0]),
    maxSize,
    accept,
    multiple: false,
    disabled: uploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div>
            <div className="mb-2">Uploading... {progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop a file here, or click to select
            </p>
            <p className="text-sm text-gray-400">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}
```

### 5. AWS CDK Infrastructure

```typescript
// infrastructure/cdk/s3-file-storage/s3-file-storage-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface S3FileStorageStackProps extends cdk.StackProps {
  environment: 'development' | 'staging' | 'production';
  projectName: string;
}

export class S3FileStorageStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: S3FileStorageStackProps) {
    super(scope, id, props);

    // Create S3 bucket with security best practices
    this.bucket = new s3.Bucket(this, 'FileStorageBucket', {
      bucketName: `${props.projectName}-files-${props.environment}`,

      // Security
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,

      // Versioning for document tracking
      versioned: true,

      // Transfer Acceleration for faster uploads
      transferAcceleration: true,

      // Lifecycle policies
      lifecycleRules: [
        {
          id: 'TempUploadsCleanup',
          prefix: 'temp-uploads/',
          expiration: cdk.Duration.days(1),
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
        {
          id: 'IntelligentTiering',
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(1),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],

      // CORS for direct browser uploads
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'], // Restrict in production
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
    });

    // Create CloudFront distribution
    const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'S3OAC', {
      description: `OAC for ${props.projectName} file storage`,
    });

    this.distribution = new cloudfront.Distribution(this, 'FileStorageCDN', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
          originAccessControl,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },

      // Security headers
      responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
          frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.seconds(31536000),
            includeSubdomains: true,
            override: true,
          },
        },
      }),

      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      exportName: `${props.projectName}-S3BucketName`,
    });

    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: this.distribution.distributionDomainName,
      exportName: `${props.projectName}-CloudFrontDomain`,
    });
  }
}
```

### 6. Database Schema for File Metadata

```javascript
// backend/migrations/20250101-create-file-metadata-table.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.createTable('file_metadata', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        key: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        original_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        mime_type: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        size_bytes: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        category: {
          type: Sequelize.ENUM('document', 'image', 'video', 'other'),
          allowNull: false,
          defaultValue: 'other',
        },
        status: {
          type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'pending',
        },
        uploaded_by: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
      }, { transaction });

      // Indexes
      await queryInterface.addIndex('file_metadata', ['tenant_id'], { transaction });
      await queryInterface.addIndex('file_metadata', ['key'], { unique: true, transaction });
      await queryInterface.addIndex('file_metadata', ['uploaded_by'], { transaction });
      await queryInterface.addIndex('file_metadata', ['category'], { transaction });
      await queryInterface.addIndex('file_metadata', ['status'], { transaction });
      await queryInterface.addIndex('file_metadata', ['tenant_id', 'category'], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('file_metadata');
  },
};
```

## Environment Variables

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=project-files-production
CLOUDFRONT_DOMAIN=d123456789.cloudfront.net

# File Upload Limits
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,gif,webp,mp4,mov
```

## Security Best Practices

### Pre-signed URL Security
- Expiration: 15 minutes for uploads, 1 hour for downloads
- Content-Type enforcement
- Size limit validation
- Server-side metadata validation

### Access Control
- All queries filtered by tenant_id
- Validate ownership before delete operations
- Use IAM roles with least privilege
- Enable bucket versioning for audit trail

### Encryption
- At rest: S3 managed encryption (SSE-S3)
- In transit: TLS 1.2+ required
- Optional: KMS for sensitive documents

## Implementation Checklist

- [ ] Create S3 bucket with security settings
- [ ] Configure CloudFront distribution
- [ ] Set up CORS for direct uploads
- [ ] Implement FileStorageService
- [ ] Create GraphQL schema and resolvers
- [ ] Build frontend upload components
- [ ] Add file metadata database table
- [ ] Configure lifecycle policies
- [ ] Set up monitoring and alerts
- [ ] Test multipart uploads for large files

## Related Commands

- `/implement-file-storage` - Set up S3 file storage
- `/implement-aws-deployment` - AWS infrastructure

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-15 | Initial release from DreamiHairCare patterns |
