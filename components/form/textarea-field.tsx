import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";
import type { LucideIcon } from "lucide-react";

export interface TextareaFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  rows?: number;
  className?: string;
}

export function TextareaField({
  name,
  label,
  placeholder,
  required = false,
  icon,
  rows = 4,
  className,
}: TextareaFieldProps) {
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
          icon={icon}
          htmlFor={name}
          className={className}
        >
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            aria-invalid={fieldState.invalid}
          />
        </FormField>
      )}
    />
  );
}
