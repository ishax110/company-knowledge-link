import axios, { AxiosError, type AxiosInstance } from "axios";
import type { FieldError } from "@/types/api";

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ??
  "https://knowledge-repository.onrender.com";

const TOKEN_KEY = "kr.auth.token";
const USER_KEY = "kr.auth.user";
export const UNAUTHORIZED_EVENT = "kr:unauthorized";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
  getUser<T>(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  setUser(user: unknown) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  isNetworkError: boolean;

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
    isNetworkError = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.isNetworkError = isNetworkError;
  }
}

function statusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Some of the submitted information is invalid.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested resource could not be found.";
    case 409:
      return "This conflicts with an existing record.";
    case 413:
      return "The file is too large.";
    case 422:
      return "The submitted data could not be processed.";
    default:
      return status >= 500
        ? "The server ran into a problem. Please try again shortly."
        : "Something went wrong. Please try again.";
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Record<string, unknown>>;

    if (!axiosError.response) {
      return new ApiError(
        axiosError.code === "ECONNABORTED"
          ? "The request timed out. Please check your connection and try again."
          : "Unable to reach the server. Check your network connection and try again.",
        0,
        {},
        true,
      );
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;
    const fieldErrors: Record<string, string> = {};
    let message = "";

    if (data && typeof data === "object") {
      const errors = (data as { errors?: FieldError[] }).errors;
      if (Array.isArray(errors)) {
        errors.forEach((entry) => {
          if (entry?.path && entry?.msg) fieldErrors[entry.path] = entry.msg;
        });
        message = errors.map((entry) => entry?.msg).filter(Boolean).join(" · ");
      }
      message =
        (data as { message?: string }).message ??
        (data as { error?: string }).error ??
        message;
    } else if (typeof data === "string" && data && !data.startsWith("<")) {
      message = data;
    }

    return new ApiError(message || statusMessage(status), status, fieldErrors);
  }

  if (error instanceof Error) return new ApiError(error.message, 0);
  return new ApiError("An unexpected error occurred.", 0);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error);
    if (normalized.status === 401 && typeof window !== "undefined") {
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(normalized);
  },
);
