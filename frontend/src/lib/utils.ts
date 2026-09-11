import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "\u00a3",
  USD: "$",
  KES: "KSh",
  EUR: "\u20ac",
};

export function formatCurrency(amount: number, currency?: string): string {
  const code = (currency || "GBP").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || code;
  return `${symbol}${Number(amount).toLocaleString()}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAxiosError(error: unknown): error is AxiosError<{ message?: string }> {
  return error instanceof AxiosError
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message || fallback
  }
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}
