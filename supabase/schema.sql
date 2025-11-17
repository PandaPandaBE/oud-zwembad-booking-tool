-- Database Schema for Booking Tool
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Options Table
-- Stores available add-ons/options that can be selected (kitchen, rooms, etc.)
CREATE TABLE options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings Table
-- Stores all reservations/bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  google_calendar_event_id TEXT,
  notes TEXT,
  total_price NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Options Junction Table
-- Links bookings to selected options
CREATE TABLE booking_options (
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES options(id) ON DELETE RESTRICT,
  PRIMARY KEY (booking_id, option_id)
);

-- Emails Table
-- Tracks all emails sent for bookings
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL CHECK (email_type IN ('confirmation', 'reminder', 'cancellation', 'update')),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_reservation_date ON bookings(reservation_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_options_active ON options(active);
CREATE INDEX idx_options_sort_order ON options(sort_order);
CREATE INDEX idx_booking_options_booking_id ON booking_options(booking_id);
CREATE INDEX idx_booking_options_option_id ON booking_options(option_id);
CREATE INDEX idx_emails_booking_id ON emails(booking_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_sent_at ON emails(sent_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_options_updated_at
  BEFORE UPDATE ON options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Since there's no user authentication, we'll allow public read/write
-- You can tighten this later if needed

ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active options
CREATE POLICY "Allow public read access to active options"
  ON options
  FOR SELECT
  USING (active = true);

-- Allow public read access to all bookings (for calendar view)
CREATE POLICY "Allow public read access to bookings"
  ON bookings
  FOR SELECT
  USING (true);

-- Allow public insert for bookings (form submissions)
CREATE POLICY "Allow public insert for bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Allow public update for bookings (status changes, etc.)
-- You might want to restrict this later to only allow updates from admin
CREATE POLICY "Allow public update for bookings"
  ON bookings
  FOR UPDATE
  USING (true);

-- Allow public read access to booking_options
CREATE POLICY "Allow public read access to booking_options"
  ON booking_options
  FOR SELECT
  USING (true);

-- Allow public insert for booking_options (when creating bookings)
CREATE POLICY "Allow public insert for booking_options"
  ON booking_options
  FOR INSERT
  WITH CHECK (true);

-- Allow public read access to emails (for checking email status)
CREATE POLICY "Allow public read access to emails"
  ON emails
  FOR SELECT
  USING (true);

-- Allow public insert for emails (when sending emails)
-- Note: In practice, emails should be inserted server-side only
CREATE POLICY "Allow public insert for emails"
  ON emails
  FOR INSERT
  WITH CHECK (true);

-- Allow public update for emails (updating status after sending)
CREATE POLICY "Allow public update for emails"
  ON emails
  FOR UPDATE
  USING (true);

-- Optional: If you want admin access later, you can add:
-- CREATE POLICY "Allow service role full access"
--   ON bookings
--   FOR ALL
--   USING (auth.role() = 'service_role');

-- Insert some sample options/add-ons
INSERT INTO options (name, description, price, active, sort_order) VALUES
  ('Keuken', 'Gebruik van de keuken', 50.00, true, 1),
  ('Grote zaal', 'Gebruik van de grote zaal', 100.00, true, 2),
  ('Kleine zaal', 'Gebruik van de kleine zaal', 75.00, true, 3);

