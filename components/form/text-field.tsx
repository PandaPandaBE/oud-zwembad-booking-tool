import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface TextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  type?: "text" | "password" | "search" | "url";
  className?: string;
}

export function TextField({
  name,
  label,
  placeholder,
  required = false,
  icon,
  type = "text",
  className,
}: TextFieldProps) {
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
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            className={cn(fieldState.invalid && "border-destructive")}
          />
        </FormField>
      )}
    />
  );
}
