/**
 * Option types for the booking system.
 * Options represent available reservation types/add-ons that can be selected
 * when making a booking (e.g., kitchen, rooms, pool, etc.).
 */

/**
 * Core Option entity representing a reservation type/add-on.
 * This is the API representation matching the database schema.
 */
export interface Option {
  /** Unique identifier for the option (UUID) */
  id: string;

  /** Display name of the option (e.g., "Keuken", "Grote zaal") */
  name: string;

  /** Optional description of what the option includes */
  description: string | null;

  /** Price in euros (stored as numeric/decimal) */
  price: number;

  /** Whether this option is currently active and available for selection */
  active: boolean;

  /** Sort order for displaying options (lower numbers appear first) */
  sort_order: number;

  /** ISO timestamp when the option was created */
  created_at: string;

  /** ISO timestamp when the option was last updated */
  updated_at: string;
}

/**
 * Database option representation.
 * This matches the actual database schema structure exactly.
 * Alias for Option since they're the same in this case.
 */
export type DatabaseOption = Option;

/**
 * Minimal option representation with only ID and price.
 * Used for quick lookups when calculating total booking prices.
 */
export interface OptionSummary {
  /** Unique identifier for the option */
  id: string;
  /** Price in euros */
  price: number;
}

/**
 * Option with formatted price for display purposes.
 * Extends Option with a formatted price string.
 */
export interface OptionWithFormattedPrice extends Option {
  /** Formatted price string (e.g., "€50,00" or "€100.00") */
  formattedPrice: string;
}

/**
 * Parameters for creating a new option.
 * Omits auto-generated fields (id, timestamps).
 */
export interface CreateOptionParams {
  /** Display name of the option */
  name: string;
  /** Optional description */
  description?: string | null;
  /** Price in euros */
  price: number;
  /** Whether the option is active (defaults to true) */
  active?: boolean;
  /** Sort order for display (defaults to 0) */
  sort_order?: number;
}

/**
 * Parameters for updating an existing option.
 * All fields are optional except id.
 */
export interface UpdateOptionParams {
  /** Option ID to update */
  id: string;
  /** Updated name */
  name?: string;
  /** Updated description */
  description?: string | null;
  /** Updated price */
  price?: number;
  /** Updated active status */
  active?: boolean;
  /** Updated sort order */
  sort_order?: number;
}

/**
 * Response from creating an option.
 */
export interface CreateOptionResponse {
  success: boolean;
  message: string;
  data: Option;
  error?: string;
}

/**
 * Response from fetching multiple options.
 */
export interface GetOptionsResponse {
  success: boolean;
  data: Option[];
  error?: string;
}

/**
 * Response from fetching a single option by ID.
 */
export interface GetOptionByIdResponse {
  success: boolean;
  data: Option;
  error?: string;
}

/**
 * Response from updating an option.
 */
export interface UpdateOptionResponse {
  success: boolean;
  message: string;
  data: Option;
  error?: string;
}

/**
 * Response from deleting an option.
 */
export interface DeleteOptionResponse {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Parameters for querying/filtering options.
 */
export interface GetOptionsParams {
  /** Filter by active status */
  active?: boolean;
  /** Filter by minimum price */
  minPrice?: number;
  /** Filter by maximum price */
  maxPrice?: number;
  /** Sort by field (defaults to sort_order) */
  sortBy?: "sort_order" | "name" | "price" | "created_at";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}
