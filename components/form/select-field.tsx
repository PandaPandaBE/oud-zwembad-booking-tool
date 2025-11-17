import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Select } from "@/components/ui/select";
import { FormField } from "./form-field";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function SelectField({
  name,
  label,
  options,
  placeholder = "Selecteer een optie",
  required = false,
  icon,
  className,
}: SelectFieldProps) {
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
          <Select
            {...field}
            id={name}
            aria-invalid={fieldState.invalid}
            className={cn(fieldState.invalid && "border-destructive")}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      )}
    />
  );
}
