"use client";

import { CreateVehiculo, UpdateVehiculo } from "@/types/types";

/**
 * Hook para manejar las acciones de vehículos desde el lado del cliente
 */
export function useVehicleActions() {
  /**
   * Función auxiliar para manejar errores en llamadas client-side
   */
  const handleClientError = async (res: Response, defaultMessage: string): Promise<never> => {
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
  };

  /**
   * Obtiene headers de autenticación para el cliente
   */
  const getClientAuthHeaders = async (): Promise<HeadersInit> => {
    const { getCookie } = await import("cookies-next");
    const token = getCookie("token") as string | undefined;

    if (!token) {
      throw new Error("Token no encontrado. Por favor, inicia sesión nuevamente.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  /**
   * Elimina un vehículo del sistema
   */
  const deleteVehicle = async (id: number): Promise<number> => {
    const headers = await getClientAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!res.ok) {
      await handleClientError(res, "No se pudo eliminar el vehículo");
    }

    return res.status;
  };

  /**
   * Edita la información de un vehículo existente
   */
  const editVehicle = async (id: string, data: UpdateVehiculo): Promise<number> => {
    const headers = await getClientAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      await handleClientError(res, "Error al editar el vehículo");
    }

    return res.status;
  };

  /**
   * Crea un nuevo vehículo en el sistema
   */
  const createVehicle = async (data: CreateVehiculo): Promise<any> => {
    const headers = await getClientAuthHeaders();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      await handleClientError(res, "Error al crear el vehículo");
    }

    // Para respuesta exitosa
    if (res.status === 204) {
      return {};
    }

    return await res.json();
  };

  return {
    deleteVehicle,
    editVehicle,
    createVehicle,
  };
}
