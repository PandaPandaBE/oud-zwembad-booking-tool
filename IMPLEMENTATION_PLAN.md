# Implementation Plan - Booking Tool

## Overview

Build a venue booking tool with form-based reservations, calendar integration, and email notifications.

## Phase 1: Project Setup & Foundation (Day 1)

### 1.1 Environment Setup

- [x] Set up Supabase project
  - Create database tables (bookings, reservation_types, etc.)
  - Configure Row Level Security (RLS) policies
  - Get Supabase URL and anon key
- [ ] Set up Google Cloud Project
  - Enable Google Calendar API
  - Enable Gmail API
  - Create OAuth 2.0 credentials
  - Set up service account (if using service account approach)
- [ ] Configure environment variables
  - `.env.local` with all API keys and secrets
  - Add to `.gitignore`

### 1.2 Install Dependencies

- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Install React Hook Form: `npm install react-hook-form`
- [ ] Install Zod for validation: `npm install zod @hookform/resolvers`
- [ ] Install Google APIs: `npm install googleapis` (or use REST API)
- [ ] Install email service (choose one):
  - Option A: Resend (`npm install resend`) - Recommended for simplicity
  - Option B: Gmail API (already enabled)
- [ ] Add shadcn/ui components:
  - `npx shadcn@latest add form`
  - `npx shadcn@latest add input`
  - `npx shadcn@latest add label`
  - `npx shadcn@latest add button`
  - `npx shadcn@latest add tabs`
  - `npx shadcn@latest add calendar`
  - `npx shadcn@latest add card`
  - `npx shadcn@latest add select`
  - `npx shadcn@latest add dialog`
  - `npx shadcn@latest add toast` (or `sonner`)

### 1.3 Database Schema Design

- [ ] Create `bookings` table:
  ```sql
  - id (uuid, primary key)
  - name (text)
  - email (text)
  - phone (text)
  - reservation_date (date)
  - reservation_type_id (uuid, foreign key)
  - status (text: 'pending', 'confirmed', 'cancelled')
  - google_calendar_event_id (text, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```
- [ ] Create `reservation_types` table:
  ```sql
  - id (uuid, primary key)
  - name (text)
  - description (text, nullable)
  - price (numeric)
  - includes_kitchen (boolean)
  - room_type (text: 'big', 'small', 'both', 'none')
  - active (boolean)
  ```
- [ ] Create indexes for performance
- [ ] Set up RLS policies

### 1.4 Project Structure

- [ ] Create folder structure:
  ```
  app/
    api/
      bookings/
      calendar/
      email/
    lib/
      supabase/
      google/
      email/
    hooks/
    types/
    components/
      booking-form/
      calendar-view/
      reservation-types/
      general-info/
  ```

## Phase 2: Core UI Components (Day 2-3)

### 2.1 Layout & Main Page Structure

- [ ] Create main page layout with two-column design
  - Left: Booking form (fixed width ~400px)
  - Right: Tabs component
- [ ] Make responsive (stack on mobile)
- [ ] Add proper styling and spacing

### 2.2 Booking Form Component

- [ ] Create `BookingForm` component
- [ ] Implement form fields:
  - Name (text input)
  - Email (email input with validation)
  - Phone (tel input with validation)
  - Date picker (using shadcn calendar)
  - Reservation type selector (dropdown)
- [ ] Add form validation with Zod schema
- [ ] Implement form submission handler
- [ ] Add loading and error states
- [ ] Show success message after submission

### 2.3 Tabs Component

- [ ] Create tabs structure:
  - Tab 1: Calendar View
  - Tab 2: Reservation Types & Pricing
  - Tab 3: General Information
- [ ] Style tabs consistently

### 2.4 Calendar View Tab

- [ ] Create `CalendarView` component
- [ ] Fetch bookings from Supabase
- [ ] Display calendar with reserved dates highlighted
- [ ] Show booking details on date hover/click
- [ ] Use date-fns for date formatting
- [ ] Handle month navigation

### 2.5 Reservation Types Tab

- [ ] Create `ReservationTypes` component
- [ ] Fetch reservation types from Supabase
- [ ] Display cards/list with:
  - Name
  - Description
  - Price
  - Features (kitchen, room type)
- [ ] Make it visually appealing

### 2.6 General Information Tab

- [ ] Create `GeneralInfo` component
- [ ] Add static content:
  - Venue information
  - Contact details
  - Rules/guidelines
  - FAQ (optional)

## Phase 3: Backend Integration (Day 4-5)

### 3.1 Supabase Integration

- [ ] Create Supabase client utilities (`lib/supabase/client.ts`, `server.ts`)
- [ ] Create Server Actions for bookings:
  - `createBooking(formData)`
  - `getBookings(dateRange)`
  - `getReservationTypes()`
- [ ] Implement React Query hooks:
  - `useBookings()`
  - `useReservationTypes()`
  - `useCreateBooking()`
- [ ] Test CRUD operations

### 3.2 Form Submission Flow

- [ ] Connect form to Server Action
- [ ] Handle validation errors
- [ ] Show success/error toasts
- [ ] Reset form after success
- [ ] Invalidate React Query cache

## Phase 4: Google Calendar Integration (Day 6-7)

### 4.1 Google Calendar Setup

- [ ] Create API route for Google OAuth (`app/api/auth/google/route.ts`)
- [ ] Implement token storage (Supabase or secure cookies)
- [ ] Create utility functions for Google Calendar API
- [ ] Handle token refresh logic

### 4.2 Calendar Sync Logic

- [ ] Create Server Action to sync booking to Google Calendar
  - Create event when booking is confirmed
  - Include booking details in event description
- [ ] Create API route to fetch existing events from Google Calendar
- [ ] Sync existing Google Calendar events to database (optional)
- [ ] Handle event updates/deletions

### 4.3 Calendar View Integration

- [ ] Fetch events from Google Calendar
- [ ] Merge with database bookings
- [ ] Display all reserved dates in calendar view
- [ ] Handle conflicts/overlaps

## Phase 5: Email Integration (Day 8)

### 5.1 Email Service Setup

- [ ] Choose email service (Resend recommended)
- [ ] Set up email templates
- [ ] Create email utility functions

### 5.2 Confirmation Emails

- [ ] Create email template for booking confirmation
- [ ] Include booking details:
  - Name, email, phone
  - Date and time
  - Reservation type and price
  - Booking reference number
- [ ] Send email after successful booking
- [ ] Handle email sending errors gracefully

### 5.3 Email Templates

- [ ] Design HTML email template
- [ ] Make it responsive
- [ ] Include venue branding (if applicable)

## Phase 6: Polish & Testing (Day 9-10)

### 6.1 Error Handling

- [ ] Add error boundaries
- [ ] Improve error messages
- [ ] Add retry logic for failed requests
- [ ] Log errors appropriately

### 6.2 Loading States

- [ ] Add loading skeletons
- [ ] Show loading indicators during async operations
- [ ] Optimize React Query cache settings

### 6.3 UX Improvements

- [ ] Add form field focus management
- [ ] Improve accessibility (ARIA labels, keyboard navigation)
- [ ] Add animations/transitions
- [ ] Optimize mobile experience

### 6.4 Testing

- [ ] Test form validation
- [ ] Test booking creation flow
- [ ] Test calendar sync
- [ ] Test email delivery
- [ ] Test error scenarios
- [ ] Test on different screen sizes

## Phase 7: Deployment (Day 11)

### 7.1 Pre-deployment

- [ ] Set up production environment variables
- [ ] Configure Supabase production database
- [ ] Set up production Google OAuth credentials
- [ ] Configure email service for production

### 7.2 Deployment

- [ ] Deploy to Vercel (recommended for Next.js)
- [ ] Configure domain (if needed)
- [ ] Set up monitoring/analytics (optional)

## Technical Decisions Needed

1. **Email Service**: Resend vs Gmail API

   - Recommendation: Resend (simpler, better deliverability)

2. **Google Calendar Auth**: OAuth vs Service Account

   - Recommendation: OAuth for user-specific calendars, Service Account for shared calendar

3. **Date/Time Handling**:

   - Store dates in UTC
   - Display in local timezone
   - Consider time slots vs full-day bookings

4. **Booking Status Flow**:

   - Auto-confirm vs manual approval
   - Payment integration (future consideration)

5. **Calendar Sync Direction**:
   - One-way (app → Google) vs bidirectional
   - Recommendation: Start with one-way, add bidirectional later if needed

## Dependencies to Install

```bash
# Core dependencies
npm install @supabase/supabase-js
npm install react-hook-form zod @hookform/resolvers
npm install googleapis  # or use REST API with fetch
npm install resend  # or nodemailer for Gmail

# shadcn/ui components (run these commands)
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add button
npx shadcn@latest add tabs
npx shadcn@latest add calendar
npx shadcn@latest add card
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add sonner  # for toast notifications
```

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_CALENDAR_ID=

# Email (if using Resend)
RESEND_API_KEY=
EMAIL_FROM_ADDRESS=

# Or Gmail (if using Gmail API)
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
```

## Next Steps

1. Start with Phase 1.1 - Set up Supabase and Google Cloud projects
2. Install all dependencies (Phase 1.2)
3. Design and create database schema (Phase 1.3)
4. Build UI components incrementally (Phase 2)
5. Connect to backend (Phase 3)
6. Add integrations (Phases 4-5)
7. Polish and deploy (Phases 6-7)
