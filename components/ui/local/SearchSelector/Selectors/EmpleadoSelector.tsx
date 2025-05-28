"use client";

import { getEmployees, getEmployeeById } from "@/app/actions/empleados";
import { Empleado } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { SearchSelector } from "../SearchSelector";
import { Calendar, UserRound } from "lucide-react";
import { toast } from "sonner";

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
}: EmpleadoSelectorProps) {  const searchEmpleados = async (term: string) => {
    try {
      console.log("Buscando empleados con término:", term);
      
      // Ahora obtenemos 15 resultados en lugar de 5 para mostrar más opciones 
      const result = await getEmployees(1, 15, term);
      
      // Añadimos una validación de tipo para asegurar que result tenga la estructura esperada
      if (result && typeof result === 'object') {
        // Definir tipos específicos en lugar de usar any
        type EmpleadosResponse = { 
          data?: Empleado[]; 
          items?: Empleado[];
        };
        
        // Intentamos acceder a data o items con verificación de tipo
        const typedResult = (result as unknown) as EmpleadosResponse;
        const items = typedResult.data || typedResult.items || [];
        
        // Filtrar solo empleados disponibles (no en licencia, de baja, etc.)
        const filteredItems = items.filter(emp => 
          emp.estado === "DISPONIBLE" || emp.estado === "ASIGNADO"
        );
        
        console.log("Empleados filtrados:", filteredItems.length);
        return filteredItems;
      }
      return [];
    } catch (error) {
      console.error("Error al buscar empleados:", error);
      
      // Extraer el mensaje de error para mostrar información más precisa
      let errorMessage = "Intente nuevamente o contacte al administrador.";
      
      // Si es un error con mensaje personalizado, lo usamos
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      // Mostrar toast con el error
      toast.error("No se pudieron cargar los empleados", {
        description: errorMessage,
        duration: 5000, // Duración aumentada para mejor visibilidad
      });
      
      return [];
    }
  };const getEmpleadoById = async (id: number): Promise<Empleado> => {
    try {
      const empleado = await getEmployeeById(id.toString());
      return empleado as Empleado;
    } catch (error) {
      console.error(`Error al cargar el empleado con ID ${id}:`, error);
      
      // Extraer el mensaje de error para mostrar información más precisa
      let errorMessage = `No se pudo cargar el empleado con ID ${id}`;
      
      // Si es un error con mensaje personalizado, lo usamos
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      // Mostrar toast con el error
      toast.error("Error al cargar empleado", {
        description: errorMessage,
        duration: 5000, // Duración aumentada para mejor visibilidad
      });
      
      // Devolvemos un objeto empleado con datos mínimos para evitar errores en la UI
      return {
        id: id,
        nombre: "Error al cargar",
        apellido: "",
        documento: `ID: ${id}`,
        cargo: "No disponible",
        estado: "NO_DISPONIBLE",
        fecha_contratacion: new Date().toISOString(),
        telefono: "",
        email: "",
        cuil: "",
        cbu: "",
        numero_legajo: 0
      };
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
      getItemById={getEmpleadoById}
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
