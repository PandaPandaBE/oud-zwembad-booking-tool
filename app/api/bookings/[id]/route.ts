import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingFormSchema } from "@/lib/validations";
import type { Booking } from "@/types/booking";
import { getBookingService } from "@/lib/services/booking-service-factory";
import { format } from "date-fns";

// Helper function to transform database booking to API booking format
function transformBooking(dbBooking: any, options: any[] = []): Booking {
  return {
    id: dbBooking.id,
    name: dbBooking.name,
    email: dbBooking.email,
    phone: dbBooking.phone,
    reservationType: options.map((opt) => opt.id),
    date: format(new Date(dbBooking.reservation_date), "yyyy-MM-dd"),
    startTime: "", // Not stored in DB yet, can be added later
    duration: "", // Not stored in DB yet, can be added later
    notes: dbBooking.notes || undefined,
    createdAt: dbBooking.created_at,
    updatedAt: dbBooking.updated_at,
  };
}

// GET /api/bookings/[id] - Get a single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingService = getBookingService();

    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    // Transform the data
    const options =
      booking.booking_options?.map((bo) => bo.options).filter(Boolean) || [];

    const transformedBooking = transformBooking(booking, options);

    return NextResponse.json(
      {
        success: true,
        data: transformedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching booking:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Er is een fout opgetreden bij het ophalen van de reservering",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] - Update a booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const bookingService = getBookingService();

    // Validate the request body (partial validation for updates)
    const updateData = bookingFormSchema.partial().parse(body);

    // Check if booking exists
    const existingBooking = await bookingService.getBookingById(id);
    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    // Handle reservationType (options) update
    let options: Array<{ id: string; price: number }> | undefined;
    if (updateData.reservationType !== undefined) {
      options = await bookingService.getOptionsByIds(
        updateData.reservationType
      );

      if (!options || options.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Geen geldige opties geselecteerd",
          },
          { status: 400 }
        );
      }
    }

    // Update booking
    const updatedBooking = await bookingService.updateBooking(
      id,
      updateData,
      options
    );

    // Transform to API format
    const optionsData =
      updatedBooking.booking_options?.map((bo) => bo.options).filter(Boolean) ||
      [];

    const transformedBooking = transformBooking(updatedBooking, optionsData);

    // TODO: Update Google Calendar event if date/time changed
    // TODO: Send update confirmation email

    return NextResponse.json(
      {
        success: true,
        message: "Reservering succesvol bijgewerkt",
        data: transformedBooking,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating booking:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validatiefout",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle "Booking not found" error from service
    if (error instanceof Error && error.message === "Booking not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Er is een fout opgetreden bij het bijwerken van de reservering",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingService = getBookingService();

    // Check if booking exists
    const existingBooking = await bookingService.getBookingById(id);
    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    // TODO: Delete Google Calendar event if exists
    // if (existingBooking.google_calendar_event_id) {
    //   await deleteGoogleCalendarEvent(existingBooking.google_calendar_event_id);
    // }

    // Delete booking (cascade will handle booking_options and emails)
    await bookingService.deleteBooking(id);

    // TODO: Send cancellation email
    // await sendCancellationEmail(existingBooking.email, existingBooking);

    return NextResponse.json(
      {
        success: true,
        message: "Reservering succesvol verwijderd",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting booking:", error);

    // Handle "Booking not found" error from service
    if (error instanceof Error && error.message === "Booking not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Er is een fout opgetreden bij het verwijderen van de reservering",
      },
      { status: 500 }
    );
  }
}
