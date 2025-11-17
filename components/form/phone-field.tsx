import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { cn } from "@/lib/utils";
import { Phone } from "lucide-react";

export interface PhoneFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function PhoneField({
  name,
  label = "Telefoonnummer",
  placeholder = "0612345678",
  required = true,
  className,
}: PhoneFieldProps) {
  const { control, formState: { errors } } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          error={error}
          required={required}
          icon={Phone}
          htmlFor={name}
          className={className}
        >
          <Input
            {...field}
            id={name}
            type="tel"
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            className={cn(fieldState.invalid && "border-destructive")}
          />
        </FormField>
      )}
    />
  );
}
