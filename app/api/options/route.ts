import { NextRequest, NextResponse } from "next/server";
import { getBookingService } from "@/lib/services/booking-service-factory";
import { logError, logInfo, createRequestContext } from "@/lib/utils/logger";

// GET /api/options - Get all active options
export async function GET(request: NextRequest) {
  const requestContext = createRequestContext({
    method: request.method,
    url: request.url,
  });

  try {
    logInfo("Fetching options", requestContext);
    const bookingService = getBookingService();
    const options = await bookingService.getAllOptions();

    logInfo("Successfully fetched options", {
      ...requestContext,
      count: options.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: options,
      },
      { status: 200 }
    );
  } catch (error) {
    logError("Failed to fetch options", error, {
      ...requestContext,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Er is een fout opgetreden bij het ophalen van opties",
      },
      { status: 500 }
    );
  }
}
