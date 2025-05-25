"use client";

import { getVehicles, getVehicleById } from "@/app/actions/vehiculos";
import { Vehiculo } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { SearchSelector } from "../SearchSelector";
import { Calendar, CheckCircle, Truck } from "lucide-react";
import { toast } from "sonner";

interface VehiculoSelectorProps {
  value: number;
  onChange: (vehiculoId: number) => void;
  label: string;
  name: string;
  error?: string;
  disabled?: boolean;
}

export function VehiculoSelector({
  value,
  onChange,
  label,
  name,
  error,
  disabled = false,
}: VehiculoSelectorProps) {
  // En VehiculoSelector.tsx
  const searchVehiculos = async (term: string) => {
    try {
      console.log("Buscando vehículos con término:", term);
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL); // Para depurar

      const result = await getVehicles();
      console.log("Resultado de búsqueda:", result);

      const filteredVehicles = (result.data || []).filter(
        (vehiculo: Vehiculo) => vehiculo.estado !== "EN_MANTENIMIENTO"
      );
      return filteredVehicles;
    } catch (error) {
      console.error("Error al buscar vehículos:", error);
      // Devolver array vacío en caso de error para evitar que se rompa la UI
      toast.error("No se pudieron cargar los vehículos", {
        description: "Intente nuevamente o contacte al administrador.",
      });
      return [];
    }
  };

  return (
    <SearchSelector<Vehiculo>
      value={value}
      onChange={onChange}
      label={label}
      name={name}
      error={error}
      disabled={disabled}
      placeholder="Buscar por placa o número interno"
      searchFn={searchVehiculos}
      getItemById={getVehicleById}
      minSearchLength={2}
      renderSelected={(vehiculo) => (
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium">
              {vehiculo.placa}{" "}
              {vehiculo.numeroInterno && `(#${vehiculo.numeroInterno})`}
            </span>
            <span className="text-sm text-gray-500">
              {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio}) -{" "}
              {vehiculo.tipoCabina}
            </span>
          </div>
          <Badge
            variant={vehiculo.estado === "DISPONIBLE" ? "default" : "outline"}
          >
            {vehiculo.estado}
          </Badge>
        </div>
      )}
      renderItem={(vehiculo, handleSelect) => (
        <div
          key={vehiculo.id}
          className="p-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
          onClick={() => handleSelect(vehiculo)}
        >
          <div>
            <div className="font-medium flex items-center">
              <Truck className="h-3.5 w-3.5 mr-1 text-gray-400" />
              {vehiculo.placa}{" "}
              {vehiculo.numeroInterno && `(#${vehiculo.numeroInterno})`}
            </div>
            <div className="text-sm text-gray-600">
              {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio}) -{" "}
              {vehiculo.tipoCabina}
            </div>
            {(vehiculo.fechaVencimientoVTV ||
              vehiculo.fechaVencimientoSeguro) && (
              <div className="text-xs text-gray-500 flex gap-2 mt-1">
                {vehiculo.fechaVencimientoVTV && (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    VTV:{" "}
                    {new Date(vehiculo.fechaVencimientoVTV).toLocaleDateString(
                      "es-AR"
                    )}
                  </span>
                )}
                {vehiculo.fechaVencimientoSeguro && (
                  <span className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Seguro:{" "}
                    {new Date(
                      vehiculo.fechaVencimientoSeguro
                    ).toLocaleDateString("es-AR")}
                  </span>
                )}
              </div>
            )}
          </div>
          <Badge
            variant={vehiculo.estado === "DISPONIBLE" ? "default" : "outline"}
          >
            {vehiculo.estado}
          </Badge>
        </div>
      )}
    />
  );
}
