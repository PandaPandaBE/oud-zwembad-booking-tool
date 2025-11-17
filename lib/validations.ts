import { z } from "zod";

export const bookingFormSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 tekens bevatten"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().min(10, "Telefoonnummer moet minimaal 10 tekens bevatten"),
  reservationType: z
    .array(z.string().uuid("Ongeldig reserveringstype"))
    .min(1, "Selecteer minimaal één reserveringstype"),
  date: z.string().min(1, "Selecteer een datum"),
  startTime: z.string().min(1, "Selecteer een starttijd"),
  duration: z.string().min(1, "Selecteer een duur"),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;
