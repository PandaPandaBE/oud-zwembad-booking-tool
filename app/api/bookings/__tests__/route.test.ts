import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import {
  setBookingService,
  resetBookingService,
} from "@/lib/services/booking-service-factory";
import type { BookingService } from "@/lib/services/booking-service";
import type { BookingFormData } from "@/lib/validations";

// Mock booking service
const mockBookingService: BookingService = {
  getBookings: vi.fn(),
  getBookingById: vi.fn(),
  createBooking: vi.fn(),
  updateBooking: vi.fn(),
  deleteBooking: vi.fn(),
  getOptionsByIds: vi.fn(),
};

describe("GET /api/bookings", () => {
  beforeEach(() => {
    resetBookingService();
    setBookingService(mockBookingService);
    vi.clearAllMocks();
  });

  it("should return all bookings", async () => {
    const mockBookings = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        reservation_date: "2024-01-15",
        status: "pending" as const,
        google_calendar_event_id: null,
        notes: null,
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
      },
    ];

    vi.mocked(mockBookingService.getBookings).mockResolvedValue(mockBookings);

    const request = new NextRequest("http://localhost:3000/api/bookings");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe("1");
    expect(data.data[0].reservationType).toEqual(["opt1"]);
    expect(mockBookingService.getBookings).toHaveBeenCalledWith({});
  });

  it("should filter bookings by date range", async () => {
    vi.mocked(mockBookingService.getBookings).mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:3000/api/bookings?startDate=2024-01-01&endDate=2024-01-31"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockBookingService.getBookings).toHaveBeenCalledWith({
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    });
  });

  it("should filter bookings by reservation type", async () => {
    const mockBookings = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        reservation_date: "2024-01-15",
        status: "pending" as const,
        google_calendar_event_id: null,
        notes: null,
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
      },
    ];

    vi.mocked(mockBookingService.getBookings).mockResolvedValue(mockBookings);

    const request = new NextRequest(
      "http://localhost:3000/api/bookings?reservationType=opt1"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(1);
  });

  it("should handle errors", async () => {
    vi.mocked(mockBookingService.getBookings).mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/bookings");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

describe("POST /api/bookings", () => {
  beforeEach(() => {
    resetBookingService();
    setBookingService(mockBookingService);
    vi.clearAllMocks();
  });

  it("should create a new booking", async () => {
    const bookingData: BookingFormData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      reservationType: ["opt1"],
      date: "2024-01-15",
      startTime: "10:00",
      duration: "2",
      notes: "Test notes",
    };

    const mockOptions = [{ id: "opt1", price: 50 }];
    const mockBooking = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      reservation_date: "2024-01-15",
      status: "pending" as const,
      google_calendar_event_id: null,
      notes: "Test notes",
      total_price: 50,
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

    vi.mocked(mockBookingService.getOptionsByIds).mockResolvedValue(
      mockOptions
    );
    vi.mocked(mockBookingService.createBooking).mockResolvedValue(mockBooking);

    const request = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Reservering succesvol aangemaakt");
    expect(data.data.id).toBe("1");
    expect(mockBookingService.getOptionsByIds).toHaveBeenCalledWith(["opt1"]);
    expect(mockBookingService.createBooking).toHaveBeenCalledWith(
      bookingData,
      mockOptions
    );
  });

  it("should return error if no valid options", async () => {
    vi.mocked(mockBookingService.getOptionsByIds).mockResolvedValue([]);

    const bookingData: BookingFormData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      reservationType: ["opt1"],
      date: "2024-01-15",
      startTime: "10:00",
      duration: "2",
    };

    const request = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Geen geldige opties geselecteerd");
  });

  it("should validate request body", async () => {
    const invalidData = {
      name: "J", // Too short
      email: "invalid-email",
    };

    const request = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Validatiefout");
    expect(data.details).toBeDefined();
  });

  it("should handle service errors", async () => {
    const bookingData: BookingFormData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      reservationType: ["opt1"],
      date: "2024-01-15",
      startTime: "10:00",
      duration: "2",
    };

    vi.mocked(mockBookingService.getOptionsByIds).mockResolvedValue([
      { id: "opt1", price: 50 },
    ]);
    vi.mocked(mockBookingService.createBooking).mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest("http://localhost:3000/api/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
