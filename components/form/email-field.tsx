import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

export interface EmailFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function EmailField({
  name,
  label = "E-mailadres",
  placeholder = "voorbeeld@email.com",
  required = true,
  className,
}: EmailFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

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
          icon={Mail}
          htmlFor={name}
          className={className}
        >
          <Input
            {...field}
            id={name}
            type="email"
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            className={cn(fieldState.invalid && "border-destructive")}
          />
        </FormField>
      )}
    />
  );
}
