import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingFormSchema, type BookingFormData } from "@/lib/validations";
import type { Booking, GetBookingsParams } from "@/types/booking";
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

// GET /api/bookings - Get all bookings with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingService = getBookingService();

    const params: { startDate?: string; endDate?: string } = {};
    if (searchParams.has("startDate")) {
      params.startDate = searchParams.get("startDate") || undefined;
    }
    if (searchParams.has("endDate")) {
      params.endDate = searchParams.get("endDate") || undefined;
    }

    const dbBookings = await bookingService.getBookings(params);

    // Transform the data
    const bookings: Booking[] = dbBookings.map((booking) => {
      const options =
        booking.booking_options?.map((bo) => bo.options).filter(Boolean) || [];
      return transformBooking(booking, options);
    });

    // Apply reservationType filter (filter by option IDs)
    if (searchParams.has("reservationType")) {
      const reservationTypes = searchParams.getAll("reservationType");
      const filteredBookings = bookings.filter((booking) =>
        booking.reservationType.some((type) => reservationTypes.includes(type))
      );
      return NextResponse.json(
        {
          success: true,
          data: filteredBookings,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: bookings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Er is een fout opgetreden bij het ophalen van reserveringen",
      },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = bookingFormSchema.parse(body);
    const bookingService = getBookingService();

    // Fetch selected options to calculate total price
    const options = await bookingService.getOptionsByIds(
      validatedData.reservationType
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

    // Create booking
    const dbBooking = await bookingService.createBooking(
      validatedData,
      options
    );

    // Transform to API format
    const optionsData =
      dbBooking.booking_options?.map((bo) => bo.options).filter(Boolean) || [];

    const transformedBooking = transformBooking(dbBooking, optionsData);

    // TODO: Create Google Calendar event
    // TODO: Send confirmation email

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Reservering succesvol aangemaakt",
        data: transformedBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);

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

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error: "Er is een fout opgetreden bij het aanmaken van de reservering",
      },
      { status: 500 }
    );
  }
}
