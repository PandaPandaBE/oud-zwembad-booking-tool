import type { BookingFormData } from "@/lib/validations";
import type { BookingStatus, Option } from "@/types/database";

/**
 * Booking status type matching the database schema
 */
export type BookingStatusType = BookingStatus;

/**
 * Core Booking entity representing a reservation/booking.
 * This is the API representation that combines database fields with
 * form-specific fields for display purposes.
 */
export interface Booking {
  /** Unique identifier for the booking */
  id: string;

  /** Customer's full name */
  name: string;

  /** Customer's email address */
  email: string;

  /** Customer's phone number */
  phone: string;

  /** Array of selected reservation type option IDs (UUIDs) */
  reservationType: string[];

  /** Reservation date in YYYY-MM-DD format */
  date: string;

  /** Start time in HH:mm format (e.g., "14:00") */
  startTime: string;

  /** Duration in hours as a string (e.g., "2" for 2 hours) */
  duration: string;

  /** Optional notes or special requests */
  notes?: string;

  /** ISO timestamp when the booking was created */
  createdAt: string;

  /** ISO timestamp when the booking was last updated */
  updatedAt: string;
}

/**
 * Booking with full option details included.
 * Used when you need the complete option information (name, price, etc.)
 * rather than just the option IDs.
 */
export interface BookingWithOptionDetails
  extends Omit<Booking, "reservationType"> {
  /** Array of full option objects with details */
  reservationType: Option[];
}

/**
 * Database booking representation.
 * This matches the actual database schema structure.
 */
export interface DatabaseBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  reservation_date: string; // ISO date string (YYYY-MM-DD)
  status: BookingStatusType;
  google_calendar_event_id: string | null;
  notes: string | null;
  total_price: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for creating a new booking.
 * Extends BookingFormData to include all required form fields.
 */
export interface CreateBookingParams extends BookingFormData {}

/**
 * Response from creating a booking.
 */
export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: Booking;
  error?: string;
}

/**
 * Parameters for querying/filtering bookings.
 */
export interface GetBookingsParams {
  /** Start date for filtering bookings (YYYY-MM-DD) */
  startDate?: string;
  /** End date for filtering bookings (YYYY-MM-DD) */
  endDate?: string;
  /** Filter by reservation type option IDs */
  reservationType?: string[];
}

/**
 * Response from fetching multiple bookings.
 */
export interface GetBookingsResponse {
  success: boolean;
  data: Booking[];
  error?: string;
}

/**
 * Response from fetching a single booking by ID.
 */
export interface GetBookingByIdResponse {
  success: boolean;
  data: Booking;
  error?: string;
}

/**
 * Parameters for updating an existing booking.
 */
export interface UpdateBookingParams extends Partial<BookingFormData> {
  /** Booking ID to update */
  id: string;
}

/**
 * Response from updating a booking.
 */
export interface UpdateBookingResponse {
  success: boolean;
  message: string;
  data: Booking;
  error?: string;
}

/**
 * Response from deleting a booking.
 */
export interface DeleteBookingResponse {
  success: boolean;
  message: string;
  error?: string;
}
