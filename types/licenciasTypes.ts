import { Empleado, LeaveType } from "./types";

export interface EmployeeLeave {
  id: number;
  employee_id?: number;
  employeeId?: number;
  employee?: Empleado;
  start_date?: string | Date;
  end_date?: string | Date;
  fechaInicio?: string | Date;
  fechaFin?: string | Date;
  type?: LeaveType;
  tipoLicencia?: LeaveType;
  observations?: string;
  reason?: string;
  notas?: string;
  status?: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  aprobado?: boolean;
  // Permitir acceso a propiedad employee.nombre para búsqueda
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface EmployeeLeavesResponse {
  data?: EmployeeLeave[];
  items?: EmployeeLeave[];
  totalItems?: number;
  total?: number;
  currentPage?: number;
  page?: number;
  limit?: number;
}

export interface LicenciaFormData {
  employeeId: number;
  fechaInicio: string;
  fechaFin: string;
  tipoLicencia: LeaveType;
  notas?: string;
  aprobado?: boolean;
}
