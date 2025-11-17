import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingInsert, Database, Option } from "@/types/database";
import type { BookingFormData } from "@/lib/validations";
import { logError } from "@/lib/utils/logger";

export interface BookingWithOptions {
  id: string;
  name: string;
  email: string;
  phone: string;
  reservation_date: string;
  status: "pending" | "confirmed" | "cancelled";
  google_calendar_event_id: string | null;
  notes: string | null;
  total_price: number | null;
  created_at: string;
  updated_at: string;
  booking_options?: Array<{
    option_id: string;
    options: {
      id: string;
      name: string;
      description: string | null;
      price: number;
      active: boolean;
      sort_order: number;
      created_at: string;
      updated_at: string;
    };
  }>;
}

export interface BookingService {
  getBookings(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<BookingWithOptions[]>;
  getBookingById(id: string): Promise<BookingWithOptions | null>;
  createBooking(
    data: BookingFormData,
    options: Array<{ id: string; price: number }>
  ): Promise<BookingWithOptions>;
  updateBooking(
    id: string,
    data: Partial<BookingFormData>,
    options?: Array<{ id: string; price: number }>
  ): Promise<BookingWithOptions>;
  deleteBooking(id: string): Promise<void>;
  getOptionsByIds(ids: string[]): Promise<Array<{ id: string; price: number }>>;
  getAllOptions(): Promise<Option[]>;
}

export class SupabaseBookingService implements BookingService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getBookings(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<BookingWithOptions[]> {
    let query = this.supabase
      .from("bookings")
      .select(
        `
        *,
        booking_options (
          option_id,
          options (*)
        )
      `
      )
      .order("reservation_date", { ascending: true })
      .order("created_at", { ascending: false });

    if (params?.startDate) {
      query = query.gte("reservation_date", params.startDate);
    }
    if (params?.endDate) {
      query = query.lte("reservation_date", params.endDate);
    }

    const { data, error } = await query;

    if (error) {
      logError("Failed to fetch bookings from database", error, {
        operation: "getBookings",
        params,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });
      throw error;
    }

    return (data as any[]) || [];
  }

  async getBookingById(id: string): Promise<BookingWithOptions | null> {
    const { data, error } = await this.supabase
      .from("bookings")
      .select(
        `
        *,
        booking_options (
          option_id,
          options (*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found - this is expected, not an error
        return null;
      }
      logError("Failed to fetch booking by ID from database", error, {
        operation: "getBookingById",
        bookingId: id,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });
      throw error;
    }

    return (data as any) || null;
  }

  async createBooking(
    data: BookingFormData,
    options: Array<{ id: string; price: number }>
  ): Promise<BookingWithOptions> {
    // Calculate total price
    const totalPrice = options.reduce(
      (sum, option) => sum + Number(option.price),
      0
    );

    // Prepare booking data (exclude option_ids as it's not a database column)
    const bookingData: Omit<
      Database["public"]["Tables"]["bookings"]["Insert"],
      "option_ids"
    > = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      reservation_date: data.date,
      status: "pending" as const,
      notes: data.notes || null,
      total_price: totalPrice,
    };

    // Insert booking
    const { data: newBooking, error: bookingError } = await this.supabase
      .from("bookings")
      .insert([bookingData] as any)
      .select()
      .single();

    if (bookingError) {
      logError("Failed to create booking in database", bookingError, {
        operation: "createBooking",
        bookingData: {
          name: data.name,
          email: data.email,
          date: data.date,
          totalPrice,
        },
        errorCode: bookingError.code,
        errorMessage: bookingError.message,
        errorDetails: bookingError.details,
      });
      throw bookingError;
    }

    if (!newBooking) {
      const error = new Error("Failed to create booking");
      logError("Booking creation returned no data", error, {
        operation: "createBooking",
        bookingData: {
          name: data.name,
          email: data.email,
          date: data.date,
        },
      });
      throw error;
    }

    const bookingId = (newBooking as any).id;

    // Insert booking_options junction records
    const bookingOptions = data.reservationType.map((optionId) => ({
      booking_id: bookingId,
      option_id: optionId,
    }));

    const { error: junctionError } = await this.supabase
      .from("booking_options")
      .insert(bookingOptions as any);

    if (junctionError) {
      logError(
        "Failed to create booking_options junction records",
        junctionError,
        {
          operation: "createBooking",
          bookingId,
          optionIds: data.reservationType,
          errorCode: junctionError.code,
          errorMessage: junctionError.message,
          errorDetails: junctionError.details,
        }
      );
      // Try to clean up the booking if junction insert fails
      await this.supabase.from("bookings").delete().eq("id", bookingId);
      throw junctionError;
    }

    // Fetch the complete booking with options
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      const error = new Error("Failed to fetch created booking");
      logError("Failed to fetch created booking after creation", error, {
        operation: "createBooking",
        bookingId,
      });
      throw error;
    }

    return booking;
  }

  async updateBooking(
    id: string,
    data: Partial<BookingFormData>,
    options?: Array<{ id: string; price: number }>
  ): Promise<BookingWithOptions> {
    // Check if booking exists
    const existingBooking = await this.getBookingById(id);
    if (!existingBooking) {
      const error = new Error("Booking not found");
      logError("Booking not found for update", error, {
        operation: "updateBooking",
        bookingId: id,
      });
      throw error;
    }

    const bookingData: Partial<{
      name: string;
      email: string;
      phone: string;
      reservation_date: string;
      notes: string | null;
      total_price: number;
    }> = {};

    if (data.name !== undefined) {
      bookingData.name = data.name;
    }
    if (data.email !== undefined) {
      bookingData.email = data.email;
    }
    if (data.phone !== undefined) {
      bookingData.phone = data.phone;
    }
    if (data.date !== undefined) {
      bookingData.reservation_date = data.date;
    }
    if (data.notes !== undefined) {
      bookingData.notes = data.notes || null;
    }

    // Handle options update
    if (options && data.reservationType !== undefined) {
      // Calculate new total price
      const totalPrice = options.reduce(
        (sum, option) => sum + Number(option.price),
        0
      );
      bookingData.total_price = totalPrice;

      // Delete existing booking_options
      const { error: deleteError } = await this.supabase
        .from("booking_options")
        .delete()
        .eq("booking_id", id);

      if (deleteError) {
        logError("Failed to delete existing booking_options", deleteError, {
          operation: "updateBooking",
          bookingId: id,
          errorCode: deleteError.code,
          errorMessage: deleteError.message,
          errorDetails: deleteError.details,
        });
        throw deleteError;
      }

      // Insert new booking_options
      const bookingOptions: Array<{
        booking_id: string;
        option_id: string;
      }> = data.reservationType.map((optionId: string) => ({
        booking_id: id,
        option_id: optionId,
      }));

      const { error: insertError } = await this.supabase
        .from("booking_options")
        .insert(bookingOptions as any);

      if (insertError) {
        logError("Failed to insert new booking_options", insertError, {
          operation: "updateBooking",
          bookingId: id,
          optionIds: data.reservationType,
          errorCode: insertError.code,
          errorMessage: insertError.message,
          errorDetails: insertError.details,
        });
        throw insertError;
      }
    }

    // Update booking if there are fields to update
    if (Object.keys(bookingData).length > 0) {
      const { error: updateError } = await this.supabase
        .from("bookings")
        // @ts-ignore - Supabase type inference issue with dynamic bookingData
        .update(bookingData)
        .eq("id", id);

      if (updateError) {
        logError("Failed to update booking in database", updateError, {
          operation: "updateBooking",
          bookingId: id,
          updateData: bookingData,
          errorCode: updateError.code,
          errorMessage: updateError.message,
          errorDetails: updateError.details,
        });
        throw updateError;
      }
    }

    // Fetch updated booking
    const updatedBooking = await this.getBookingById(id);
    if (!updatedBooking) {
      const error = new Error("Failed to fetch updated booking");
      logError("Failed to fetch updated booking after update", error, {
        operation: "updateBooking",
        bookingId: id,
      });
      throw error;
    }

    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    const existingBooking = await this.getBookingById(id);
    if (!existingBooking) {
      const error = new Error("Booking not found");
      logError("Booking not found for deletion", error, {
        operation: "deleteBooking",
        bookingId: id,
      });
      throw error;
    }

    const { error } = await this.supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
      logError("Failed to delete booking from database", error, {
        operation: "deleteBooking",
        bookingId: id,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });
      throw error;
    }
  }

  async getOptionsByIds(
    ids: string[]
  ): Promise<Array<{ id: string; price: number }>> {
    const { data, error } = await this.supabase
      .from("options")
      .select("id, price")
      .in("id", ids)
      .eq("active", true);

    if (error) {
      logError("Failed to fetch options by IDs from database", error, {
        operation: "getOptionsByIds",
        optionIds: ids,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });
      throw error;
    }

    return (data as Array<{ id: string; price: number }>) || [];
  }

  async getAllOptions(): Promise<Option[]> {
    const { data, error } = await this.supabase
      .from("options")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      logError("Failed to fetch all options from database", error, {
        operation: "getAllOptions",
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
      });
      throw error;
    }

    return (data as Option[]) || [];
  }
}
