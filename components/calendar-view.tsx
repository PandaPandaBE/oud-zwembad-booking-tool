"use client";

import { useMemo, useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { nl } from "date-fns/locale";
import { useBookings } from "@/hooks/use-bookings";
import {
  bookingsToCalendarEvents,
  type CalendarEvent,
} from "@/lib/utils/calendar";
import { useSelectedDate } from "@/app/providers";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Create a date-fns localizer for react-big-calendar
const locales = {
  nl: nl,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: nl }),
  getDay,
  locales,
});

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>("month");
  const { data, isLoading, error } = useBookings();
  const { selectedDate } = useSelectedDate();

  // Navigate calendar to selected date when it changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  // Transform bookings into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!data?.success || !data.data) return [];

    return bookingsToCalendarEvents(data.data);
  }, [data]);

  const handleSelectEvent = (event: CalendarEvent) => {
    const booking = event.resource;
    if (booking) {
      // You can add a modal or tooltip here to show booking details
      console.log("Selected booking:", booking);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Kalender</h3>
          <p className="text-sm text-muted-foreground">
            Bekijk beschikbare en gereserveerde datums
          </p>
        </div>
        <div className="flex h-[600px] items-center justify-center rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Kalender</h3>
          <p className="text-sm text-muted-foreground">
            Bekijk beschikbare en gereserveerde datums
          </p>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Fout bij het laden van reserveringen. Probeer het later opnieuw.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Kalender</h3>
        <p className="text-sm text-muted-foreground">
          Bekijk beschikbare en gereserveerde datums
        </p>
      </div>
      <div className="h-[400px] rounded-lg border border-border bg-card p-2 sm:h-[500px] sm:p-4 md:h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          date={currentDate}
          onNavigate={setCurrentDate}
          view={view}
          onView={setView}
          culture="nl"
          messages={{
            next: "Volgende",
            previous: "Vorige",
            today: "Vandaag",
            month: "Maand",
            week: "Week",
            day: "Dag",
            agenda: "Agenda",
            date: "Datum",
            time: "Tijd",
            event: "Reservering",
            noEventsInRange: "Geen reserveringen in dit bereik",
          }}
          className="rbc-calendar"
          popup
          popupOffset={{ x: 10, y: 10 }}
        />
      </div>
    </div>
  );
}
