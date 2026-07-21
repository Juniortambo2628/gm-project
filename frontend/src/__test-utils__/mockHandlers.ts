import { http, HttpResponse } from 'msw';
import { makeSiteContent, makeService, makeFaq, makeBlogPost, makeBooking, makeUser } from './factories';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const handlers = [
  http.get(`${API_BASE}/site-content`, () => {
    return HttpResponse.json(makeSiteContent());
  }),

  http.get(`${API_BASE}/services`, () => {
    return HttpResponse.json([makeService()]);
  }),

  http.get(`${API_BASE}/services/:id`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json(makeService({ id }));
  }),

  http.get(`${API_BASE}/faqs`, () => {
    return HttpResponse.json([makeFaq()]);
  }),

  http.get(`${API_BASE}/blog`, () => {
    return HttpResponse.json({
      data: [makeBlogPost()],
      links: { first: '', last: '', prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 },
    });
  }),

  http.get(`${API_BASE}/blog/:slug`, ({ params }) => {
    const slug = String(params.slug);
    return HttpResponse.json(makeBlogPost({ slug }));
  }),

  http.get(`${API_BASE}/settings`, () => {
    return HttpResponse.json({
      site_name: 'Gathoni Mwai Consulting',
      hero_tagline: "Africa's MBA & Consulting Coach",
    });
  }),

  http.get(`${API_BASE}/settings/:key`, ({ params }) => {
    const key = String(params.key);
    return HttpResponse.json({ key, value: 'test-value' });
  }),

  http.get(`${API_BASE}/user`, () => {
    return HttpResponse.json(makeUser(), { status: 401 });
  }),

  http.post(`${API_BASE}/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'admin@example.com') {
      return HttpResponse.json({
        access_token: 'mock-admin-token',
        token_type: 'Bearer',
        user: makeUser({ role: 'admin', email: body.email }),
      });
    }
    return HttpResponse.json({
      access_token: 'mock-user-token',
      token_type: 'Bearer',
      user: makeUser({ email: body.email }),
    });
  }),

  http.post(`${API_BASE}/register`, async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; password: string };
    return HttpResponse.json({
      access_token: 'mock-register-token',
      token_type: 'Bearer',
      user: makeUser({ name: body.name, email: body.email }),
    });
  }),

  http.post(`${API_BASE}/logout`, () => {
    return HttpResponse.json({ message: 'Logged out' });
  }),

  http.post(`${API_BASE}/messages`, () => {
    return HttpResponse.json({ message: 'Inquiry submitted successfully' });
  }),

  http.post(`${API_BASE}/transactions`, () => {
    return HttpResponse.json({ message: 'Transaction recorded', id: 1 });
  }),

  http.get(`${API_BASE}/user/bookings`, () => {
    return HttpResponse.json([makeBooking()]);
  }),

  http.get(`${API_BASE}/user/bookings/:id`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json(makeBooking({ id }));
  }),

  http.post(`${API_BASE}/payments/verify`, () => {
    return HttpResponse.json({
      verified: true,
      data: {
        reference: 'psk_ref_123',
        amount: 50000,
        currency: 'USD',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        metadata: {},
        paid_at: '2026-01-15T10:00:00Z',
      },
    });
  }),

  http.post(`${API_BASE}/forgot-password`, () => {
    return HttpResponse.json({ message: 'Reset code sent', temp_token: 'mock-temp-token' });
  }),

  http.post(`${API_BASE}/verify-reset-code`, () => {
    return HttpResponse.json({ message: 'Code verified', reset_token: 'mock-reset-token' });
  }),

  http.post(`${API_BASE}/reset-password`, () => {
    return HttpResponse.json({ message: 'Password reset successfully' });
  }),

  http.post(`${API_BASE}/change-password`, () => {
    return HttpResponse.json({ message: 'Password changed' });
  }),

  http.put(`${API_BASE}/user`, () => {
    return HttpResponse.json(makeUser({ name: 'Updated User' }));
  }),

  http.get(`${API_BASE}/cms/mail-templates`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/cms/integrations`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/cms/notifications`, () => {
    return HttpResponse.json([]);
  }),

  http.get(`${API_BASE}/cms/dashboard`, () => {
    return HttpResponse.json({
      total_revenue: 150000,
      total_orders: 25,
      total_inquiries: 42,
      recent_orders: [],
    });
  }),
];
