/**
 * Shared utilities for API client functions
 */

/**
 * Handles fetch Response objects, parsing JSON and handling errors.
 * Ensures consistent error handling across all API calls.
 *
 * @param response - The Response object from a fetch call
 * @returns Parsed JSON data of type T
 * @throws Error with a descriptive message if the response is not ok or not JSON
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    let errorMessage = "Er is een fout opgetreden bij de API call";

    // Try to parse error response
    try {
      if (isJson) {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } else {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      }
    } catch {
      // If parsing fails, use default message
    }

    throw new Error(errorMessage);
  }

  // Parse successful JSON response
  if (!isJson) {
    throw new Error("Server response is not JSON");
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("Failed to parse JSON response");
  }
}
