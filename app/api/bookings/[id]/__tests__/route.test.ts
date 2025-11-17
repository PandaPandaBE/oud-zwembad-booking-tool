import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "../route";
import {
  setBookingService,
  resetBookingService,
} from "@/lib/services/booking-service-factory";
import type { BookingService } from "@/lib/services/booking-service";

// Mock booking service
const mockBookingService: BookingService = {
  getBookings: vi.fn(),
  getBookingById: vi.fn(),
  createBooking: vi.fn(),
  updateBooking: vi.fn(),
  deleteBooking: vi.fn(),
  getOptionsByIds: vi.fn(),
};

const mockBooking = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  reservation_date: "2024-01-15",
  status: "pending" as const,
  google_calendar_event_id: null,
  notes: "Test notes",
  total_price: 100,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  booking_options: [
    {
      option_id: "opt1",
      options: {
        id: "opt1",
        name: "Keuken",
        description: "Kitchen",
        price: 50,
        active: true,
        sort_order: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    },
  ],
};

describe("GET /api/bookings/[id]", () => {
  beforeEach(() => {
    resetBookingService();
    setBookingService(mockBookingService);
    vi.clearAllMocks();
  });

  it("should return a booking by id", async () => {
    vi.mocked(mockBookingService.getBookingById).mockResolvedValue(mockBooking);

    const request = new NextRequest("http://localhost:3000/api/bookings/1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("1");
    expect(data.data.name).toBe("John Doe");
    expect(mockBookingService.getBookingById).toHaveBeenCalledWith("1");
  });

  it("should return 404 if booking not found", async () => {
    vi.mocked(mockBookingService.getBookingById).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/bookings/999");
    const response = await GET(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Reservering niet gevonden");
  });

  it("should handle errors", async () => {
    vi.mocked(mockBookingService.getBookingById).mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/bookings/1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});

describe("PATCH /api/bookings/[id]", () => {
  beforeEach(() => {
    resetBookingService();
    setBookingService(mockBookingService);
    vi.clearAllMocks();
  });

  it("should update a booking", async () => {
    const updatedBooking = {
      ...mockBooking,
      name: "Jane Doe",
      updated_at: "2024-01-02T00:00:00Z",
    };

    vi.mocked(mockBookingService.getBookingById)
      .mockResolvedValueOnce(mockBooking) // Check exists
      .mockResolvedValueOnce(updatedBooking); // Return updated
    vi.mocked(mockBookingService.updateBooking).mockResolvedValue(
      updatedBooking
    );

    const request = new NextRequest("http://localhost:3000/api/bookings/1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Jane Doe" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Jane Doe");
    expect(mockBookingService.updateBooking).toHaveBeenCalledWith(
      "1",
      { name: "Jane Doe" },
      undefined
    );
  });

  it("should update booking with new options", async () => {
    const updatedBooking = {
      ...mockBooking,
      total_price: 150,
      booking_options: [
        {
          option_id: "opt2",
          options: {
            id: "opt2",
            name: "Grote zaal",
            description: "Large hall",
            price: 100,
            active: true,
            sort_order: 2,
            created_at: "2024-01-01T00:00:00Z",
            updated_at: "2024-01-01T00:00:00Z",
          },
        },
      ],
    };

    vi.mocked(mockBookingService.getBookingById)
      .mockResolvedValueOnce(mockBooking)
      .mockResolvedValueOnce(updatedBooking);
    vi.mocked(mockBookingService.getOptionsByIds).mockResolvedValue([
      { id: "opt2", price: 100 },
    ]);
    vi.mocked(mockBookingService.updateBooking).mockResolvedValue(
      updatedBooking
    );

    const request = new NextRequest("http://localhost:3000/api/bookings/1", {
      method: "PATCH",
      body: JSON.stringify({ reservationType: ["opt2"] }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.reservationType).toEqual(["opt2"]);
    expect(mockBookingService.getOptionsByIds).toHaveBeenCalledWith(["opt2"]);
  });

  it("should return 404 if booking not found", async () => {
    // Reset all mocks and set up fresh
    vi.mocked(mockBookingService.getBookingById).mockReset();
    vi.mocked(mockBookingService.getBookingById).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/bookings/999", {
      method: "PATCH",
      body: JSON.stringify({ name: "Jane Doe" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Reservering niet gevonden");
  });

  it("should validate request body", async () => {
    vi.mocked(mockBookingService.getBookingById).mockResolvedValue(mockBooking);

    const request = new NextRequest("http://localhost:3000/api/bookings/1", {
      method: "PATCH",
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Validatiefout");
  });
});

describe("DELETE /api/bookings/[id]", () => {
  beforeEach(() => {
    resetBookingService();
    setBookingService(mockBookingService);
    vi.clearAllMocks();
  });

  it("should delete a booking", async () => {
    vi.mocked(mockBookingService.getBookingById).mockResolvedValue(mockBooking);
    vi.mocked(mockBookingService.deleteBooking).mockResolvedValue();

    const request = new NextRequest("http://localhost:3000/api/bookings/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Reservering succesvol verwijderd");
    expect(mockBookingService.deleteBooking).toHaveBeenCalledWith("1");
  });

  it("should return 404 if booking not found", async () => {
    vi.mocked(mockBookingService.getBookingById).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/bookings/999", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Reservering niet gevonden");
  });

  it("should handle errors", async () => {
    vi.mocked(mockBookingService.getBookingById).mockResolvedValue(mockBooking);
    vi.mocked(mockBookingService.deleteBooking).mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/bookings/1", {
      method: "DELETE",
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
