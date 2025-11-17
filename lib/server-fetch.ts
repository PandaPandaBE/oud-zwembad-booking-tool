export type Ok<T> = { ok: true; data: T };

export type Err = { ok: false; message: string };

export type Result<T> = Ok<T> | Err;

/**
 * We're using this data structure when fetching in server functions instead
 * of throwing errors, because we're caching those using React's 'cache' function.
 * This also caches errors, so we wrap the response in this kind of structure
 * because we don't want to 'poison' the cache by throwing errors.
 */
export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });

export const err = (message: string): Err => ({ ok: false, message });

export function toToastProps<T>(
  result: Result<T>,
  opts?: { success?: string } // optional success message
): { success?: string | null; error?: string | null } {
  if (!result.ok) {
    return { error: result.message, success: null };
  }
  return { success: opts?.success ?? null, error: null };
}
