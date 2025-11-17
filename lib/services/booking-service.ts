import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { BookingFormData } from "@/lib/validations";

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
        return null;
      }
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

    // Prepare booking data
    const bookingData = {
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
      .insert(bookingData as any)
      .select()
      .single();

    if (bookingError) {
      throw bookingError;
    }

    if (!newBooking) {
      throw new Error("Failed to create booking");
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
      // Try to clean up the booking if junction insert fails
      await this.supabase.from("bookings").delete().eq("id", bookingId);
      throw junctionError;
    }

    // Fetch the complete booking with options
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Failed to fetch created booking");
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
      throw new Error("Booking not found");
    }

    const bookingData: Record<string, any> = {};

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
        throw deleteError;
      }

      // Insert new booking_options
      const bookingOptions = data.reservationType.map((optionId: string) => ({
        booking_id: id,
        option_id: optionId,
      }));

      const { error: insertError } = await this.supabase
        .from("booking_options")
        .insert(bookingOptions as any);

      if (insertError) {
        throw insertError;
      }
    }

    // Update booking if there are fields to update
    if (Object.keys(bookingData).length > 0) {
      const { error: updateError } = await this.supabase
        .from("bookings")
        .update(bookingData as any)
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }
    }

    // Fetch updated booking
    const updatedBooking = await this.getBookingById(id);
    if (!updatedBooking) {
      throw new Error("Failed to fetch updated booking");
    }

    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    const existingBooking = await this.getBookingById(id);
    if (!existingBooking) {
      throw new Error("Booking not found");
    }

    const { error } = await this.supabase
      .from("bookings")
      .delete()
      .eq("id", id);

    if (error) {
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
      throw error;
    }

    return (data as Array<{ id: string; price: number }>) || [];
  }
}
