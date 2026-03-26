import type { ApiErrorResponse, ApiSuccessResponse } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type RequestOptions = RequestInit & {
  signal?: AbortSignal;
};

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return false;
  }

  const { error } = value as ApiErrorResponse;

  return typeof error.code === "string" && typeof error.message === "string";
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const apiRequest = async <T>(
  path: string,
  options?: RequestOptions
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type");
  const hasJsonBody = contentType?.includes("application/json");
  const payload = hasJsonBody ? ((await response.json()) as unknown) : undefined;

  if (!response.ok) {
    if (isApiErrorResponse(payload)) {
      throw new ApiClientError(
        payload.error.message,
        response.status,
        payload.error.code,
        payload.error.details
      );
    }

    throw new ApiClientError(
      `Request failed with status ${response.status}.`,
      response.status,
      "HTTP_ERROR"
    );
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new Error("Unexpected API response format.");
  }

  return (payload as ApiSuccessResponse<T>).data;
};
