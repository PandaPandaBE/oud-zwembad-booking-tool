import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "@/lib/api/bookings";

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });
}
