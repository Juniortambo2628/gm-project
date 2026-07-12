import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

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
