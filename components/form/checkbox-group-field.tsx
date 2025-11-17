import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "./form-field";
import type { LucideIcon } from "lucide-react";

export interface CheckboxOption {
  value: string;
  label: string;
}

export interface CheckboxGroupFieldProps {
  name: string;
  label: string;
  options: CheckboxOption[];
  required?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function CheckboxGroupField({
  name,
  label,
  options,
  required = false,
  icon,
  className,
}: CheckboxGroupFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedValues = (field.value || []) as string[];

        const handleChange = (value: string, checked: boolean) => {
          // Normal checkbox behavior
          if (checked) {
            const newValues = [...selectedValues, value];
            field.onChange(newValues);
          } else {
            const newValues = selectedValues.filter((v) => v !== value);
            field.onChange(newValues);
          }
        };

        return (
          <FormField
            label={label}
            error={error}
            required={required}
            icon={icon}
            className={className}
          >
            <div className="space-y-3 rounded-md border border-input p-4">
              {options.map((option) => {
                const isChecked = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`${name}-${option.value}`}
                      checked={isChecked}
                      onChange={(e) =>
                        handleChange(option.value, e.target.checked)
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    <Label
                      htmlFor={`${name}-${option.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </FormField>
        );
      }}
    />
  );
}
