import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FormField({
  label,
  error,
  required = false,
  icon: Icon,
  children,
  htmlFor,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {Icon && <Icon className="mr-2 inline size-4" />}
        {label}
        {required && " *"}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
