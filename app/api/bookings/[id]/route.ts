import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingFormSchema } from "@/lib/validations";
import type { Booking } from "@/types/booking";
import { getBookingService } from "@/lib/services/booking-service-factory";
import { format } from "date-fns";
import {
  logError,
  logInfo,
  logWarn,
  createRequestContext,
} from "@/lib/utils/logger";

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
  const { id } = await params;
  const requestContext = createRequestContext({
    method: request.method,
    url: request.url,
    params: { id },
  });

  try {
    logInfo("Fetching booking by ID", requestContext);
    const bookingService = getBookingService();

    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      logWarn("Booking not found", requestContext);
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    logInfo("Successfully fetched booking", {
      ...requestContext,
      bookingId: booking.id,
    });

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
    logError("Failed to fetch booking by ID", error, {
      ...requestContext,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

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
  const { id } = await params;
  const requestContext = createRequestContext({
    method: request.method,
    url: request.url,
    params: { id },
  });

  try {
    let body;
    try {
      body = await request.json();
      requestContext.requestBody = body;
    } catch (error) {
      logError("Failed to parse request JSON", error, requestContext);
      return NextResponse.json(
        {
          success: false,
          error: "Ongeldige JSON in request body",
        },
        { status: 400 }
      );
    }

    const bookingService = getBookingService();

    // Validate the request body (partial validation for updates)
    let updateData;
    try {
      updateData = bookingFormSchema.partial().parse(body);
    } catch (error) {
      logError("Validation failed for booking update", error, {
        ...requestContext,
        validationError: error instanceof z.ZodError ? error.issues : undefined,
      });
      throw error; // Re-throw to be caught by outer catch
    }

    logInfo("Updating booking", {
      ...requestContext,
      updateFields: Object.keys(updateData),
    });

    // Check if booking exists
    const existingBooking = await bookingService.getBookingById(id);
    if (!existingBooking) {
      logWarn("Booking not found for update", requestContext);
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
        logWarn("No valid options found for booking update", {
          ...requestContext,
          requestedOptionIds: updateData.reservationType,
        });
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

    logInfo("Booking updated successfully", {
      ...requestContext,
      bookingId: updatedBooking.id,
    });

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
    // Handle validation errors
    if (error instanceof z.ZodError) {
      logError("Booking update validation error", error, {
        ...requestContext,
        validationIssues: error.issues,
        errorType: "ZodError",
      });
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
      logWarn("Booking not found during update", {
        ...requestContext,
        errorMessage: error.message,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    logError("Failed to update booking", error, {
      ...requestContext,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

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
  const { id } = await params;
  const requestContext = createRequestContext({
    method: request.method,
    url: request.url,
    params: { id },
  });

  try {
    logInfo("Deleting booking", requestContext);
    const bookingService = getBookingService();

    // Check if booking exists
    const existingBooking = await bookingService.getBookingById(id);
    if (!existingBooking) {
      logWarn("Booking not found for deletion", requestContext);
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

    logInfo("Booking deleted successfully", {
      ...requestContext,
      bookingId: id,
    });

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
    // Handle "Booking not found" error from service
    if (error instanceof Error && error.message === "Booking not found") {
      logWarn("Booking not found during deletion", {
        ...requestContext,
        errorMessage: error.message,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Reservering niet gevonden",
        },
        { status: 404 }
      );
    }

    logError("Failed to delete booking", error, {
      ...requestContext,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

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
