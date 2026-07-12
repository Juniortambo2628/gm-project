import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { SiteSettingsProvider, useSiteSettings } from '@/context/SiteSettingsContext';

vi.mock('@/context/SiteDataContext', () => ({
  useSiteData: () => ({
    data: {
      settings: {
        site_name: 'GM Coaching',
        logo_path: '/storage/logo.png',
        hero_bg: '/storage/hero.mp4',
        hero_bg_mobile: '/storage/hero-mobile.mp4',
        hero_bg_position: '{"x":50,"y":60,"mobile_x":30,"mobile_y":70}',
        about_bio_narrative: '{"blocks":[{"text":"Hello"}]}',
      },
    },
    isLoading: false,
    error: null,
    retryCount: 0,
    refresh: vi.fn(),
  }),
}));

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <SiteSettingsProvider>{children}</SiteSettingsProvider>;
  };
}

describe('SiteSettingsContext', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api');
  });

  it('provides settings data', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    expect(result.current.settings).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('getSetting returns a specific value', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    expect(result.current.getSetting('site_name')).toBe('GM Coaching');
  });

  it('getSetting returns default value for missing key', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    expect(result.current.getSetting('nonexistent', 'fallback')).toBe('fallback');
  });

  it('normalizes /storage/ URLs to backend base URL', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    const logo = result.current.getSetting<string>('logo_path');
    expect(logo).toBe('http://localhost:8000/storage/logo.png');
  });

  it('parses about_bio_narrative from JSON string', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    const bio = result.current.getSetting('about_bio_narrative');
    expect(typeof bio).toBe('object');
  });

  it('getHeroProps returns correct structure', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    const heroProps = result.current.getHeroProps('hero_bg');
    expect(heroProps).toHaveProperty('videoSrc');
    expect(heroProps).toHaveProperty('mobileVideoSrc');
    expect(heroProps).toHaveProperty('position');
  });

  it('getHeroProps parses position JSON', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    const heroProps = result.current.getHeroProps('hero_bg');
    expect(heroProps.position).toEqual({ x: 50, y: 60, mobile_x: 30, mobile_y: 70 });
  });

  it('getHeroProps uses default video when setting is missing', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    const heroProps = result.current.getHeroProps('nonexistent_bg', '/default.mp4');
    expect(heroProps.videoSrc).toBe('/default.mp4');
  });

  it('getHeroProps returns undefined position when no position setting', () => {
    const { result } = renderHook(() => useSiteSettings(), { wrapper: createWrapper() });
    const heroProps = result.current.getHeroProps('nonexistent_bg');
    expect(heroProps.position).toBeUndefined();
  });

  it('throws when useSiteSettings is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useSiteSettings());
    }).toThrow('useSiteSettings must be used within a SiteSettingsProvider');
    consoleSpy.mockRestore();
  });
});
