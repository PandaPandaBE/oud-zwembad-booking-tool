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
          // If "full" (volledige faciliteit) is being checked, select all options
          if (value === "full" && checked) {
            const allValues = options.map((option) => option.value);
            field.onChange(allValues);
            return;
          }

          // If "full" is being unchecked, uncheck all options
          if (value === "full" && !checked) {
            field.onChange([]);
            return;
          }

          // Normal checkbox behavior for other options
          if (checked) {
            const newValues = [...selectedValues, value];
            // If all options are now selected, also ensure "full" is selected
            const allOptionValues = options.map((opt) => opt.value);
            const allSelected = allOptionValues.every((val) =>
              newValues.includes(val)
            );
            if (allSelected && !newValues.includes("full")) {
              newValues.push("full");
            }
            field.onChange(newValues);
          } else {
            const newValues = selectedValues.filter((v) => v !== value);
            // If an individual option is unchecked, also uncheck "full" if it was selected
            if (newValues.includes("full")) {
              field.onChange(newValues.filter((v) => v !== "full"));
            } else {
              field.onChange(newValues);
            }
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
