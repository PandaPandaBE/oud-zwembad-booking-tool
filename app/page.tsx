"use client";

import { BookingForm } from "@/components/booking-form";
import { CalendarView } from "@/components/calendar-view";
import { GeneralInfo } from "@/components/general-info";
import { ReservationTypes } from "@/components/options-and-prices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Info, Package } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-background px-6 py-4">
        <h1 className="text-2xl font-bold">Oud Zwembad Reserveringssysteem</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane - Booking Form */}
        <aside className="w-full border-r border-border bg-background md:w-[600px] md:flex-shrink-0">
          <BookingForm />
        </aside>

        {/* Right Pane - Tabs */}
        <main className="flex-1 overflow-hidden bg-muted/30">
          <div className="h-full p-6">
            <Tabs defaultValue="calendar" className="flex h-full flex-col">
              <TabsList className="w-fit">
                <TabsTrigger value="calendar">
                  <Calendar className="mr-2 size-4" />
                  Kalender
                </TabsTrigger>
                <TabsTrigger value="reservation-types">
                  <Package className="mr-2 size-4" />
                  Opties & prijzen
                </TabsTrigger>
                <TabsTrigger value="general-info">
                  <Info className="mr-2 size-4" />
                  Algemene Info
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="calendar"
                className="mt-6 flex-1 overflow-auto"
              >
                <CalendarView />
              </TabsContent>

              <TabsContent
                value="reservation-types"
                className="mt-6 flex-1 overflow-auto"
              >
                <ReservationTypes />
              </TabsContent>

              <TabsContent
                value="general-info"
                className="mt-6 flex-1 overflow-auto"
              >
                <GeneralInfo />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
