import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extracts a human-readable message from an error thrown by an HttpClient
 * call. The backend returns `{ message: string }` on failures (see
 * backend/src/middleware/error.middleware.ts), so prefer that over the raw
 * error object — `err.toString()` on an HttpErrorResponse produces
 * "[object Object]", which is not something a user should ever see.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error as { message?: string } | null;
    if (body?.message) return body.message;
    if (err.status === 0) return 'Could not reach the server. Check your connection and try again.';
    return fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
