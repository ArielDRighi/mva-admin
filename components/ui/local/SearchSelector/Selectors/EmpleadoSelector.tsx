"use client";

import { getEmployees, getEmployeeById } from "@/app/actions/empleados";
import { Empleado } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { SearchSelector } from "../SearchSelector";
import { Calendar, UserRound } from "lucide-react";

interface EmpleadoSelectorProps {
  value: number;
  onChange: (empleadoId: number) => void;
  label: string;
  name: string;
  error?: string;
  disabled?: boolean;
}

export function EmpleadoSelector({
  value,
  onChange,
  label,
  name,
  error,
  disabled = false,
}: EmpleadoSelectorProps) {
  const searchEmpleados = async (term: string) => {
    try {
      const result = await getEmployees(1, 5, term);
      return result.data || result.items || [];
    } catch (error) {
      console.error("Error al buscar empleados:", error);
      return [];
    }
  };

  return (
    <SearchSelector<Empleado>
      value={value}
      onChange={onChange}
      label={label}
      name={name}
      error={error}
      disabled={disabled}
      placeholder="Buscar por nombre o documento"
      searchFn={searchEmpleados}
      getItemById={(id) => getEmployeeById(id.toString())}
      minSearchLength={2}
      renderSelected={(empleado) => (
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium">
              {empleado.nombre} {empleado.apellido}{" "}
              <span className="text-gray-500">#{empleado.id}</span>
            </span>
            <span className="text-sm text-gray-500">
              {empleado.cargo} - {empleado.documento}
            </span>
          </div>
          <Badge
            variant={empleado.estado === "DISPONIBLE" ? "default" : "outline"}
          >
            {empleado.estado}
          </Badge>
        </div>
      )}
      renderItem={(empleado, handleSelect) => (
        <div
          key={empleado.id}
          className="p-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
          onClick={() => handleSelect(empleado)}
        >
          <div>
            <div className="font-medium flex items-center">
              <UserRound className="h-3.5 w-3.5 mr-1 text-gray-400" />
              {empleado.nombre} {empleado.apellido}{" "}
              <span className="ml-1 text-gray-500">#{empleado.id}</span>
            </div>
            <div className="text-sm text-gray-600">
              {empleado.cargo} - {empleado.documento}
            </div>
            <div className="text-xs text-gray-500 flex gap-2 mt-1">
              {empleado.fecha_contratacion && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Contratación:{" "}
                  {new Date(empleado.fecha_contratacion).toLocaleDateString(
                    "es-AR"
                  )}
                </span>
              )}
            </div>
          </div>
          <Badge
            variant={empleado.estado === "DISPONIBLE" ? "default" : "outline"}
          >
            {empleado.estado}
          </Badge>
        </div>
      )}
    />
  );
}
