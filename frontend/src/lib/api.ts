/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/lib/axios";
import { AxiosResponse } from "axios";

export function extractList<T>(res: AxiosResponse<unknown>): T[] {
  if (Array.isArray(res.data)) return res.data as T[];
  const wrapped = (res.data as { data?: unknown } | undefined)?.data;
  if (Array.isArray(wrapped)) return wrapped as T[];
  return [];
}

export interface SiteContentResponse {
  settings: Record<string, any>;
  services: any[];
  testimonials: any[];
  faqs: any[];
  blog_posts: any[];
}

export interface BlogPost {
  id?: number;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  image_path?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: number;
  name: string;
  type: 'mba' | 'consulting';
  price: number;
  currency: string;
  duration?: string;
  features: string[];
  description?: string;
  is_active: boolean;
}

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  category?: string;
}

export interface Testimonial {
  id?: number;
  client_name: string;
  client_role: string;
  content: string;
  tag?: string;
  award?: string;
}

export interface MessageData {
  name: string;
  email: string;
  country?: string;
  subject?: string;
  content: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  country?: string;
  subject?: string;
  content: string;
  created_at: string;
}

export interface TransactionData {
  name: string;
  email: string;
  amount: number;
  currency: string;
  service_id: number;
  paystack_ref: string;
  status?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ProfileData {
  name?: string;
  email?: string;
}

export interface PasswordData {
  current_password?: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface Booking {
  id: number;
  service_id: number;
  service_name: string;
  name: string;
  email: string;
  amount: string | number;
  currency: string;
  paystack_ref: string;
  status: string;
  created_at: string;
}

export interface MailTemplate {
  id: number;
  key: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  description?: string;
  is_active: boolean;
  updated_at?: string;
}

export interface MailTemplatePreview {
  subject: string;
  html: string;
  placeholders: Record<string, string>;
}

export interface IntegrationTestResult {
  key: string;
  name: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  configured: boolean;
  connected: boolean;
  message: string;
  details: Record<string, unknown>;
  tested_at?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  thumbnail_url: string | null;
}

export interface ImagePosition {
  x: number;
  y: number;
  mobile_x?: number;
  mobile_y?: number;
}

export interface MediaMetadata {
  url: string;
  path: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    return axiosError.response?.data?.message || axiosError.message || "An unexpected error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

// Content / public
export async function getSiteContent(): Promise<SiteContentResponse> {
  const res = await axiosInstance.get("/site-content");
  return res.data;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await axiosInstance.get("/blog");
  return extractList<BlogPost>(res);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await axiosInstance.get(`/blog/${slug}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export async function getServices(): Promise<Service[]> {
  const res = await axiosInstance.get("/services");
  return extractList<Service>(res);
}

export async function getService(id: number): Promise<Service | null> {
  try {
    const res = await axiosInstance.get(`/services/${id}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export async function getFaqs(): Promise<FAQ[]> {
  const res = await axiosInstance.get("/faqs");
  return extractList<FAQ>(res);
}

// Public mutations
export async function createMessage(data: MessageData) {
  const res = await axiosInstance.post("/messages", data);
  return res.data;
}

export async function createTransaction(data: TransactionData) {
  const res = await axiosInstance.post("/transactions", data);
  return res.data;
}

export interface PaymentVerificationData {
  reference: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    customer_email: string;
    customer_name: string;
    metadata: Record<string, unknown>;
    paid_at: string;
  };
  message?: string;
}

export async function verifyPayment(reference: string): Promise<PaymentVerificationResult> {
  const res = await axiosInstance.post("/payments/verify", { reference });
  return res.data;
}

// Auth
export async function login(credentials: LoginCredentials) {
  const res = await axiosInstance.post("/login", credentials);
  return res.data;
}

export async function register(data: RegisterData) {
  const res = await axiosInstance.post("/register", data);
  return res.data;
}

export async function logout() {
  const res = await axiosInstance.post("/logout");
  return res.data;
}

export async function updateProfile(data: ProfileData) {
  const res = await axiosInstance.put("/user", data);
  return res.data;
}

export async function changePassword(data: PasswordData) {
  const res = await axiosInstance.post("/change-password", data);
  return res.data;
}

export async function forgotPassword(email: string) {
  const res = await axiosInstance.post("/forgot-password", { email });
  return res.data;
}

export async function verifyResetCode(tempToken: string, code: string) {
  const res = await axiosInstance.post("/verify-reset-code", { temp_token: tempToken, code });
  return res.data;
}

export async function resetPassword(resetToken: string, password: string, passwordConfirmation: string) {
  const res = await axiosInstance.post("/reset-password", {
    reset_token: resetToken,
    password,
    password_confirmation: passwordConfirmation,
  });
  return res.data;
}

// User bookings
export async function getUserBookings(): Promise<Booking[]> {
  const res = await axiosInstance.get("/user/bookings");
  return extractList<Booking>(res);
}

export async function getUserBooking(id: number): Promise<Booking | null> {
  try {
    const res = await axiosInstance.get(`/user/bookings/${id}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

// Mail templates
export async function getMailTemplates(): Promise<MailTemplate[]> {
  const res = await axiosInstance.get('/cms/mail-templates');
  return extractList<MailTemplate>(res);
}

export async function getMailTemplate(key: string): Promise<MailTemplate> {
  const res = await axiosInstance.get(`/cms/mail-templates/${key}`);
  return res.data;
}

export async function updateMailTemplate(key: string, data: { subject: string; body: string }): Promise<MailTemplate> {
  const res = await axiosInstance.put(`/cms/mail-templates/${key}`, data);
  return res.data.data;
}

export async function previewMailTemplate(key: string): Promise<MailTemplatePreview> {
  const res = await axiosInstance.get(`/cms/mail-templates/${key}/preview`);
  return res.data;
}

export async function resetMailTemplate(key: string): Promise<MailTemplate> {
  const res = await axiosInstance.post(`/cms/mail-templates/${key}/reset`);
  return res.data.data;
}

// Integration testing
export async function getIntegrationTests(): Promise<IntegrationTestResult[]> {
  const res = await axiosInstance.get('/cms/integrations');
  return res.data;
}

export async function runIntegrationTest(key: string): Promise<IntegrationTestResult> {
  const res = await axiosInstance.post(`/cms/integrations/test/${key}`);
  return res.data.data;
}

export async function runAllIntegrationTests(): Promise<IntegrationTestResult[]> {
  const res = await axiosInstance.post('/cms/integrations/test-all');
  return res.data.data;
}

// Media upload helpers
export async function getMediaMetadata(path: string): Promise<MediaMetadata> {
  const res = await axiosInstance.post('/cms/upload/metadata', { path });
  return res.data;
}

export function getMediaDownloadUrl(path: string): string {
  const base = axiosInstance.defaults.baseURL || '';
  return `${base}/cms/upload/download?path=${encodeURIComponent(path)}`;
}

export async function updateImagePosition(key: string, position: ImagePosition): Promise<void> {
  await axiosInstance.post('/cms/upload/position', { key, ...position });
}
