"use client";

import { getVehicles, getVehicleById } from "@/app/actions/vehiculos";
import { Vehiculo } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { SearchSelector } from "../SearchSelector";

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
  // Función que busca vehículos con la API existente
  const searchVehiculos = async (term: string) => {
    try {
      const result = await getVehicles(1, 5, term);
      return result.data || [];
    } catch (error) {
      console.error("Error al buscar vehículos:", error);
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
      placeholder="Buscar por placa del vehículo"
      searchFn={searchVehiculos}
      getItemById={getVehicleById}
      minSearchLength={2}
      renderSelected={(vehiculo) => (
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium">{vehiculo.placa}</span>
            <span className="text-sm text-gray-500">
              {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
            </span>
          </div>
          <Badge variant={vehiculo.estado === "DISPONIBLE" ? "default" : "outline"}>
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
            <div className="font-medium">{vehiculo.placa}</div>
            <div className="text-sm text-gray-600">
              {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
            </div>
          </div>
          <Badge variant={vehiculo.estado === "DISPONIBLE" ? "default" : "outline"}>
            {vehiculo.estado}
          </Badge>
        </div>
      )}
    />
  );
}