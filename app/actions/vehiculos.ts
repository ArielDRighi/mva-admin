"use server";

import { CreateVehiculo, UpdateVehiculo, VehiculoStatus } from "@/types/types";
import {
  createAuthHeaders,
  handleApiResponse,
  createServerAction,
} from "@/lib/actions";

/**
 * Función auxiliar para manejar errores en llamadas client-side
 */
async function handleClientError(res: Response, defaultMessage: string): Promise<never> {
  let errorMessage = defaultMessage;
  
  try {
    const errorData = await res.json();
    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.error) {
      errorMessage = errorData.error;
    }
  } catch (e) {
    // Si no se puede parsear como JSON, usar el texto
    try {
      const errorText = await res.text();
      if (errorText) {
        errorMessage = errorText.replace(/"/g, "");
      }
    } catch (textError) {
      console.error("Error reading response:", textError);
    }
  }
  
  throw new Error(errorMessage);
}

/**
 * Obtiene la lista de vehículos con paginación y búsqueda opcional
 * @param page Número de página
 * @param limit Límite de resultados por página
 * @param search Término de búsqueda opcional
 * @returns Lista paginada de vehículos
 */
export const getVehicles = createServerAction(
  async (page: number = 1, limit: number = 15, search: string = "") => {
    const headers = await createAuthHeaders();

    // Properly encode the search term to handle special characters
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles?page=${page}&limit=${limit}${searchQuery}`,
      {
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al obtener los vehículos");
  },
  "Error al obtener los vehículos"
);

/**
 * Obtiene un vehículo específico por su ID
 * @param id ID del vehículo
 * @returns Datos del vehículo
 */
export const getVehicleById = createServerAction(async (id: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener el vehículo");
}, "Error al obtener el vehículo");

/**
 * Obtiene un vehículo por su número de placa
 * @param placa Número de placa del vehículo
 * @returns Datos del vehículo
 */
export const getVehicleByPlaca = createServerAction(async (placa: string) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/placa/${placa}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener el vehículo por placa");
}, "Error al obtener el vehículo por placa");

/**
 * Edita la información de un vehículo existente (Client-side)
 * @param id ID del vehículo
 * @param data Datos de vehículo actualizados
 * @returns Estado de la respuesta
 */
export async function editVehicle(id: string, data: UpdateVehiculo): Promise<number> {
  const { createAuthHeaders } = await import("@/lib/actions");
  
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    await handleClientError(res, "Error al editar el vehículo");
  }

  return res.status;
}

/**
 * Elimina un vehículo del sistema (Client-side)
 * @param id ID del vehículo a eliminar
 * @returns Estado de la respuesta
 */
export async function deleteVehicle(id: number): Promise<number> {
  const { createAuthHeaders } = await import("@/lib/actions");
  
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    }
  );

  if (!res.ok) {
    await handleClientError(res, "No se pudo eliminar el vehículo");
  }

  return res.status;
}

/**
 * Crea un nuevo vehículo en el sistema (Client-side)
 * @param data Datos del nuevo vehículo
 * @returns Datos del vehículo creado
 */
export async function createVehicle(data: CreateVehiculo): Promise<any> {
  const { createAuthHeaders } = await import("@/lib/actions");
  
  const headers = await createAuthHeaders();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) {
    await handleClientError(res, "Error al crear el vehículo");
  }

  // Para respuesta exitosa
  if (res.status === 204) {
    return {};
  }

  return await res.json();
}

/**
 * Cambia el estado de un vehículo (ACTIVO, INACTIVO, MANTENIMIENTO, etc.)
 * @param id ID del vehículo
 * @param estado Nuevo estado del vehículo
 * @returns Estado de la respuesta
 */
export const changeVehicleStatus = createServerAction(
  async (id: number, estado: VehiculoStatus) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}/estado`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estado }),
        cache: "no-store",
      }
    );

    await handleApiResponse(res, "Error al cambiar el estado del vehículo");
    return res.status;
  },
  "Error al cambiar el estado del vehículo"
);

/**
 * Obtiene el total de vehículos en el sistema
 * @returns Información sobre el total de vehículos
 */
export const getTotalVehicles = createServerAction(async () => {
  const headers = await createAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/total_vehicles`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(response, "Error al obtener el total de vehículos");
}, "Error al obtener el total de vehículos");
