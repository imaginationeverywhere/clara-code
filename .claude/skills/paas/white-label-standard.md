# White-Label Standard

## Overview
White-label customization system enabling SITE_OWNERs to brand and customize their tenant instances. Handles theme customization, branded domains, email templates, landing pages, and feature configuration while maintaining platform consistency.

## Domain Context
- **Primary Projects**: All Quik Nation platforms (as infrastructure)
- **Related Domains**: Tenant Management, Branding, Configuration
- **Key Integration**: CSS-in-JS, Email templates, DNS management, Asset CDN

## Core Interfaces

```typescript
interface WhiteLabelConfig {
  id: string;
  tenantId: string;
  status: 'draft' | 'published' | 'archived';
  theme: ThemeConfiguration;
  branding: BrandingConfiguration;
  content: ContentConfiguration;
  emails: EmailConfiguration;
  features: FeatureConfiguration;
  legal: LegalConfiguration;
  analytics: AnalyticsConfiguration;
  version: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ThemeConfiguration {
  colorScheme: ColorScheme;
  typography: Typography;
  spacing: SpacingScale;
  borders: BorderConfiguration;
  shadows: ShadowConfiguration;
  animations: AnimationConfiguration;
  darkMode: DarkModeConfiguration;
  customCss?: string;
}

interface ColorScheme {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: {
    default: string;
    paper: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
}

interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

interface Typography {
  fontFamily: {
    primary: string;
    secondary?: string;
    mono?: string;
  };
  fontSizes: FontSizeScale;
  fontWeights: FontWeightScale;
  lineHeights: LineHeightScale;
  letterSpacings: LetterSpacingScale;
  headings: HeadingStyles;
}

interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

interface HeadingStyles {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
}

interface TypographyStyle {
  fontSize: string;
  fontWeight: string | number;
  lineHeight: string;
  letterSpacing?: string;
}

interface DarkModeConfiguration {
  enabled: boolean;
  default: 'light' | 'dark' | 'system';
  colors: Partial<ColorScheme>;
}

interface BrandingConfiguration {
  companyName: string;
  tagline?: string;
  logos: LogoSet;
  favicons: FaviconSet;
  socialImages: SocialImageSet;
  appIcons?: AppIconSet;
}

interface LogoSet {
  primary: string;
  primaryDark?: string;
  icon: string;
  iconDark?: string;
  wordmark?: string;
  wordmarkDark?: string;
  horizontal?: string;
  vertical?: string;
}

interface FaviconSet {
  ico: string;
  svg?: string;
  png16: string;
  png32: string;
  png192: string;
  png512: string;
  appleTouchIcon: string;
}

interface SocialImageSet {
  og: string;
  twitter: string;
  linkedin?: string;
}

interface ContentConfiguration {
  homepage: HomepageContent;
  navigation: NavigationConfig;
  footer: FooterConfig;
  emptyStates: EmptyStateConfig[];
  errorPages: ErrorPageConfig[];
  helpCenter?: HelpCenterConfig;
  customPages: CustomPage[];
}

interface HomepageContent {
  hero: HeroSection;
  features?: FeatureSection[];
  testimonials?: TestimonialSection;
  cta?: CTASection;
  customSections: CustomSection[];
}

interface HeroSection {
  headline: string;
  subheadline?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

interface NavigationConfig {
  logo: string;
  items: NavItem[];
  ctaButton?: {
    text: string;
    link: string;
  };
  mobileBreakpoint: number;
  sticky: boolean;
}

interface NavItem {
  label: string;
  link?: string;
  children?: NavItem[];
  icon?: string;
  badge?: string;
  newTab?: boolean;
}

interface FooterConfig {
  columns: FooterColumn[];
  bottomBar: {
    copyright: string;
    links: FooterLink[];
  };
  socialLinks: SocialLink[];
  newsletter?: NewsletterConfig;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterLink {
  label: string;
  url: string;
  newTab?: boolean;
}

interface EmailConfiguration {
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  templates: EmailTemplate[];
  globalStyles: EmailStyles;
  footer: EmailFooter;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  body: string;
  variables: EmailVariable[];
  enabled: boolean;
}

interface EmailVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

interface EmailStyles {
  backgroundColor: string;
  contentBackgroundColor: string;
  primaryColor: string;
  textColor: string;
  linkColor: string;
  fontFamily: string;
  fontSize: string;
  logoUrl: string;
  headerBackground?: string;
}

interface EmailFooter {
  companyName: string;
  address?: string;
  unsubscribeText: string;
  socialLinks: SocialLink[];
  legalLinks: FooterLink[];
}

interface FeatureConfiguration {
  modules: ModuleConfig[];
  customizations: ModuleCustomization[];
  restrictions: FeatureRestriction[];
}

interface ModuleConfig {
  moduleId: string;
  enabled: boolean;
  displayName?: string;
  icon?: string;
  order?: number;
  settings?: Record<string, any>;
}

interface ModuleCustomization {
  moduleId: string;
  labelOverrides: Record<string, string>;
  fieldVisibility: Record<string, boolean>;
  defaultValues: Record<string, any>;
}

interface LegalConfiguration {
  companyLegalName: string;
  termsOfService: LegalDocument;
  privacyPolicy: LegalDocument;
  cookiePolicy?: LegalDocument;
  acceptableUse?: LegalDocument;
  sla?: LegalDocument;
  customDocuments: LegalDocument[];
}

interface LegalDocument {
  id: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: Date;
  url?: string;
}

interface AnalyticsConfiguration {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  facebookPixelId?: string;
  linkedInInsightTag?: string;
  customScripts: CustomScript[];
  consentRequired: boolean;
  cookieBanner: CookieBannerConfig;
}

interface CustomScript {
  id: string;
  name: string;
  location: 'head' | 'body_start' | 'body_end';
  script: string;
  enabled: boolean;
  requireConsent: boolean;
}

interface CookieBannerConfig {
  enabled: boolean;
  position: 'bottom' | 'top' | 'bottom_left' | 'bottom_right';
  message: string;
  acceptButtonText: string;
  declineButtonText?: string;
  settingsButtonText?: string;
  policyLink: string;
}

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  theme: Partial<ThemeConfiguration>;
  category: string;
  popularity: number;
}

interface BrandAsset {
  id: string;
  tenantId: string;
  type: 'image' | 'font' | 'video' | 'document';
  name: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
}
```

## Service Implementation

```typescript
class WhiteLabelService {
  // Configuration management
  async getConfig(tenantId: string): Promise<WhiteLabelConfig>;
  async updateConfig(tenantId: string, updates: Partial<WhiteLabelConfig>): Promise<WhiteLabelConfig>;
  async publishConfig(tenantId: string): Promise<WhiteLabelConfig>;
  async revertToVersion(tenantId: string, version: number): Promise<WhiteLabelConfig>;
  async getConfigHistory(tenantId: string): Promise<ConfigVersion[]>;

  // Theme
  async updateTheme(tenantId: string, theme: Partial<ThemeConfiguration>): Promise<WhiteLabelConfig>;
  async previewTheme(tenantId: string, theme: Partial<ThemeConfiguration>): Promise<ThemePreview>;
  async applyPreset(tenantId: string, presetId: string): Promise<WhiteLabelConfig>;
  async getPresets(category?: string): Promise<ThemePreset[]>;
  async generateColorScheme(baseColor: string): Promise<ColorScheme>;
  async exportTheme(tenantId: string): Promise<ThemeExport>;
  async importTheme(tenantId: string, themeData: ThemeExport): Promise<WhiteLabelConfig>;

  // Branding
  async updateBranding(tenantId: string, branding: Partial<BrandingConfiguration>): Promise<WhiteLabelConfig>;
  async uploadAsset(tenantId: string, file: File, type: string): Promise<BrandAsset>;
  async deleteAsset(tenantId: string, assetId: string): Promise<void>;
  async getAssets(tenantId: string, type?: string): Promise<BrandAsset[]>;
  async generateFavicons(tenantId: string, sourceImage: string): Promise<FaviconSet>;

  // Content
  async updateContent(tenantId: string, content: Partial<ContentConfiguration>): Promise<WhiteLabelConfig>;
  async createCustomPage(tenantId: string, page: CustomPage): Promise<CustomPage>;
  async updateCustomPage(tenantId: string, pageId: string, updates: Partial<CustomPage>): Promise<CustomPage>;
  async deleteCustomPage(tenantId: string, pageId: string): Promise<void>;
  async previewPage(tenantId: string, pageId: string): Promise<string>;

  // Email
  async updateEmailConfig(tenantId: string, config: Partial<EmailConfiguration>): Promise<WhiteLabelConfig>;
  async updateEmailTemplate(tenantId: string, templateId: string, template: Partial<EmailTemplate>): Promise<EmailTemplate>;
  async previewEmail(tenantId: string, templateId: string, variables?: Record<string, any>): Promise<EmailPreview>;
  async sendTestEmail(tenantId: string, templateId: string, recipient: string): Promise<void>;
  async resetEmailTemplate(tenantId: string, templateId: string): Promise<EmailTemplate>;

  // Features
  async updateFeatureConfig(tenantId: string, config: Partial<FeatureConfiguration>): Promise<WhiteLabelConfig>;
  async toggleModule(tenantId: string, moduleId: string, enabled: boolean): Promise<WhiteLabelConfig>;
  async customizeModule(tenantId: string, moduleId: string, customization: ModuleCustomization): Promise<WhiteLabelConfig>;

  // Legal
  async updateLegalConfig(tenantId: string, config: Partial<LegalConfiguration>): Promise<WhiteLabelConfig>;
  async updateLegalDocument(tenantId: string, documentId: string, document: Partial<LegalDocument>): Promise<LegalDocument>;

  // Analytics
  async updateAnalyticsConfig(tenantId: string, config: Partial<AnalyticsConfiguration>): Promise<WhiteLabelConfig>;
  async addCustomScript(tenantId: string, script: CustomScript): Promise<WhiteLabelConfig>;
  async removeCustomScript(tenantId: string, scriptId: string): Promise<WhiteLabelConfig>;

  // CSS Generation
  async generateCssVariables(tenantId: string): Promise<string>;
  async generateTailwindConfig(tenantId: string): Promise<string>;
  async getCachedStyles(tenantId: string): Promise<CachedStyles>;
  async invalidateStyleCache(tenantId: string): Promise<void>;

  // Validation
  async validateConfig(config: Partial<WhiteLabelConfig>): Promise<ValidationResult>;
  async validateColorContrast(colors: ColorScheme): Promise<ContrastReport>;
  async validateAssets(tenantId: string): Promise<AssetValidationReport>;
}
```

## Database Schema

```sql
CREATE TABLE white_label_configs (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  status VARCHAR(20) DEFAULT 'draft',
  theme JSONB NOT NULL DEFAULT '{}',
  branding JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  emails JSONB NOT NULL DEFAULT '{}',
  features JSONB NOT NULL DEFAULT '{}',
  legal JSONB NOT NULL DEFAULT '{}',
  analytics JSONB NOT NULL DEFAULT '{}',
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

CREATE TABLE white_label_versions (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  config_snapshot JSONB NOT NULL,
  version INTEGER NOT NULL,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

CREATE TABLE brand_assets (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  asset_type VARCHAR(30) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  mime_type VARCHAR(100),
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  tags TEXT[],
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_templates (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  template_key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preheader VARCHAR(255),
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, template_key)
);

CREATE TABLE custom_pages (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  meta JSONB DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

CREATE TABLE theme_presets (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  theme_config JSONB NOT NULL,
  category VARCHAR(50),
  popularity INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legal_documents (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  document_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(20) NOT NULL,
  effective_date DATE NOT NULL,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE custom_scripts (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(20) NOT NULL,
  script TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  require_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cached_styles (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  css_variables TEXT NOT NULL,
  tailwind_config TEXT,
  css_hash VARCHAR(64) NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(tenant_id)
);

CREATE INDEX idx_configs_tenant ON white_label_configs(tenant_id);
CREATE INDEX idx_versions_tenant ON white_label_versions(tenant_id, version);
CREATE INDEX idx_assets_tenant ON brand_assets(tenant_id);
CREATE INDEX idx_assets_type ON brand_assets(asset_type);
CREATE INDEX idx_templates_tenant ON email_templates(tenant_id);
CREATE INDEX idx_pages_tenant ON custom_pages(tenant_id);
CREATE INDEX idx_pages_slug ON custom_pages(slug);
CREATE INDEX idx_presets_category ON theme_presets(category);
CREATE INDEX idx_cached_tenant ON cached_styles(tenant_id);
```

## API Endpoints

```typescript
// GET /api/white-label - Get white-label config
// PUT /api/white-label - Update config
// POST /api/white-label/publish - Publish config
// POST /api/white-label/revert/:version - Revert to version
// GET /api/white-label/history - Get config history
// PUT /api/white-label/theme - Update theme
// POST /api/white-label/theme/preview - Preview theme
// POST /api/white-label/theme/preset/:id - Apply preset
// GET /api/white-label/presets - Get theme presets
// POST /api/white-label/theme/generate-colors - Generate color scheme
// PUT /api/white-label/branding - Update branding
// POST /api/white-label/assets - Upload asset
// GET /api/white-label/assets - List assets
// DELETE /api/white-label/assets/:id - Delete asset
// POST /api/white-label/favicons/generate - Generate favicons
// PUT /api/white-label/content - Update content
// POST /api/white-label/pages - Create custom page
// PUT /api/white-label/pages/:id - Update custom page
// DELETE /api/white-label/pages/:id - Delete custom page
// PUT /api/white-label/emails - Update email config
// PUT /api/white-label/emails/templates/:id - Update email template
// POST /api/white-label/emails/templates/:id/preview - Preview email
// POST /api/white-label/emails/templates/:id/test - Send test email
// PUT /api/white-label/features - Update feature config
// POST /api/white-label/features/modules/:id/toggle - Toggle module
// PUT /api/white-label/legal - Update legal config
// PUT /api/white-label/analytics - Update analytics config
// GET /api/white-label/styles.css - Get generated CSS
// POST /api/white-label/validate - Validate config
```

## Related Skills
- `tenant-management-standard.md` - Tenant configuration
- `tailwind-design-system-architect` - CSS generation
- `shadcn-ui-specialist` - Component theming

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-15
- **Domain**: PaaS
