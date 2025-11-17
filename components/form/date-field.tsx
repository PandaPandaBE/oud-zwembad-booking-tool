import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export interface DateFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

export function DateField({
  name,
  label = "Datum",
  required = true,
  min,
  max,
  className,
}: DateFieldProps) {
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
          icon={Calendar}
          htmlFor={name}
          className={className}
        >
          <Input
            {...field}
            id={name}
            type="date"
            min={min}
            max={max}
            aria-invalid={fieldState.invalid}
            className={cn(fieldState.invalid && "border-destructive")}
          />
        </FormField>
      )}
    />
  );
}
