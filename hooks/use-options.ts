import { useQuery } from "@tanstack/react-query";
import { getOptions } from "@/lib/api/options";
import type { Option } from "@/types/database";

export function useOptions() {
  return useQuery<Option[]>({
    queryKey: ["options"],
    queryFn: async () => {
      const response = await getOptions();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch options");
      }
      return response.data;
    },
  });
}
