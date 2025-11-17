import type {
  Booking,
  CreateBookingParams,
  CreateBookingResponse,
  GetBookingsParams,
  GetBookingsResponse,
  GetBookingByIdResponse,
  UpdateBookingParams,
  UpdateBookingResponse,
  DeleteBookingResponse,
} from "@/types/booking";

const API_BASE_URL = "/api/bookings";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Er is een fout opgetreden bij de API call");
  }
  return response.json();
}

export async function createBooking(
  params: CreateBookingParams
): Promise<CreateBookingResponse> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  return handleResponse<CreateBookingResponse>(response);
}

export async function getBookings(
  params?: GetBookingsParams
): Promise<GetBookingsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params?.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params?.reservationType && params.reservationType.length > 0) {
    params.reservationType.forEach((type) => {
      queryParams.append("reservationType", type);
    });
  }

  const url = queryParams.toString()
    ? `${API_BASE_URL}?${queryParams.toString()}`
    : API_BASE_URL;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<GetBookingsResponse>(response);
}

export async function getBookingById(
  id: string
): Promise<GetBookingByIdResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<GetBookingByIdResponse>(response);
}

export async function updateBooking(
  params: UpdateBookingParams
): Promise<UpdateBookingResponse> {
  const { id, ...updateData } = params;

  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  return handleResponse<UpdateBookingResponse>(response);
}

export async function deleteBooking(
  id: string
): Promise<DeleteBookingResponse> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<DeleteBookingResponse>(response);
}
