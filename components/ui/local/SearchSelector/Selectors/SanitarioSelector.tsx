"use client";

import { getToiletsList } from "@/app/actions/sanitarios";
import { Sanitario } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { SearchSelector } from "../SearchSelector";
import { Bath, CalendarClock, Hash } from "lucide-react";

interface SanitarioSelectorProps {
  value: number;
  onChange: (sanitarioId: number) => void;
  label: string;
  name: string;
  error?: string;
  disabled?: boolean;
}

export function SanitarioSelector({
  value,
  onChange,
  label,
  name,
  error,
  disabled = false,
}: SanitarioSelectorProps) {
  const searchSanitarios = async (term: string) => {
    try {
      const allToilets = await getToiletsList();

      const filteredSanitarios = allToilets.filter((sanitario: Sanitario) => {
        const validState =
          sanitario.estado !== "EN_MANTENIMIENTO" &&
          sanitario.estado !== "BAJA";

        if (!term || term.length < 2) return validState;

        const matchesTerm =
          sanitario.codigo_interno
            ?.toLowerCase()
            .includes(term.toLowerCase()) ||
          sanitario.modelo?.toLowerCase().includes(term.toLowerCase());

        return validState && matchesTerm;
      });

      const mappedSanitarios = filteredSanitarios.map(
        (sanitario: Sanitario) => ({
          ...sanitario,
          id: parseInt(sanitario.baño_id || "0"),
        })
      );

      return mappedSanitarios;
    } catch (error) {
      console.error("Error al buscar sanitarios:", error);
      return [];
    }
  };
  const getSanitarioById = async (id: number) => {
    try {
      const allToilets = await getToiletsList();

      const sanitario = allToilets.find(
        (s: Sanitario) => parseInt(s.baño_id || "0") === id
      );

      if (!sanitario) {
        return {
          baño_id: id.toString(),
          codigo_interno: `ID: ${id}`,
          modelo: "Desconocido",
          fecha_adquisicion: new Date().toISOString(),
          estado: "DISPONIBLE",
          id: id,
        };
      }

      return {
        ...sanitario,
        id: parseInt(sanitario.baño_id || "0"),
      };
    } catch (error) {
      console.error(`Error al cargar el sanitario con ID ${id}:`, error);
      return {
        baño_id: id.toString(),
        codigo_interno: `ID: ${id}`,
        modelo: "Error al cargar",
        fecha_adquisicion: new Date().toISOString(),
        estado: "DISPONIBLE",
        id: id,
      };
    }
  };
  return (
    <SearchSelector<Sanitario & { id: number }>
      value={value}
      onChange={onChange}
      label={label}
      name={name}
      error={error}
      disabled={disabled}
      placeholder="Buscar por código interno"
      searchFn={searchSanitarios}
      getItemById={getSanitarioById}
      minSearchLength={2}
      renderSelected={(sanitario) => (
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium">
              {sanitario.codigo_interno && `#${sanitario.codigo_interno}`}
            </span>
            <span className="text-sm text-gray-500">
              {sanitario.modelo} - Adquirido:{" "}
              {new Date(sanitario.fecha_adquisicion).toLocaleDateString(
                "es-AR"
              )}
            </span>
          </div>
          <Badge
            variant={sanitario.estado === "DISPONIBLE" ? "default" : "outline"}
          >
            {sanitario.estado}
          </Badge>
        </div>
      )}
      renderItem={(sanitario, handleSelect) => (
        <div
          key={sanitario.id}
          className="p-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
          onClick={() => handleSelect(sanitario)}
        >
          <div>
            <div className="font-medium flex items-center">
              <Bath className="h-3.5 w-3.5 mr-1 text-gray-400" />
              <span className="flex items-center">
                <Hash className="h-3 w-3 mr-1" />
                {sanitario.codigo_interno}
              </span>
            </div>
            <div className="text-sm text-gray-600">{sanitario.modelo}</div>
            <div className="text-xs text-gray-500 flex gap-2 mt-1">
              <span className="flex items-center">
                <CalendarClock className="h-3 w-3 mr-1" />
                Adquirido:{" "}
                {new Date(sanitario.fecha_adquisicion).toLocaleDateString(
                  "es-AR"
                )}
              </span>
            </div>
          </div>
          <Badge
            variant={sanitario.estado === "DISPONIBLE" ? "default" : "outline"}
          >
            {sanitario.estado}
          </Badge>
        </div>
      )}
    />
  );
}
