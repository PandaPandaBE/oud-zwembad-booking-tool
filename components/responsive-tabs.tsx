"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Info, Package, FileText } from "lucide-react";
import { BookingForm } from "@/components/booking-form";
import { CalendarView } from "@/components/calendar-view";
import { ReservationTypes } from "@/components/options-and-prices";
import { GeneralInfo } from "@/components/general-info";
import { Option } from "@/types/option";

interface ResponsiveTabsProps {
  options: Option[];
}

export function ResponsiveTabs({ options }: ResponsiveTabsProps) {
  const [value, setValue] = useState<"booking" | "calendar" | "reservation-types" | "general-info">("calendar");

  useEffect(() => {
    // Set initial value based on screen size after mount
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setValue("booking");
    }
  }, []);

  return (
    <Tabs
      value={value}
      onValueChange={(newValue) => setValue(newValue as typeof value)}
      className="flex min-h-full flex-col md:h-full"
    >
      <TabsList className="w-full md:w-fit">
        {/* Booking Form Tab (Mobile only) */}
        <TabsTrigger value="booking" className="flex-1 md:hidden">
          <FileText className="mr-2 size-4" />
          <span className="hidden sm:inline">Reservering</span>
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex-1 md:flex-initial">
          <Calendar className="mr-2 size-4" />
          <span className="hidden sm:inline">Kalender</span>
        </TabsTrigger>
        <TabsTrigger value="reservation-types" className="flex-1 md:flex-initial">
          <Package className="mr-2 size-4" />
          <span className="hidden sm:inline">Opties & prijzen</span>
        </TabsTrigger>
        <TabsTrigger value="general-info" className="flex-1 md:flex-initial">
          <Info className="mr-2 size-4" />
          <span className="hidden sm:inline">Informatie</span>
        </TabsTrigger>
      </TabsList>

      {/* Booking Form Tab Content (Mobile only) */}
      <TabsContent value="booking" className="mt-4 flex-1 overflow-auto md:hidden">
        <div className="rounded-lg border border-border bg-card p-4">
          <BookingForm options={options} />
        </div>
      </TabsContent>

      <TabsContent value="calendar" className="mt-4 flex-1 overflow-auto md:mt-6">
        <CalendarView />
      </TabsContent>

      <TabsContent value="reservation-types" className="mt-4 flex-1 overflow-auto md:mt-6">
        <ReservationTypes />
      </TabsContent>

      <TabsContent value="general-info" className="mt-4 flex-1 overflow-auto md:mt-6">
        <GeneralInfo />
      </TabsContent>
    </Tabs>
  );
}

