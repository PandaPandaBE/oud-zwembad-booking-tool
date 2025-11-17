import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBooking } from "@/lib/api/bookings";

export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBooking(id),
    onSuccess: () => {
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
