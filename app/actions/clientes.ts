"use server";

import { Cliente } from "@/types/types";
import { cookies } from "next/headers";

export async function getClients(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clients?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener clientes");

  return await res.json();
}

export async function editClient(id: string, data: Cliente) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const formData = new FormData();
  formData.append("nombre", data.nombre);
  formData.append("email", data.email);
  formData.append("cuit", data.cuit);
  formData.append("direccion", data.direccion);
  formData.append("telefono", data.telefono);
  formData.append("contacto_principal", data.contacto_principal);
  formData.append(
    "fecha_registro",
    new Date(data.fecha_registro).toISOString()
  );
  formData.append("estado", data.estado);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al editar el cliente");
  }

  return res.status;
}

export async function deleteClient(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al eliminar el cliente");
  }

  return res.status;
}
