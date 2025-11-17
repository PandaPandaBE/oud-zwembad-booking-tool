import type { BookingFormData } from "@/lib/validations";

export interface Booking extends BookingFormData {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingParams extends BookingFormData {}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  data: Booking;
  error?: string;
}

export interface GetBookingsParams {
  startDate?: string;
  endDate?: string;
  reservationType?: string[];
}

export interface GetBookingsResponse {
  success: boolean;
  data: Booking[];
  error?: string;
}

export interface GetBookingByIdResponse {
  success: boolean;
  data: Booking;
  error?: string;
}

export interface UpdateBookingParams extends Partial<BookingFormData> {
  id: string;
}

export interface UpdateBookingResponse {
  success: boolean;
  message: string;
  data: Booking;
  error?: string;
}

export interface DeleteBookingResponse {
  success: boolean;
  message: string;
  error?: string;
}

