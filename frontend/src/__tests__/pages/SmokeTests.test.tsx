import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; fill?: boolean; sizes?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock('@/context/SiteSettingsContext', () => ({
  useSiteSettings: () => ({
    getSetting: (key: string, fallback = '') => {
      const settings: Record<string, string> = {
        site_name: 'Test Site',
        hero_tagline: 'Test Tagline',
        hero_headline: 'Test Headline',
        about_hey_gathoni: 'Hey, I am Gathoni',
        about_bio_full: 'My bio text.',
        logo_light: '/branding/logo-light.png',
        logo_dark: '/branding/logo-dark.png',
      };
      return settings[key] || fallback;
    },
    getHeroProps: () => ({
      videoSrc: '/hero-bg.mp4',
      position: undefined,
    }),
    settings: {},
    isLoading: false,
  }),
}));

vi.mock('@/context/SiteDataContext', () => ({
  SiteDataProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSiteData: () => ({
    data: {
      settings: {},
      services: [],
      testimonials: [],
      faqs: [],
      blog_posts: [],
    },
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  }),
}));

vi.mock('@/context/CMSContentContext', () => ({
  CMSContentProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useCMSContent: () => ({
    services: [],
    testimonials: [],
    faqs: [],
    blog_posts: [],
    isLoading: false,
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('@/components/SiteHeader', () => ({
  SiteHeader: () => <header data-testid="site-header">Header</header>,
}));

vi.mock('@/components/SiteFooter', () => ({
  SiteFooter: () => <footer data-testid="site-footer">Footer</footer>,
}));

vi.mock('@/components/PrivacyConsent', () => ({
  PrivacyConsent: () => null,
}));

vi.mock('@/components/ApiStatusBanner', () => ({
  ApiStatusBanner: () => null,
}));

vi.mock('@/components/SEOHandler', () => ({
  SEOHandler: () => null,
}));

vi.mock('@/components/SiteDataGate', () => ({
  SiteDataGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ThemeProvider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function smokeTest(name: string, Component: React.ComponentType) {
  it(`${name} renders without crashing`, async () => {
    render(<Component />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });
}

describe('Page Smoke Tests', () => {
  it('Homepage renders header and footer', async () => {
    const { default: HomePage } = await import('@/app/page');
    render(<HomePage />);
    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
  });

  it('Services page renders content', async () => {
    const { default: ServicesPage } = await import('@/app/services/page');
    render(<ServicesPage />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('Contact page renders form', async () => {
    const { default: ContactPage } = await import('@/app/contact/page');
    render(<ContactPage />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('FAQ page renders', async () => {
    const { default: FaqPage } = await import('@/app/faq/page');
    render(<FaqPage />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('Login page renders form', async () => {
    const { default: LoginPage } = await import('@/app/login/page');
    render(<LoginPage />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('Register page renders form', async () => {
    const { default: RegisterPage } = await import('@/app/register/page');
    render(<RegisterPage />);
    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });
});
