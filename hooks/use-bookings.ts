import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/lib/api/bookings";
import type { GetBookingsParams } from "@/types/booking";

export function useBookings(params?: GetBookingsParams) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: () => getBookings(params),
  });
}
