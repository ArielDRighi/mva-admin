"use server";

import {
  CreateEmployee,
  Empleado,
  StatusEmployee,
  UpdateEmployee,
} from "@/types/types";
import { cookies } from "next/headers";

export async function getEmployees(
  page: number = 1,
  limit: number = 15,
  search: string = ""
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener empleados");

  return await res.json();
}

export async function getEmployeeById(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener el empleado");

  return await res.json();
}

export async function getEmployeeByDocumento(documento: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/documento/${documento}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener el empleado por documento");

  return await res.json();
}

export async function editEmployee(id: number, data: UpdateEmployee) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al editar el empleado");
  }

  return res.status;
}

export async function deleteEmployee(id: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${id}`,
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
    throw new Error(errorData.message || "Error al eliminar el empleado");
  }

  return res.status;
}

export async function createEmployee(data: CreateEmployee) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al crear el empleado");
  }

  return res.json();
}

export async function changeEmployeeStatus(id: number, estado: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${id}/estado`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Error al cambiar el estado del empleado"
    );
  }

  return res.status;
}

export async function getTotalEmployees() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/total_employees`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener el total de empleados");

  return await res.json();
}

export async function getMineAssignedServicesPending(employeeId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/assigned/pendings/${employeeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener los servicios asignados");

  return await res.json();
}

export async function getMineAssignedServicesInProgress(employeeId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/assigned/inProgress/${employeeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener los servicios asignados");

  return await res.json();
}

export async function getLastServicesByUserId(employeeId: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/employee/${employeeId}/last`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Error al obtener los servicios asignados");

  return await res.json();
}

export async function getCompletedServicesByEmployee(
  employeeId: number,
  page: number = 1,
  limit: number = 10,
  search?: string
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) throw new Error("Token no encontrado");

  const searchQuery = search ? `&search=${search}` : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/employee/${employeeId}/completed?page=${page}&limit=${limit}${searchQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok)
    throw new Error("Error al obtener los servicios completados del empleado");

  return await res.json();
}
