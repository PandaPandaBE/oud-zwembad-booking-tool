import { createServerClient } from "@/lib/supabase/server";
import { SupabaseBookingService, type BookingService } from "./booking-service";

let serviceInstance: BookingService | null = null;

/**
 * Factory function to get a BookingService instance
 * This allows for dependency injection in tests
 */
export function getBookingService(): BookingService {
  if (serviceInstance) {
    return serviceInstance;
  }

  const supabase = createServerClient();
  serviceInstance = new SupabaseBookingService(supabase);
  return serviceInstance;
}

/**
 * Set a custom service instance (useful for testing)
 */
export function setBookingService(service: BookingService): void {
  serviceInstance = service;
}

/**
 * Reset the service instance (useful for testing)
 */
export function resetBookingService(): void {
  serviceInstance = null;
}
