# Profile Widget Setup Command

> **Command:** `profile-widget-setup`
> **Version:** 1.0.0
> **Category:** Frontend Components
> **Last Updated:** 2026-01-13

## Purpose

Automatically implements production-ready profile widget dropdown and full-page loading indicators that match your project's theme and design system. Includes user avatar, dropdown menu, settings, logout functionality, and themed loading spinners.

## Usage

```bash
# Full setup with all components
profile-widget-setup

# Only profile dropdown
profile-widget-setup --profile-only

# Only loading indicators
profile-widget-setup --loading-only

# Custom theme colors
profile-widget-setup --primary="#3B82F6" --secondary="#10B981"

# Skip Clerk integration (use custom auth)
profile-widget-setup --no-clerk

# Dry run (preview changes)
profile-widget-setup --dry-run
```

## Agent Orchestration

This command uses the `profile-widget-manager` agent to:
1. **Analyze** existing project structure and theme
2. **Generate** theme-aware profile widget components
3. **Create** loading spinner and page loader components
4. **Integrate** with Clerk auth and Redux state
5. **Update** layout and navigation files
6. **Validate** component functionality

## What Gets Created

### 1. Profile Widget Components

**`frontend/src/components/ProfileWidget/index.tsx`**
```typescript
// Main profile dropdown component
- User avatar with fallback initials
- Dropdown menu with user info
- Navigation links (Profile, Settings, etc.)
- Logout functionality
- Theme-aware styling
```

**`frontend/src/components/ProfileWidget/UserAvatar.tsx`**
```typescript
// User avatar component
- Clerk user image integration
- Fallback to initials
- Custom size props
- Loading states
```

**`frontend/src/components/ProfileWidget/ProfileMenu.tsx`**
```typescript
// Dropdown menu component
- User information display
- Navigation menu items
- Role-based conditional rendering
- Sign out handler
```

### 2. Loading Components

**`frontend/src/components/Loading/PageLoader.tsx`**
```typescript
// Full page loading overlay
- Theme-matched spinner
- Loading text (customizable)
- Backdrop with blur
- Smooth transitions
```

**`frontend/src/components/Loading/Spinner.tsx`**
```typescript
// Reusable spinner component
- Multiple size variants (sm, md, lg)
- Theme color matching
- Accessible with aria-labels
- CSS animation optimized
```

**`frontend/src/components/Loading/LoadingBar.tsx`**
```typescript
// Top progress bar (Next.js navigation)
- NProgress integration
- Theme color matching
- Smooth progress animation
```

### 3. Integration Files

**Updated Files:**
- `frontend/src/app/layout.tsx` - Add PageLoader and ProfileWidget
- `frontend/src/components/Navigation/Header.tsx` - Integrate ProfileWidget
- `frontend/src/styles/globals.css` - Add loading animations
- `frontend/src/lib/theme.ts` - Export theme colors for components

### 4. TypeScript Types

**`frontend/src/types/profile.ts`**
```typescript
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface ProfileMenuProps {
  user: UserProfile;
  onSignOut: () => void;
}
```

## Features

### Profile Widget Features

✅ **Clerk Integration**
- Automatic user data loading
- Session management
- Sign out handling
- Avatar sync

✅ **Theme Matching**
- Extracts colors from Tailwind config
- Matches button styles
- Consistent with design system
- Dark mode support

✅ **Accessibility**
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels

✅ **Responsive Design**
- Mobile dropdown behavior
- Desktop hover states
- Touch-friendly targets
- Adaptive layouts

### Loading Indicator Features

✅ **Full Page Loader**
- Shown during auth check
- Route transitions
- Data loading states
- Global Redux state

✅ **Inline Spinners**
- Button loading states
- Component loading
- Form submissions
- Data fetching

✅ **Progress Bars**
- Next.js page transitions
- Upload progress
- Multi-step forms
- Background processes

## Theme Configuration

### Automatic Theme Detection

The system automatically detects your theme from:
1. `tailwind.config.ts` - Primary/secondary colors
2. `globals.css` - CSS variables
3. ShadcN UI theme - Button variants
4. Existing component patterns

### Manual Theme Override

```typescript
// frontend/src/lib/theme.ts
export const themeConfig = {
  primary: '#3B82F6',      // Blue-500
  secondary: '#10B981',    // Green-500
  accent: '#F59E0B',       // Amber-500
  text: '#1F2937',         // Gray-800
  background: '#FFFFFF',   // White
};
```

## Component Examples

### Profile Widget in Header

```typescript
// frontend/src/components/Navigation/Header.tsx
import { ProfileWidget } from '@/components/ProfileWidget';

export function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <Logo />
      <nav>{/* Navigation links */}</nav>
      <ProfileWidget /> {/* Added automatically */}
    </header>
  );
}
```

### Page Loader in Layout

```typescript
// frontend/src/app/layout.tsx
import { PageLoader } from '@/components/Loading/PageLoader';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PageLoader /> {/* Global loading indicator */}
        {children}
      </body>
    </html>
  );
}
```

### Button with Loading State

```typescript
import { Spinner } from '@/components/Loading/Spinner';

<Button disabled={isLoading}>
  {isLoading ? <Spinner size="sm" /> : 'Submit'}
</Button>
```

## Redux Integration

### Loading State Management

```typescript
// frontend/src/store/slices/uiSlice.ts
interface UIState {
  isPageLoading: boolean;
  loadingMessage?: string;
}

// Actions
export const { setPageLoading, clearPageLoading } = uiSlice.actions;

// Usage in components
const dispatch = useDispatch();
dispatch(setPageLoading('Loading your dashboard...'));
```

### Usage Example

```typescript
// Show loader during data fetch
dispatch(setPageLoading('Fetching user data...'));
try {
  const data = await fetchUserData();
  // Process data
} finally {
  dispatch(clearPageLoading());
}
```

## Clerk Integration

### Profile Data

```typescript
// Automatic Clerk integration
import { useUser } from '@clerk/nextjs';

export function ProfileWidget() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <Spinner size="sm" />;

  return (
    <DropdownMenu>
      <UserAvatar
        src={user.imageUrl}
        name={user.fullName}
        email={user.primaryEmailAddress?.emailAddress}
      />
      {/* Menu items */}
    </DropdownMenu>
  );
}
```

### Sign Out Handler

```typescript
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const { signOut } = useClerk();
const router = useRouter();

const handleSignOut = async () => {
  await signOut();
  router.push('/');
};
```

## Styling Patterns

### Tailwind Classes (Auto-generated)

```typescript
// Primary button style matching
className="bg-primary text-primary-foreground hover:bg-primary/90"

// Secondary style matching
className="bg-secondary text-secondary-foreground hover:bg-secondary/90"

// Spinner color matching
className="text-primary animate-spin"

// Loading backdrop
className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
```

### CSS Animations

```css
/* Auto-added to globals.css */
@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

## Workflow

### Installation Workflow

```
1. Analyze Project Structure
   - Detect Next.js version (15/16)
   - Find existing components
   - Read Tailwind config
   - Check for Clerk setup

2. Generate Theme Configuration
   - Extract primary/secondary colors
   - Read CSS variables
   - Match existing button styles
   - Create theme.ts file

3. Create Profile Widget
   - Generate UserAvatar component
   - Create ProfileMenu dropdown
   - Build ProfileWidget container
   - Add TypeScript types

4. Create Loading Components
   - Generate Spinner component
   - Create PageLoader overlay
   - Add LoadingBar for navigation
   - Create loading states

5. Integrate with Existing Code
   - Update layout.tsx
   - Modify Header component
   - Add Redux slice for UI state
   - Update navigation structure

6. Validate & Test
   - Check TypeScript compilation
   - Verify imports
   - Test Clerk integration
   - Validate theme matching

7. Generate Documentation
   - Component usage guide
   - Integration examples
   - Customization options
```

## Project-Specific Customization

### For E-commerce Projects
```typescript
// Additional menu items
- Orders
- Wishlist
- Cart
- Addresses
```

### For SaaS Projects
```typescript
// Additional menu items
- Workspace Settings
- Billing
- Team Members
- API Keys
```

### For Booking Projects
```typescript
// Additional menu items
- My Bookings
- Calendar
- Favorites
- Reviews
```

## Error Handling

```typescript
// Graceful fallbacks
const ProfileWidget = () => {
  const { user, isLoaded } = useUser();

  // Loading state
  if (!isLoaded) return <ProfileWidgetSkeleton />;

  // No user (shouldn't happen with middleware)
  if (!user) return null;

  // Error state
  if (error) return <ProfileWidgetError />;

  // Success state
  return <ProfileDropdown user={user} />;
};
```

## Testing

### Component Tests

```typescript
// Auto-generated test file
describe('ProfileWidget', () => {
  it('renders user avatar', () => {
    render(<ProfileWidget />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<ProfileWidget />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Sign Out')).toBeVisible();
  });

  it('handles sign out', async () => {
    const { signOut } = useClerk();
    render(<ProfileWidget />);
    await userEvent.click(screen.getByText('Sign Out'));
    expect(signOut).toHaveBeenCalled();
  });
});
```

## Performance Optimization

✅ **Code Splitting**
- Profile widget lazy loaded
- Dropdown rendered on demand
- Icons imported individually

✅ **Memoization**
- User data memoized
- Menu items cached
- Event handlers stable

✅ **Bundle Size**
- Tree-shaking enabled
- Minimal dependencies
- Optimized images

## Related Commands

- `frontend-dev` - Frontend development workflow
- `design-to-nextjs` - Convert designs to components
- `integrations` - Add Clerk/Redux integration

## Related Agents

- **profile-widget-manager** - Component generation and integration
- **shadcn-ui-specialist** - ShadcN UI component patterns
- **nextjs-architecture-guide** - Next.js best practices
- **typescript-frontend-enforcer** - Type safety validation

## Related Skills

- **profile-widget-standard** - Implementation patterns
- **admin-panel-standard** - Dashboard integration
- **checkout-flow-standard** - Loading state patterns

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial release with profile widget and loading components |

## Future Enhancements

- **Notification badge** on profile widget
- **Quick actions menu** for common tasks
- **Theme switcher** in profile dropdown
- **Multi-account** support
- **Keyboard shortcuts** for profile actions
