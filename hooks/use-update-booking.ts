import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBooking } from "@/lib/api/bookings";
import type { UpdateBookingParams } from "@/types/booking";

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateBookingParams) => updateBooking(params),
    onSuccess: (data) => {
      // Invalidate bookings list and specific booking
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", data.data.id],
      });
    },
  });
}
