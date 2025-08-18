"use server";

import { Cliente } from "@/types/types";
import {
  createServerAction,
  createAuthHeaders,
  handleApiResponse,
} from "@/lib/actions";

/**
 * Versión mejorada de getClients con manejo de errores
 */
export const getClients = createServerAction(
  async (page: number = 1, limit: number = 15, search: string = "") => {
    const headers = await createAuthHeaders();
    const searchParam = search ? `&search=${search}` : "";
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/clients?page=${page}&limit=${limit}${searchParam}`;

    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    return handleApiResponse(res, "Error al obtener los clientes", {
      file: "app/actions/clientes.ts",
      endpoint: "/api/clients",
      method: "GET",
    });
  },
  "Error al obtener los clientes",
  {
    file: "app/actions/clientes.ts",
    endpoint: "/api/clients",
    method: "GET",
  }
);

/**
 * Versión mejorada de createClient con manejo de errores
 */
export const createClient = createServerAction(
  async (data: Cliente) => {
    const headers = await createAuthHeaders();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        nombre: data.nombre,
        email: data.email,
        cuit: data.cuit,
        direccion: data.direccion,
        telefono: data.telefono,
        contacto_principal: data.contacto_principal,
        contacto_principal_telefono: data.contacto_principal_telefono,
        contactoObra1: data.contactoObra1,
        contacto_obra1_telefono: data.contacto_obra1_telefono,
        contactoObra2: data.contactoObra2,
        contacto_obra2_telefono: data.contacto_obra2_telefono,
        estado: data.estado,
      }),
      cache: "no-store",
    });

    return handleApiResponse(res, "Error al crear el cliente", {
      file: "app/actions/clientes.ts",
      endpoint: "/api/clients",
      method: "POST",
    });
  },
  "Error al crear el cliente",
  {
    file: "app/actions/clientes.ts",
    endpoint: "/api/clients",
    method: "POST",
  }
);

/**
 * Versión mejorada de editClient con manejo de errores
 */
export const editClient = createServerAction(
  async (id: string, data: Cliente) => {
    const headers = await createAuthHeaders();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          cuit: data.cuit,
          direccion: data.direccion,
          telefono: data.telefono,
          contacto_principal: data.contacto_principal,
          contacto_principal_telefono: data.contacto_principal_telefono,
          contactoObra1: data.contactoObra1,
          contacto_obra1_telefono: data.contacto_obra1_telefono,
          contactoObra2: data.contactoObra2,
          contacto_obra2_telefono: data.contacto_obra2_telefono,
          estado: data.estado,
        }),
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al editar el cliente", {
      file: "app/actions/clientes.ts",
      endpoint: `/api/clients/${id}`,
      method: "PUT",
    });
  },
  "Error al editar el cliente",
  {
    file: "app/actions/clientes.ts",
    endpoint: "/api/clients/:id",
    method: "PUT",
  }
);

/**
 * Versión mejorada de deleteClient con manejo de errores
 */
export const deleteClient = createServerAction(
  async (id: string) => {
    const headers = await createAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${id}`,
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      }
    );

    return handleApiResponse(res, "Error al eliminar el cliente", {
      file: "app/actions/clientes.ts",
      endpoint: `/api/clients/${id}`,
      method: "DELETE",
    });
  },
  "Error al eliminar el cliente",
  {
    file: "app/actions/clientes.ts",
    endpoint: "/api/clients/:id",
    method: "DELETE",
  }
);
