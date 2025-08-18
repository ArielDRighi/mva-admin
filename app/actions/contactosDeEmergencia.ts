"use server";

import {
  createAuthHeaders,
  handleApiResponse,
  createServerAction,
} from "@/lib/actions";

export interface CreateContactDto {
  nombre: string;
  apellido: string;
  parentesco: string;
  telefono: string;
}

export interface UpdateContactDto {
  nombre?: string;
  apellido?: string;
  parentesco?: string;
  telefono?: string;
}

export type ContactoEmergencia = {
  id: number;
  nombre: string;
  apellido: string;
  parentesco: string;
  telefono: string;
};

/**
 * Crea un nuevo contacto de emergencia para un empleado
 */
export const createMyEmergencyContact = createServerAction(
  async (empleadoId: number, data: CreateContactDto) => {
    const headers = await createAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/${empleadoId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      }
    );

    return handleApiResponse(
      response,
      "Error al crear el contacto de emergencia",
      {
        file: "app/actions/contactosDeEmergencia.ts",
        endpoint: `/api/employees/emergency/${empleadoId}`,
        method: "POST",
      }
    );
  },
  "Error al crear el contacto de emergencia",
  {
    file: "app/actions/contactosDeEmergencia.ts",
    endpoint: "/api/employees/emergency/:id",
    method: "POST",
  }
);

/**
 * Obtiene todos los contactos de emergencia de un empleado
 */
export const getMyEmergencyContacts = createServerAction(
  async (employeeId: number) => {
    const headers = await createAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/${employeeId}`,
      {
        headers,
      }
    );

    return handleApiResponse(
      response,
      "Error al obtener los contactos de emergencia",
      {
        file: "app/actions/contactosDeEmergencia.ts",
        endpoint: `/api/employees/emergency/${employeeId}`,
        method: "GET",
      }
    );
  },
  "Error al obtener los contactos de emergencia",
  {
    file: "app/actions/contactosDeEmergencia.ts",
    endpoint: "/api/employees/emergency/:id",
    method: "GET",
  }
);

/**
 * Elimina un contacto de emergencia
 */
export const deleteMyEmergencyContact = createServerAction(
  async (contactoId: number) => {
    const headers = await createAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/delete/${contactoId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    return handleApiResponse(
      response,
      "Error al eliminar el contacto de emergencia",
      {
        file: "app/actions/contactosDeEmergencia.ts",
        endpoint: `/api/employees/emergency/delete/${contactoId}`,
        method: "DELETE",
      }
    );
  },
  "Error al eliminar el contacto de emergencia",
  {
    file: "app/actions/contactosDeEmergencia.ts",
    endpoint: "/api/employees/emergency/delete/:id",
    method: "DELETE",
  }
);

/**
 * Actualiza un contacto de emergencia
 */
export const updateMyEmergencyContact = createServerAction(
  async (contactoId: number, data: UpdateContactDto) => {
    const headers = await createAuthHeaders();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/modify/${contactoId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      }
    );

    return handleApiResponse(
      response,
      "Error al actualizar el contacto de emergencia",
      {
        file: "app/actions/contactosDeEmergencia.ts",
        endpoint: `/api/employees/emergency/modify/${contactoId}`,
        method: "PUT",
      }
    );
  },
  "Error al actualizar el contacto de emergencia",
  {
    file: "app/actions/contactosDeEmergencia.ts",
    endpoint: "/api/employees/emergency/modify/:id",
    method: "PUT",
  }
);
