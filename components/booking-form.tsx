"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TextField,
  EmailField,
  PhoneField,
  DateField,
  SelectField,
  TextareaField,
  CheckboxGroupField,
} from "@/components/form";
import { bookingFormSchema, type BookingFormData } from "@/lib/validations";
import { useCreateBooking } from "@/hooks/use-create-booking";
import { useSelectedDate } from "@/app/providers";
import { Option } from "@/types/option";

const DURATION_OPTIONS = [
  { value: "1", label: "1 uur" },
  { value: "2", label: "2 uur" },
  { value: "3", label: "3 uur" },
  { value: "4", label: "4 uur" },
  { value: "6", label: "6 uur" },
  { value: "8", label: "8 uur" },
];

const TIME_SLOTS = [
  { value: "08:00", label: "08:00" },
  { value: "09:00", label: "09:00" },
  { value: "10:00", label: "10:00" },
  { value: "11:00", label: "11:00" },
  { value: "12:00", label: "12:00" },
  { value: "13:00", label: "13:00" },
  { value: "14:00", label: "14:00" },
  { value: "15:00", label: "15:00" },
  { value: "16:00", label: "16:00" },
  { value: "17:00", label: "17:00" },
  { value: "18:00", label: "18:00" },
  { value: "19:00", label: "19:00" },
  { value: "20:00", label: "20:00" },
  { value: "21:00", label: "21:00" },
  { value: "22:00", label: "22:00" },
];

type BookingFormProps = {
  options: Option[];
};

export function BookingForm({ options }: BookingFormProps) {
  const createBookingMutation = useCreateBooking();
  const { setSelectedDate } = useSelectedDate();

  const methods = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      reservationType: [],
    },
  });

  const { handleSubmit, reset, control } = methods;

  // Watch the date field and update the context when it changes
  const selectedDateValue = useWatch({
    control,
    name: "date",
  });

  useEffect(() => {
    if (selectedDateValue) {
      // Parse the date string (YYYY-MM-DD) and set it in context
      const date = new Date(selectedDateValue + "T00:00:00");
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    } else {
      setSelectedDate(null);
    }
  }, [selectedDateValue, setSelectedDate]);

  // Transform options from database to form format
  const reservationTypeOptions =
    options?.map((option) => ({
      value: option.id, // Use UUID as value
      label: option.name, // Use name as label
    })) || [];

  const onSubmit = async (data: BookingFormData) => {
    createBookingMutation.mutate(data, {
      onSuccess: () => {
        // Reset form after successful submission
        reset();
        // TODO: Show success message/toast
        alert("Reservering succesvol aangemaakt!");
      },
      onError: (error) => {
        console.error("Error creating booking:", error);
        // TODO: Show error message/toast
        alert(
          error.message || "Er is een fout opgetreden. Probeer het opnieuw."
        );
      },
    });
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex min-h-full flex-col md:h-full">
      <div className="border-b border-border p-4 md:p-6">
        <h2 className="text-xl font-semibold md:text-2xl">Reservering Maken</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Vul het formulier in om een reservering te maken
        </p>
      </div>
      <div className="flex-1 p-4 md:p-6">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TextField
              name="name"
              label="Naam"
              placeholder="Volledige naam"
              required
              icon={User}
            />

            <EmailField name="email" />

            <PhoneField name="phone" />

            <CheckboxGroupField
              name="reservationType"
              label="Reserveringstype"
              options={reservationTypeOptions}
              required
              icon={Calendar}
            />

            <DateField name="date" min={today} />

            <SelectField
              name="startTime"
              label="Starttijd"
              options={TIME_SLOTS}
              placeholder="Selecteer een tijd"
              required
              icon={Clock}
            />

            <SelectField
              name="duration"
              label="Duur"
              options={DURATION_OPTIONS}
              placeholder="Selecteer een duur"
              required
              icon={Clock}
            />

            <TextareaField
              name="notes"
              label="Opmerkingen"
              placeholder="Optionele opmerkingen of speciale verzoeken..."
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending
                ? "Bezig met verzenden..."
                : "Reservering Maken"}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
