/**
 * Extracts a clean, descriptive error message from RTK Query, Fetch, or JS error objects
 * @param {any} err - The error caught from a query, mutation, or try/catch block
 * @param {string} [fallback="An error occurred. Please try again."] - Optional fallback message
 * @returns {string}
 */
export function extractErrorMessage(err, fallback = "An error occurred. Please try again.") {
  if (!err) return fallback;
  if (typeof err === "string") return err;

  const data = err.data || err;
  if (typeof data === "string") return data;

  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (data?.message) return data.message;
  if (data?.details && typeof data.details === "string") return data.details;
  if (err.message) return err.message;

  return fallback;
}
