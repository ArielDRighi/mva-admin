"use server";
import { cookies } from "next/headers";

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
  empleado?: {
    id: number;
    nombre: string;
    apellido: string;
    documento: string;
  };
};

export type EmpleadoConContactos = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  emergencyContacts: ContactoEmergencia[];
};

export async function getEmployeeEmergencyContacts(empleadoId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/${empleadoId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Error al obtener contactos");
    }

    const data = await response.json();
    console.log("Respuesta de API para contactos:", data);
    return data;
  } catch (error) {
    console.error("Error en getEmployeeEmergencyContacts:", error);
    throw error;
  }
}

export async function createEmployeeEmergencyContact(
  empleadoId: number,
  data: CreateContactDto
): Promise<ContactoEmergencia> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/${empleadoId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Error al crear el contacto de emergencia");
  }

  return response.json();
}

export async function updateEmployeeEmergencyContact(
  contactoId: number,
  data: UpdateContactDto
): Promise<ContactoEmergencia> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/modify/${contactoId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Error al actualizar el contacto de emergencia");
  }

  return response.json();
}

export async function deleteEmployeeEmergencyContact(contactoId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/delete/${contactoId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al eliminar el contacto de emergencia");
  }

  return response.json();
}
