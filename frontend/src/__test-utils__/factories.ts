import type { SiteContentResponse, Service, FAQ, Testimonial, BlogPost, Booking, Message, MailTemplate, IntegrationTestResult } from '@/lib/api';

export function makeService(overrides: Partial<Service> = {}): Service {
  return {
    id: 1,
    name: 'MBA Admissions Consulting',
    type: 'mba',
    price: 50000,
    currency: 'USD',
    duration: '6 weeks',
    features: ['Essay Review', 'Interview Prep'],
    description: 'Full admissions consulting package',
    is_active: true,
    ...overrides,
  };
}

export function makeFaq(overrides: Partial<FAQ> = {}): FAQ {
  return {
    id: 1,
    question: 'What is the consulting process?',
    answer: 'We start with a discovery call and then...',
    category: 'general',
    ...overrides,
  };
}

export function makeTestimonial(overrides: Partial<Testimonial> = {}): Testimonial {
  return {
    id: 1,
    client_name: 'Jane Doe',
    client_role: 'MBA Candidate',
    content: 'Excellent coaching that helped me get into Oxford.',
    tag: 'mba',
    ...overrides,
  };
}

export function makeBlogPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: 1,
    title: 'How to Ace Your MBA Interview',
    slug: 'ace-mba-interview',
    excerpt: 'Tips for a successful MBA interview.',
    content: 'Full article content here...',
    image_path: '/images/blog-interview.jpg',
    status: 'published',
    published_at: '2026-01-15T10:00:00Z',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

export function makeSiteContent(overrides: Partial<SiteContentResponse> = {}): SiteContentResponse {
  return {
    settings: {
      site_name: 'Gathoni Mwai Consulting',
      hero_tagline: "Africa's MBA & Consulting Coach",
      hero_headline: 'Get into Oxford, LBS, or Cambridge.',
    },
    services: [makeService()],
    testimonials: [makeTestimonial()],
    faqs: [makeFaq()],
    blog_posts: [makeBlogPost()],
    ...overrides,
  };
}

export function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 1,
    service_id: 1,
    service_name: 'MBA Admissions Consulting',
    name: 'John Smith',
    email: 'john@example.com',
    amount: 50000,
    currency: 'USD',
    paystack_ref: 'psk_ref_123',
    status: 'confirmed',
    created_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

export function makeUser(overrides: Partial<{ id: number; name: string; email: string; role: string }> = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'participant',
    ...overrides,
  };
}

export function makeMailTemplate(overrides: Partial<MailTemplate> = {}): MailTemplate {
  return {
    id: 1,
    key: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Gathoni Mwai Consulting',
    body: '<h1>Welcome {{name}}</h1><p>Thank you for joining.</p>',
    variables: ['name', 'email'],
    description: 'Sent to new users after registration',
    is_active: true,
    updated_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}

export function makeIntegrationTestResult(overrides: Partial<IntegrationTestResult> = {}): IntegrationTestResult {
  return {
    key: 'paystack',
    name: 'Paystack Payments',
    status: 'ok',
    configured: true,
    connected: true,
    message: 'Connection successful',
    details: {},
    tested_at: '2026-01-15T10:00:00Z',
    ...overrides,
  };
}
