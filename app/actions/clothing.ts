"use server";
import { cookies } from "next/headers";
import { RopaTalles } from "@/types/types";

export interface CreateTallesDto {
  calzado_talle: string;
  pantalon_talle: string;
  camisa_talle: string;
  campera_bigNort_talle: string;
  pielBigNort_talle: string;
  medias_talle: string;
  pantalon_termico_bigNort_talle: string;
  campera_polar_bigNort_talle: string;
  mameluco_talle: string;
}
export interface UpdateTallesDto {
  calzado_talle?: string;
  pantalon_talle?: string;
  camisa_talle?: string;
  campera_bigNort_talle?: string;
  pielBigNort_talle?: string;
  medias_talle?: string;
  pantalon_termico_bigNort_talle?: string;
  campera_polar_bigNort_talle?: string;
  mameluco_talle?: string;
}

export async function createMyClothing(
  employeeId: number,
  talles: CreateTallesDto
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/create/${employeeId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(talles),
    }
  );
  return response.json();
}

export async function getMyClothing(employeeId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/${employeeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
}

export async function updateMyClothing(
  employeeId: number,
  talles: UpdateTallesDto
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/modify/${employeeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(talles),
    }
  );
  return response.json();
}

// Funciones para administración de talles (ADMIN/SUPERVISOR)

export async function getTallesEmpleados(
  page: number = 1,
  itemsPerPage: number = 10,
  search: string = ""
): Promise<{
  data: RopaTalles[];
  total: number;
  page: number;
  itemsPerPage: number;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const searchParams = new URLSearchParams();
    searchParams.append("page", page.toString());
    searchParams.append("limit", itemsPerPage.toString());
    if (search) searchParams.append("search", search);

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/clothing?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Error al obtener los talles de empleados"
      );
    }

    const data = await response.json();

    // Si es un array directamente, es la lista de talles sin paginación
    if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        page: 1,
        itemsPerPage: data.length,
      };
    }

    // Si tiene estructura de paginación (como se esperaba inicialmente)
    return {
      data: data.items || [],
      total: data?.totalItems || 0,
      page: data?.currentPage || 1,
      itemsPerPage: data?.itemsPerPage || 10,
    };
  } catch (error) {
    console.error("Error al obtener los talles de empleados:", error);
    return { data: [], total: 0, page: 1, itemsPerPage: 10 };
  }
}

export async function getTallesEmpleadoById(
  empleadoId: number
): Promise<RopaTalles | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/${empleadoId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Error al obtener los talles del empleado"
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error al obtener los talles del empleado ${empleadoId}:`,
      error
    );
    return null;
  }
}

export async function createTallesEmpleado(
  empleadoId: number,
  talles: CreateTallesDto
): Promise<RopaTalles | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/create/${empleadoId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(talles),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Error al crear los talles del empleado"
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error al crear los talles del empleado ${empleadoId}:`,
      error
    );
    throw error;
  }
}

export async function updateTallesEmpleado(
  empleadoId: number,
  talles: UpdateTallesDto
): Promise<RopaTalles | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/modify/${empleadoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(talles),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        Array.isArray(error.message)
          ? error.message.join(", ")
          : error.message || "Error al actualizar los talles del empleado"
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error al actualizar los talles del empleado ${empleadoId}:`,
      error
    );
    throw error;
  }
}

export async function deleteTallesEmpleado(
  empleadoId: number
): Promise<{ message: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/delete/${empleadoId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Error al eliminar los talles del empleado"
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error al eliminar los talles del empleado ${empleadoId}:`,
      error
    );
    throw error;
  }
}

export async function exportTallesToExcel(): Promise<Blob> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/clothing/export`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al exportar los talles a Excel");
    }

    return await response.blob();
  } catch (error) {
    console.error("Error al exportar los talles a Excel:", error);
    throw error;
  }
}
