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

export type VehicleMaintenance = {
  id: number;
  vehiculoId: number;
  fechaMantenimiento: string | Date;
  tipoMantenimiento: string;
  descripcion?: string;
  costo: number;
  proximoMantenimiento?: string | Date;
  completado: boolean;
  fechaCompletado?: string | Date;
  vehicle?: {
    id: number;
    placa: string;
    marca: string;
    modelo: string;
  };
};

export type CreateEmployeeLeaveDto = {
  employeeId: number;
  fechaInicio: Date;
  fechaFin: Date;
  tipoLicencia: LeaveType;
  notas?: string;
  // status?: "PENDIENTE" | "APROBADO" | "RECHAZADO";
};

export class UpdateEmployeeLeaveDto {
  employeeId?: number;
  fechaInicio?: Date;
  fechaFin?: Date;
  tipoLicencia?: LeaveType;
  notas?: string;
  aprobado?: boolean;
  status?: "PENDIENTE" | "APROBADO" | "RECHAZADO";
}

export enum LeaveType {
  VACACIONES = "VACACIONES",
  ENFERMEDAD = "ENFERMEDAD",
  ORDINARIA = "ORDINARIA",
  FALLECIMIENTO_FAMILIAR = "FALLECIMIENTO_FAMILIAR",
  CASAMIENTO = "CASAMIENTO",
  NACIMIENTO = "NACIMIENTO",
  CAPACITACION = "CAPACITACION",
}

export type UpdateVehicleMaintenance = {
  fechaMantenimiento?: string | Date;
  tipoMantenimiento?: string;
  descripcion?: string;
  costo?: number;
  proximoMantenimiento?: string | Date;
};

export type CreateVehicleMaintenance = {
  vehiculoId: number;
  fechaMantenimiento: string | Date;
  tipoMantenimiento: string;
  descripcion?: string;
  costo: number;
  proximoMantenimiento?: string | Date;
};

export type Vehiculo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  capacidadCarga: number;
  estado:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "MANTENIMIENTO"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type UpdateVehiculo = {
  placa?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  capacidadCarga?: number;
  estado?:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "MANTENIMIENTO"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type VehiculoStatus = {
  estado:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "MANTENIMIENTO"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type CreateVehiculo = {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  estado?:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "MANTENIMIENTO"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type CreateEmployee = {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  email: string;
  direccion?: string;
  fecha_nacimiento?: string;
  fecha_contratacion: string;
  cargo: string;
  estado?:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "VACACIONES"
    | "LICENCIA"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type UpdateEmployee = {
  nombre?: string;
  apellido?: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  fecha_contratacion?: string;
  cargo?: string;
  estado?:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "VACACIONES"
    | "LICENCIA"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type EmpleadoFormulario = {
  nombre: string;
  apellido: string;
  documento: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  cargo: string;
  estado: StatusEmployee;
  numero_legajo: number;
  cuil: string;
  cbu: string;
};

export type StatusEmployee = {
  estado:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "VACACIONES"
    | "LICENCIA"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type Empleado = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  email: string;
  direccion?: string;
  fecha_nacimiento?: string | Date;
  fecha_contratacion: string | Date;
  cargo: string;
  numero_legajo: number;
  cuil: string;
  cbu: string;
  estado:
    | "DISPONIBLE"
    | "ASIGNADO"
    | "VACACIONES"
    | "LICENCIA"
    | "INACTIVO"
    | "BAJA"
    | string;
};

export type Cliente = {
  clienteId?: number;
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
  toilet?: Sanitario;
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

export type ChemicalToilet = {
  baño_id: number;
  codigo_interno: string;
  modelo: string;
  fecha_adquisicion: string;
  estado: string;
};
