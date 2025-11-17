// Database types matching Supabase schema

/**
 * Supabase Database type definition
 * Maps table names to their row types
 */
export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      options: {
        Row: Option;
        Insert: OptionInsert;
        Update: OptionUpdate;
      };
      booking_options: {
        Row: BookingOption;
        Insert: BookingOption;
        Update: Partial<BookingOption>;
      };
      emails: {
        Row: Email;
        Insert: EmailInsert;
        Update: EmailUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_status: BookingStatus;
      email_type: EmailType;
      email_status: EmailStatus;
    };
  };
}

export type Option = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  reservation_date: string; // ISO date string (YYYY-MM-DD)
  status: BookingStatus;
  google_calendar_event_id: string | null;
  notes: string | null;
  total_price: number | null;
  created_at: string;
  updated_at: string;
};

// Booking with options included (for queries with joins)
export type BookingWithOptions = Booking & {
  options: Option[];
};

// Junction table type
export type BookingOption = {
  booking_id: string;
  option_id: string;
};

export type EmailType = "confirmation" | "reminder" | "cancellation" | "update";
export type EmailStatus = "pending" | "sent" | "failed";

export type Email = {
  id: string;
  booking_id: string;
  email_type: EmailType;
  recipient_email: string;
  subject: string;
  status: EmailStatus;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
};

// For inserting emails (omits auto-generated fields)
export type EmailInsert = Omit<Email, "id" | "created_at" | "sent_at"> & {
  sent_at?: string | null;
};

// For updating email status
export type EmailUpdate = Partial<
  Pick<Email, "status" | "sent_at" | "error_message">
> & {
  id: string;
};

// For inserting new bookings (omits auto-generated fields)
export type BookingInsert = Omit<
  Booking,
  | "id"
  | "created_at"
  | "updated_at"
  | "google_calendar_event_id"
  | "total_price"
> & {
  google_calendar_event_id?: string | null;
  total_price?: number | null;
  option_ids: string[]; // Array of option IDs to link
};

// For updating bookings (all fields optional except id)
export type BookingUpdate = Partial<
  Omit<Booking, "id" | "created_at" | "updated_at">
> & {
  id: string;
  option_ids?: string[]; // Optional: update selected options
};

// For inserting options (omits auto-generated fields)
export type OptionInsert = Omit<Option, "id" | "created_at" | "updated_at">;

// For updating options
export type OptionUpdate = Partial<
  Omit<Option, "id" | "created_at" | "updated_at">
> & {
  id: string;
};
