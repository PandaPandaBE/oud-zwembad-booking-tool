import { parse, startOfDay, endOfDay, addHours } from "date-fns";
import type { Event } from "react-big-calendar";
import type { Booking } from "@/types/booking";

/**
 * Calendar event with booking resource attached
 */
export interface CalendarEvent extends Event {
  id?: string;
  resource?: Booking;
}

/**
 * Transforms a booking into a calendar event.
 * If startTime and duration are provided, creates a timed event.
 * Otherwise, creates an all-day event.
 *
 * @param booking - The booking to transform
 * @returns A calendar event object
 */
export function bookingToCalendarEvent(booking: Booking): CalendarEvent {
  const bookingDate = parse(booking.date, "yyyy-MM-dd", new Date());

  // If startTime and duration are provided, create a timed event
  if (booking.startTime && booking.duration) {
    const [hours, minutes] = booking.startTime.split(":").map(Number);
    const start = new Date(bookingDate);
    start.setHours(hours, minutes, 0, 0);

    const durationHours = parseFloat(booking.duration);
    const end = addHours(start, durationHours);

    return {
      id: booking.id,
      title: `${booking.name}${
        booking.reservationType.length > 0
          ? ` - ${booking.reservationType.length} optie(s)`
          : ""
      }`,
      start,
      end,
      resource: booking,
    };
  }

  // Otherwise, show as all-day event
  return {
    id: booking.id,
    title: `${booking.name}${
      booking.reservationType.length > 0
        ? ` - ${booking.reservationType.length} optie(s)`
        : ""
    }`,
    start: startOfDay(bookingDate),
    end: endOfDay(bookingDate),
    allDay: true,
    resource: booking,
  };
}

/**
 * Transforms an array of bookings into calendar events.
 *
 * @param bookings - Array of bookings to transform
 * @returns Array of calendar events
 */
export function bookingsToCalendarEvents(bookings: Booking[]): CalendarEvent[] {
  return bookings.map(bookingToCalendarEvent);
}
