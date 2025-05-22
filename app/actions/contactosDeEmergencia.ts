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
};

export async function createMyEmergencyContact(
  empleadoId: number,
  data: CreateContactDto
) {
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
}

export async function getMyEmergencyContacts(employeeId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/emergency/${employeeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Error al obtener los contactos de emergencia");
  }
  return response.json();
}

export async function deleteMyEmergencyContact(contactoId: number) {
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
  return await response.json();
}

export async function updateMyEmergencyContact(
  contactoId: number,
  data: UpdateContactDto
) {
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
}
