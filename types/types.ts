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

export type Sanitario = {
  baño_id?: string;
  codigo_interno: string;
  modelo: string;
  fecha_adquisicion: string;
  estado:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "EN_MANTENIMIENTO"
    | "FUERA_DE_SERVICIO"
    | "BAJA"
    | string;
};

export type SanitariosResponse = {
  items: Sanitario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SanitarioFormulario = Pick<
  Sanitario,
  "codigo_interno" | "modelo" | "fecha_adquisicion" | "estado"
>;

export type MantenimientoSanitario = {
  baño_id?: number;
  mantenimiento_id?: number;
  fecha_mantenimiento?: string;
  tipo_mantenimiento: "Preventivo" | "Correctivo" | string;
  descripcion: string;
  tecnico_responsable: string;
  costo: number;
  completado?: boolean;
  fechaCompletado?: string | null;
  toilet?: Sanitario[];
};

export type MantenimientoSanitarioForm = {
  baño_id: number;
  mantenimiento_id?: number;
  fecha_mantenimiento?: string;
  tipo_mantenimiento: "Preventivo" | "Correctivo" | string;
  descripcion: string;
  tecnico_responsable: string;
  costo: number;
  completado?: boolean;
  fechaCompletado?: string | null;
  toilet?: Sanitario[];
};

export type MantenimientosSanitariosResponse = {
  items: MantenimientoSanitario[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MantenimientoSanitarioFormulario = Pick<
  MantenimientoSanitario,
  | "baño_id"
  | "tipo_mantenimiento"
  | "descripcion"
  | "tecnico_responsable"
  | "costo"
>;
