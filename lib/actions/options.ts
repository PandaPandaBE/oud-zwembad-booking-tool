"use server";

import { cache } from "react";
import { getBookingService } from "@/lib/services/booking-service-factory";
import { ok, err, type Result } from "@/lib/server-fetch";
import type { Option } from "@/types/database";

/**
 * Server action to fetch all active options.
 * Uses React's cache() to prevent duplicate requests during the same render.
 * Returns a Result type instead of throwing errors to avoid caching errors.
 */
export const getOptions = cache(async (): Promise<Result<Option[]>> => {
  try {
    const bookingService = getBookingService();
    const options = await bookingService.getAllOptions();
    return ok(options);
  } catch (error) {
    console.error("Error fetching options:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Er is een fout opgetreden bij het ophalen van opties";
    return err(message);
  }
});
