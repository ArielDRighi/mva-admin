"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CustomDatePickerProps {
  date?: Date | null;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showTimeSelect?: boolean;
  format?: string;
  minDate?: Date;
}

export function CustomDatePicker({
  date,
  onChange,
  disabled,
  placeholder = "Seleccionar fecha",
  className = "",
  showTimeSelect = false,
  format: dateFormat = "yyyy-MM-dd",
  minDate,
}: CustomDatePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(date || undefined);
  const [time, setTime] = useState<string>("00:00");

  // Sincronizar el estado local con las props
  useEffect(() => {
    if (date) {
      setSelected(date);
      // Si hay una fecha y showTimeSelect está habilitado, extraer la hora y minutos
      if (showTimeSelect && date) {
        setTime(`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`);
      }
    } else {
      setSelected(undefined);
    }
  }, [date, showTimeSelect]);

  // Manejar cambios de fecha
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const dateWithTime = new Date(newDate);
      
      if (showTimeSelect) {
        const [hours, minutes] = time.split(":").map(Number);
        dateWithTime.setHours(hours, minutes);
      }
      
      setSelected(dateWithTime);
      if (onChange) onChange(dateWithTime);
    } else {
      setSelected(undefined);
      if (onChange) onChange(null);
    }
  };

  // Manejar cambios de hora
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    
    if (selected) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(selected);
      newDate.setHours(hours, minutes);
      
      setSelected(newDate);
      if (onChange) onChange(newDate);
    }
  };

  // Crear un array de fechas deshabilitadas antes de minDate
  const disabledDays = minDate ? [{ before: minDate }] : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left ${className}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, dateFormat, { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="center">
        <div className="p-3">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDateChange}
            locale={es}
            disabled={disabledDays}
            fromMonth={minDate}
          />
          
          {showTimeSelect && (
            <div className="px-3 pb-3">
              <label className="block text-sm font-medium mb-1">Hora</label>
              <input 
                type="time" 
                value={time}
                onChange={handleTimeChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}