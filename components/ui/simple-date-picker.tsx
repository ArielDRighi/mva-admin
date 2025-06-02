"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleCalendar } from "@/components/ui/simple-calendar";

export interface SimpleDatePickerProps {
  date?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  format?: string;
  calendarClassName?: string;
}

export function SimpleDatePicker({
  date,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
  format: dateFormat = "PPP",
  calendarClassName,
}: SimpleDatePickerProps) {
  const handleSelect = (selectedDate: Date | { from: Date; to?: Date } | undefined) => {
    if (selectedDate && onChange) {
      if (selectedDate instanceof Date) {
        onChange(selectedDate);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <SimpleCalendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className={calendarClassName}
        />
      </PopoverContent>
    </Popover>
  );
}
