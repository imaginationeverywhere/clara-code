# Profile Widget Standard Skill

> **Skill ID:** `profile-widget-standard`
> **Version:** 1.0.0
> **Category:** Frontend Components
> **Last Updated:** 2026-01-13

## Description

Implementation patterns for production-ready profile widget dropdowns and theme-matched loading indicators. Provides reusable code templates, styling patterns, and integration strategies for Next.js applications.

## When to Use This Skill

Use this skill when:
- User requests "profile dropdown", "user menu", or "avatar widget"
- User asks for "loading spinner", "page loader", or "loading indicator"
- User mentions "theme-matched" components
- Implementing user profile UI in navigation
- Adding global loading states to application

## Component Templates

### 1. UserAvatar Component

```typescript
// frontend/src/components/ProfileWidget/UserAvatar.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string;
  name: string;
  email?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserAvatar({
  src,
  name,
  email,
  size = 'md',
  className
}: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {src ? (
        <AvatarImage src={src} alt={name} />
      ) : (
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
```

### 2. ProfileMenu Dropdown

```typescript
// frontend/src/components/ProfileWidget/ProfileMenu.tsx
'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings, LogOut, CreditCard, HelpCircle } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export function ProfileMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open user menu"
        >
          <UserAvatar
            src={user.imageUrl}
            name={user.fullName || 'User'}
            email={user.primaryEmailAddress?.emailAddress}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.fullName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
            {user.publicMetadata?.role && (
              <Badge variant="secondary" className="w-fit mt-2">
                {user.publicMetadata.role as string}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/billing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/support')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 3. ProfileWidget Container

```typescript
// frontend/src/components/ProfileWidget/index.tsx
export { ProfileMenu as ProfileWidget } from './ProfileMenu';
export { UserAvatar } from './UserAvatar';
```

### 4. Loading Spinner

```typescript
// frontend/src/components/Loading/Spinner.tsx
'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <svg
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size],
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={label || 'Loading'}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
```

### 5. Page Loader

```typescript
// frontend/src/components/Loading/PageLoader.tsx
'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Spinner } from './Spinner';

export function PageLoader() {
  const { isPageLoading, loadingMessage } = useSelector(
    (state: RootState) => state.ui
  );

  if (!isPageLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity"
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" label={loadingMessage || 'Loading'} />
        {loadingMessage && (
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {loadingMessage}
          </p>
        )}
      </div>
    </div>
  );
}
```

### 6. Loading Bar (Navigation)

```typescript
// frontend/src/components/Loading/LoadingBar.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  speed: 200,
  minimum: 0.08,
});

export function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();

    // Complete progress after navigation
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
```

### 7. Redux UI Slice

```typescript
// frontend/src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isPageLoading: boolean;
  loadingMessage?: string;
  isSidebarOpen: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const initialState: UIState = {
  isPageLoading: false,
  loadingMessage: undefined,
  isSidebarOpen: true,
  notifications: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPageLoading: (state, action: PayloadAction<string | undefined>) => {
      state.isPageLoading = true;
      state.loadingMessage = action.payload;
    },
    clearPageLoading: (state) => {
      state.isPageLoading = false;
      state.loadingMessage = undefined;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },
  },
});

export const {
  setPageLoading,
  clearPageLoading,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
```

### 8. Layout Integration

```typescript
// frontend/src/app/layout.tsx
import { PageLoader } from '@/components/Loading/PageLoader';
import { LoadingBar } from '@/components/Loading/LoadingBar';
import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <LoadingBar />
          <PageLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### 9. Header Integration

```typescript
// frontend/src/components/Navigation/Header.tsx
import { ProfileWidget } from '@/components/ProfileWidget';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <MainNav />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Notifications />
          <ProfileWidget />
        </div>
      </div>
    </header>
  );
}
```

## Usage Patterns

### Pattern 1: Show Page Loader During Data Fetch

```typescript
'use client';

import { useDispatch } from 'react-redux';
import { setPageLoading, clearPageLoading } from '@/store/slices/uiSlice';

export function Dashboard() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setPageLoading('Loading dashboard data...'));
      try {
        const data = await fetch('/api/dashboard').then(r => r.json());
        setDashboardData(data);
      } finally {
        dispatch(clearPageLoading());
      }
    };

    fetchData();
  }, [dispatch]);

  return <div>{/* Dashboard content */}</div>;
}
```

### Pattern 2: Button with Inline Spinner

```typescript
import { Spinner } from '@/components/Loading/Spinner';
import { Button } from '@/components/ui/button';

export function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await submitForm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
      {isLoading ? 'Submitting...' : 'Submit'}
    </Button>
  );
}
```

### Pattern 3: Skeleton Loader

```typescript
// frontend/src/components/Loading/SkeletonLoader.tsx
export function ProfileSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
```

## Styling Patterns

### CSS Animations

```css
/* frontend/src/app/globals.css */

/* Spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* NProgress customization */
#nprogress .bar {
  background: hsl(var(--primary)) !important;
  height: 3px;
}

#nprogress .peg {
  box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary));
}
```

## TypeScript Types

```typescript
// frontend/src/types/profile.ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  metadata?: Record<string, unknown>;
}

export interface ProfileMenuProps {
  user: UserProfile;
  onSignOut: () => void;
}

// frontend/src/types/loading.ts
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}
```

## Testing Patterns

```typescript
// __tests__/components/ProfileWidget.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileMenu } from '@/components/ProfileWidget/ProfileMenu';

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      fullName: 'John Doe',
      primaryEmailAddress: { emailAddress: 'john@example.com' },
      imageUrl: 'https://example.com/avatar.jpg',
    },
    isLoaded: true,
  }),
  useClerk: () => ({
    signOut: jest.fn(),
  }),
}));

describe('ProfileMenu', () => {
  it('renders user avatar', () => {
    render(<ProfileMenu />);
    expect(screen.getByRole('button', { name: /open user menu/i })).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    render(<ProfileMenu />);
    await userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeVisible();
    });
  });

  it('displays user information', async () => {
    render(<ProfileMenu />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

## Accessibility Checklist

✅ **Keyboard Navigation**
- Tab to profile button
- Enter/Space to open menu
- Arrow keys to navigate items
- Escape to close menu

✅ **ARIA Attributes**
- `role="button"` on trigger
- `role="menu"` on dropdown
- `role="menuitem"` on items
- `aria-label` on interactive elements

✅ **Screen Reader Support**
- Descriptive labels
- Loading announcements
- State changes communicated

✅ **Focus Management**
- Visible focus indicators
- Focus trap in dropdown
- Focus return on close

## Performance Tips

1. **Lazy Load Dropdown**
   ```typescript
   const ProfileMenu = dynamic(() => import('./ProfileMenu'), {
     loading: () => <ProfileSkeleton />,
   });
   ```

2. **Memoize User Data**
   ```typescript
   const userInfo = useMemo(() => ({
     name: user?.fullName,
     email: user?.primaryEmailAddress?.emailAddress,
   }), [user]);
   ```

3. **Debounce Loading States**
   ```typescript
   const debouncedLoading = useDebounce(isLoading, 300);
   ```

## Related Commands

- `profile-widget-setup` - Main setup command
- `frontend-dev` - Frontend development workflow
- `design-to-nextjs` - Convert designs to components

## Related Agents

- **profile-widget-manager** - Component generation
- **shadcn-ui-specialist** - UI component patterns
- **nextjs-architecture-guide** - Next.js best practices

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial release |
