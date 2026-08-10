import { toast } from "sonner";
import { ApiError, normalizeError } from "@/api/apiClient";

/** Single entry point for surfacing API failures to the user. */
export function handleApiError(error: unknown, fallback = "Request failed"): ApiError {
  const apiError = normalizeError(error);

  const title =
    apiError.status === 0
      ? "Connection problem"
      : apiError.status === 401
        ? "Session expired"
        : apiError.status === 403
          ? "Not allowed"
          : apiError.status === 404
            ? "Not found"
            : apiError.status === 409
              ? "Conflict"
              : apiError.status >= 500
                ? "Server error"
                : fallback;

  toast.error(title, { description: apiError.message });
  return apiError;
}
