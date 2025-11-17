import type { Option } from "@/types/database";
import { handleResponse } from "./utils";

const API_BASE_URL = "/api/options";

export interface GetOptionsResponse {
  success: boolean;
  data: Option[];
  error?: string;
}

export async function getOptions(): Promise<GetOptionsResponse> {
  const response = await fetch(API_BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<GetOptionsResponse>(response);
}
