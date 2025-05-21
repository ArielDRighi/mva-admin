"use server";

import { MantenimientoSanitario, Sanitario } from "@/types/types";
import { cookies } from "next/headers";

/* Sanitarios */
export async function getSanitarios(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener sanitarios");

  return await res.json();
}

export async function editSanitario(id: string, data: Sanitario) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_interno: data.codigo_interno,
        modelo: data.modelo,
        fecha_adquisicion: data.fecha_adquisicion,
        estado: data.estado,
      }),
      cache: "no-store",
    }
  );

  console.log("res: ", res.ok);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al editar el sanitario");
  }

  return res.status;
}

export async function deleteSanitario(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/${id}`,
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
    throw new Error(errorData.message || "Error al eliminar el sanitario");
  }

  return res.status;
}

export async function createSanitario(data: Sanitario) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        codigo_interno: data.codigo_interno,
        modelo: data.modelo,
        fecha_adquisicion: data.fecha_adquisicion,
        estado: data.estado,
      }),
      cache: "no-store",
    }
  );

  console.log("res: ", res.ok);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al crear el sanitario");
  }

  return res.status;
}

export async function getToiletsList() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener la lista de sanitarios");

  const data = await res.json();
  return data.items;
}

/* Mantenimiento de Sanitarios */
export async function getSanitariosEnMantenimiento(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/toilet_maintenance?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener sanitarios en mantenimiento");

  return await res.json();
}

export async function deleteSanitarioEnMantenimiento(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/toilet_maintenance/${id}`,
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
    throw new Error(
      errorData.message || "Error al eliminar el sanitario en mantenimiento"
    );
  }

  return res.status;
}

export async function createSanitarioEnMantenimiento(
  data: MantenimientoSanitario
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/toilet_maintenance`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        baño_id: data.baño_id,
        fecha_mantenimiento: data.fecha_mantenimiento,
        tipo_mantenimiento: data.tipo_mantenimiento,
        descripcion: data.descripcion,
        tecnico_responsable: data.tecnico_responsable,
        costo: data.costo,
      }),
      cache: "no-store",
    }
  );

  console.log("res: ", res.ok);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al crear el sanitario en mantenimiento"
    );
  }

  return res.status;
}

export async function editSanitarioEnMantenimiento(
  id: number,
  data: MantenimientoSanitario
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/toilet_maintenance/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        descripcion: data.descripcion,
        tecnico_responsable: data.tecnico_responsable,
        costo: data.costo,
      }),
      cache: "no-store",
    }
  );

  console.log("res: ", res.ok);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al editar el sanitario en mantenimiento"
    );
  }

  return res.status;
}

export async function completarMantenimientoSanitario(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/toilet_maintenance/${id}/complete`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al completar el mantenimiento del sanitario"
    );
  }

  return res.status;
}

export async function getSanitariosByClient(
  clientId: number
): Promise<Sanitario[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/by-client/${clientId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error al obtener sanitarios del cliente ${clientId}`
    );
  }

  return await res.json();
}

export async function getTotalSanitarios() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/chemical_toilets/total_chemical_toilets`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener el total de sanitarios");

  return await res.json();
}
