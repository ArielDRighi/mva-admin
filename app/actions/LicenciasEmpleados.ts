"use server";

import { CreateEmployeeLeaveDto, UpdateEmployeeLeaveDto } from "@/types/types";
import {
  createAuthHeaders,
  handleApiResponse,
  createServerAction,
} from "@/lib/actions";

/**
 * Get all employee leaves with optional pagination and search
 */
export const getEmployeeLeaves = createServerAction(
  async (page: number = 1, limit: number = 15, search: string = "") => {
    const headers = await createAuthHeaders();
    const searchQuery = search ? `&search=${search}` : "";

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves?page=${page}&limit=${limit}${searchQuery}`,
      {
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al obtener licencias de empleados");
  },
  "Error al obtener licencias de empleados"
);

/**
 * Get a specific employee leave by ID
 */
export const getEmployeeLeaveById = createServerAction(async (id: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves/${id}`,
    {
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al obtener la licencia");
}, "Error al obtener la licencia");

/**
 * Get all leaves for a specific employee
 */
export const getLeavesByEmployee = createServerAction(
  async (employeeId: number) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves/employee/${employeeId}`,
      {
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al obtener licencias del empleado");
  },
  "Error al obtener licencias del empleado"
);

/**
 * Create a new employee leave
 */
export const createEmployeeLeave = createServerAction(
  async (data: CreateEmployeeLeaveDto) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al crear la licencia");
  },
  "Error al crear la licencia"
);

/**
 * Update an existing employee leave
 */
export const updateEmployeeLeave = createServerAction(
  async (id: number, data: UpdateEmployeeLeaveDto) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves/${id}`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al actualizar la licencia");
  },
  "Error al actualizar la licencia"
);

/**
 * Approve an employee leave request
 */
export const approveEmployeeLeave = createServerAction(async (id: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves/${id}/approve`,
    {
      method: "PATCH",
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al aprobar la licencia");
}, "Error al aprobar la licencia");

/**
 * Delete an employee leave
 */
export const deleteEmployeeLeave = createServerAction(async (id: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves/${id}`,
    {
      method: "DELETE",
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al eliminar la licencia");
}, "Error al eliminar la licencia");

/**
 * Reject an employee leave request
 */
export const rejectEmployeeLeave = createServerAction(async (id: number) => {
  const headers = await createAuthHeaders();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves/${id}/reject`,
    {
      method: "PATCH",
      headers,
      cache: "no-store",
    }
  );

  return handleApiResponse(res, "Error al rechazar la licencia");
}, "Error al rechazar la licencia");

/**
 * Get all leaves for a specific user
 */
export const getLicenciasByUserId = createServerAction(
  async (userId: number) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/employee-leaves/employee/${userId}`,
      {
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al obtener licencias del empleado");
  },
  "Error al obtener licencias del empleado"
);
