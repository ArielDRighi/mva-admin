// components/FormField.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import React from "react";

type FieldType = "input" | "select";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  fieldType?: FieldType;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | { name: string; value: string }
  ) => void;
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  fieldType = "input",
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
}) => {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name} className="block font-medium">
        {label}
      </Label>

      {fieldType === "input" && (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}

      {fieldType === "select" && (
        <Select
          value={value}
          onValueChange={(selectedValue) =>
            onChange({ name, value: selectedValue })
          }
          required={required}
        >
          <SelectTrigger>
            <span>{value || placeholder || `Seleccionar ${label}`}</span>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
