/**
 * Stable guest session for API cart / guest checkout (x-session-id).
 */
const STORAGE_KEY = "shopsmart_x_session_id";

export function getOrCreateSessionId() {
  try {
    let id = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!id || typeof id !== "string" || id.length < 8) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, id);
      }
    }
    return id;
  } catch {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}
