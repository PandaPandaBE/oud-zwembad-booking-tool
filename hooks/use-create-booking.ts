import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking } from "@/lib/api/bookings";
import type { CreateBookingParams } from "@/types/booking";

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateBookingParams) => createBooking(params),
    onSuccess: () => {
      // Invalidate and refetch bookings list if it exists
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
