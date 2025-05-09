import { LucideIcon } from "lucide-react";

export type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export type Cliente = {
  clienteId?: string;
  nombre: string;
  cuit: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto_principal: string;
  fecha_registro?: string;
  estado: "ACTIVO" | "INACTIVO" | string;
};

export type ClientesResponse = {
  items: Cliente[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ClienteFormulario = Pick<
  Cliente,
  | "nombre"
  | "cuit"
  | "direccion"
  | "telefono"
  | "email"
  | "contacto_principal"
  | "estado"
>;
