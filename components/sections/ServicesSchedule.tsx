"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { CardHeader, CardTitle } from "../ui/card";
import {
  ServiceDetailsModal,
  type Servicio,
} from "../ui/local/ServiceDetailsModal";

// Tipos para las asignaciones
export type BanoAsignado = {
  baño_id: number;
  codigo_interno: string;
  modelo: string;
  fecha_adquisicion: string;
  estado: string;
};

export type EmpleadoAsignado = {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  email: string;
  direccion: string;
  fecha_nacimiento: string;
  fecha_contratacion: string;
  cargo: string;
  estado: string;
  numero_legajo: string;
  cuil: string;
  cbu: string;
  diasVacacionesTotal: number;
  diasVacacionesRestantes: number;
  diasVacacionesUsados: number;
};

export type VehiculoAsignado = {
  id: number;
  numeroInterno: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoCabina: string;
  fechaVencimientoVTV: string;
  fechaVencimientoSeguro: string;
  esExterno: boolean;
  estado: string;
};

export type Asignacion = {
  id: number;
  servicioId: number;
  empleadoId?: number;
  banoId?: number;
  vehiculoId?: number;
  rolEmpleado: string | null;
  fechaAsignacion: string;
  bano?: BanoAsignado;
  empleado?: EmpleadoAsignado;
  vehiculo?: VehiculoAsignado;
};

export type ClienteServicio = {
  clienteId: number;
  nombre: string;
  email: string;
  cuit: string;
  direccion: string;
  telefono: string;
  contacto_principal: string;
  contacto_principal_telefono: string;
  contactoObra1: string;
  contacto_obra1_telefono: string;
  contactoObra2: string;
  contacto_obra2_telefono: string;
  fecha_registro: string;
  estado: string;
};

export type ServiceFromBackend = {
  id: number;
  clienteId: number | null;
  fechaProgramada: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  tipoServicio: string;
  estado: string;
  cantidadBanos: number;
  cantidadVehiculos: number;
  cantidadEmpleados: number;
  ubicacion: string;
  notas: string | null;
  asignacionAutomatica: boolean;
  banosInstalados: string[] | null;
  condicionContractualId: number | null;
  fechaFinAsignacion: string | null;
  fechaCreacion: string;
  comentarioIncompleto: string | null;
  asignaciones: Asignacion[];
  cliente: ClienteServicio | null;
};

const MOCK_SERVICES: ServiceFromBackend[] = [
  // PROGRAMADO - Azul
  {
    id: 1,
    clienteId: 28,
    fechaProgramada: "2026-02-02T08:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "INSTALACION",
    estado: "PROGRAMADO",
    cantidadBanos: 2,
    cantidadVehiculos: 1,
    cantidadEmpleados: 2,
    ubicacion: "SALAR DEL HOMBRE MUERTO",
    notas: "RECORDAR ENVIAR FOTO DE INSTALACION AL GRUPO DE WSP",
    asignacionAutomatica: false,
    banosInstalados: null,
    condicionContractualId: 27,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-01T10:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 28,
      nombre: "BMI HYUNDAI",
      email: "ana.godoy@bmi.com.ar",
      cuit: "30716452849",
      direccion: "SALAR DEL HOMBRE MUERTO",
      telefono: "3874538166",
      contacto_principal: "Agustin Petersen",
      contacto_principal_telefono: "3874538166",
      contactoObra1: "Ana Godoy",
      contacto_obra1_telefono: "3874 49-6004",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-09-08T13:29:09.656Z",
      estado: "ACTIVO",
    },
  },
  // EN_PROGRESO - Amarillo
  {
    id: 2,
    clienteId: 15,
    fechaProgramada: "2026-02-02T14:00:00.000Z",
    fechaInicio: "2026-02-02T14:15:00.000Z",
    fechaFin: null,
    tipoServicio: "LIMPIEZA",
    estado: "EN_PROGRESO",
    cantidadBanos: 4,
    cantidadVehiculos: 1,
    cantidadEmpleados: 2,
    ubicacion: "POSCO - Campamento Norte",
    notas: "Limpieza quincenal en curso",
    asignacionAutomatica: true,
    banosInstalados: ["145", "146", "147", "148"],
    condicionContractualId: 12,
    fechaFinAsignacion: "2026-03-01T00:00:00.000Z",
    fechaCreacion: "2026-02-01T11:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [
      {
        id: 301,
        servicioId: 2,
        empleadoId: 27,
        rolEmpleado: "A",
        fechaAsignacion: "2026-02-02T14:00:00.000Z",
        empleado: {
          id: 27,
          nombre: "Jonatan Ezequiel",
          apellido: "Fabian",
          documento: "36345880",
          telefono: "3875756613",
          email: "jonatanezequielfabian11@gmail.com",
          direccion: "B° Ampliacion de El bosque block 51 Dpto 12",
          fecha_nacimiento: "1991-06-19",
          fecha_contratacion: "2025-07-03",
          cargo: "Planificador Logístico",
          estado: "ASIGNADO",
          numero_legajo: "5",
          cuil: "20-36345880-8",
          cbu: "2376873654556748900065",
          diasVacacionesTotal: 14,
          diasVacacionesRestantes: 14,
          diasVacacionesUsados: 0,
        },
      },
    ],
    cliente: {
      clienteId: 15,
      nombre: "MINERA POSCO",
      email: "logistica@posco.com.ar",
      cuit: "30712345678",
      direccion: "Ruta 40 Km 234",
      telefono: "3875123456",
      contacto_principal: "Carlos Mendez",
      contacto_principal_telefono: "3875123456",
      contactoObra1: "Pedro Gonzalez",
      contacto_obra1_telefono: "3875654321",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-05-15T10:00:00.000Z",
      estado: "ACTIVO",
    },
  },
  // COMPLETADO - Verde
  {
    id: 68,
    clienteId: 28,
    fechaProgramada: "2026-02-03T09:00:00.000Z",
    fechaInicio: "2026-02-03T09:00:00.000Z",
    fechaFin: "2026-02-03T12:00:00.000Z",
    tipoServicio: "INSTALACION",
    estado: "COMPLETADO",
    cantidadBanos: 1,
    cantidadVehiculos: 1,
    cantidadEmpleados: 1,
    ubicacion: "POSCO",
    notas: "RECORDAR ENVIAR FOTO DE INSTALACION AL GRUPO DE WSP",
    asignacionAutomatica: false,
    banosInstalados: ["190"],
    condicionContractualId: 27,
    fechaFinAsignacion: "2026-01-01T00:00:00.000Z",
    fechaCreacion: "2025-10-21T14:18:46.609Z",
    comentarioIncompleto: null,
    asignaciones: [
      {
        id: 275,
        servicioId: 68,
        banoId: 190,
        rolEmpleado: null,
        fechaAsignacion: "2025-10-21T14:18:46.609Z",
        bano: {
          baño_id: 190,
          codigo_interno: "A.A BMI HYUNDAI X4",
          modelo: "ALTO ANDINO",
          fecha_adquisicion: "2025-10-21T00:00:00.000Z",
          estado: "DISPONIBLE",
        },
      },
      {
        id: 273,
        servicioId: 68,
        empleadoId: 27,
        rolEmpleado: "A",
        fechaAsignacion: "2025-10-21T14:18:46.609Z",
        empleado: {
          id: 27,
          nombre: "Jonatan Ezequiel",
          apellido: "Fabian",
          documento: "36345880",
          telefono: "3875756613",
          email: "jonatanezequielfabian11@gmail.com",
          direccion: "B° Ampliacion de El bosque block 51 Dpto 12",
          fecha_nacimiento: "1991-06-19",
          fecha_contratacion: "2025-07-03",
          cargo: "Planificador Logístico",
          estado: "ASIGNADO",
          numero_legajo: "5",
          cuil: "20-36345880-8",
          cbu: "2376873654556748900065",
          diasVacacionesTotal: 14,
          diasVacacionesRestantes: 14,
          diasVacacionesUsados: 0,
        },
      },
      {
        id: 274,
        servicioId: 68,
        vehiculoId: 1,
        rolEmpleado: null,
        fechaAsignacion: "2025-10-21T14:18:46.609Z",
        vehiculo: {
          id: 1,
          numeroInterno: "1",
          placa: "NTO",
          marca: "TOYOTA",
          modelo: "HILUX",
          anio: 2014,
          tipoCabina: "simple",
          fechaVencimientoVTV: "2025-06-27",
          fechaVencimientoSeguro: "2025-06-29",
          esExterno: false,
          estado: "ASIGNADO",
        },
      },
    ],
    cliente: {
      clienteId: 28,
      nombre: "BMI HYUNDAI",
      email: "ana.godoy@bmi.com.ar",
      cuit: "30716452849",
      direccion: "SALAR DEL HOMBRE MUERTO",
      telefono: "3874538166",
      contacto_principal: "Agustin Petersen",
      contacto_principal_telefono: "3874538166",
      contactoObra1: "Ana Godoy",
      contacto_obra1_telefono: "3874 49-6004",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-09-08T13:29:09.656Z",
      estado: "ACTIVO",
    },
  },
  // CANCELADO - Rojo
  {
    id: 4,
    clienteId: 30,
    fechaProgramada: "2026-02-03T14:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "RETIRO",
    estado: "CANCELADO",
    cantidadBanos: 3,
    cantidadVehiculos: 1,
    cantidadEmpleados: 2,
    ubicacion: "Obra Cerrillos - Sector B",
    notas: "Cancelado por solicitud del cliente",
    asignacionAutomatica: false,
    banosInstalados: null,
    condicionContractualId: null,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-02T09:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 30,
      nombre: "CONSTRUCTORA ANDINA",
      email: "obras@constructoraandina.com",
      cuit: "30987654321",
      direccion: "Av. Bolivia 1500",
      telefono: "3874567890",
      contacto_principal: "Martin Lopez",
      contacto_principal_telefono: "3874567890",
      contactoObra1: "",
      contacto_obra1_telefono: "",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-08-20T08:00:00.000Z",
      estado: "ACTIVO",
    },
  },
  // SUSPENDIDO - Gris
  {
    id: 5,
    clienteId: 15,
    fechaProgramada: "2026-02-04T07:30:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "LIMPIEZA",
    estado: "SUSPENDIDO",
    cantidadBanos: 6,
    cantidadVehiculos: 2,
    cantidadEmpleados: 3,
    ubicacion: "Campamento Base - Puna",
    notas: "Suspendido por condiciones climáticas adversas",
    asignacionAutomatica: true,
    banosInstalados: ["101", "102", "103", "104", "105", "106"],
    condicionContractualId: 12,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-03T10:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 15,
      nombre: "MINERA POSCO",
      email: "logistica@posco.com.ar",
      cuit: "30712345678",
      direccion: "Ruta 40 Km 234",
      telefono: "3875123456",
      contacto_principal: "Carlos Mendez",
      contacto_principal_telefono: "3875123456",
      contactoObra1: "Pedro Gonzalez",
      contacto_obra1_telefono: "3875654321",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-05-15T10:00:00.000Z",
      estado: "ACTIVO",
    },
  },
  // INCOMPLETO - Naranja
  {
    id: 6,
    clienteId: 22,
    fechaProgramada: "2026-02-04T10:00:00.000Z",
    fechaInicio: "2026-02-04T10:15:00.000Z",
    fechaFin: "2026-02-04T13:00:00.000Z",
    tipoServicio: "INSTALACION",
    estado: "INCOMPLETO",
    cantidadBanos: 5,
    cantidadVehiculos: 2,
    cantidadEmpleados: 3,
    ubicacion: "Festival Serenata a Cafayate",
    notas: "Evento cultural - acceso limitado",
    asignacionAutomatica: false,
    banosInstalados: ["210", "211", "212"],
    condicionContractualId: 18,
    fechaFinAsignacion: "2026-02-10T00:00:00.000Z",
    fechaCreacion: "2026-02-03T11:00:00.000Z",
    comentarioIncompleto:
      "Solo se instalaron 3 de 5 baños por falta de espacio en el predio",
    asignaciones: [],
    cliente: {
      clienteId: 22,
      nombre: "MUNICIPALIDAD CAFAYATE",
      email: "eventos@cafayate.gob.ar",
      cuit: "30111222333",
      direccion: "Plaza Principal S/N",
      telefono: "3868421000",
      contacto_principal: "Laura Martinez",
      contacto_principal_telefono: "3868421000",
      contactoObra1: "Juan Perez",
      contacto_obra1_telefono: "3868421001",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-06-10T12:00:00.000Z",
      estado: "ACTIVO",
    },
  },
  // Más servicios para completar la semana
  {
    id: 7,
    clienteId: 28,
    fechaProgramada: "2026-02-05T08:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "LIMPIEZA",
    estado: "PROGRAMADO",
    cantidadBanos: 1,
    cantidadVehiculos: 1,
    cantidadEmpleados: 1,
    ubicacion: "SALAR DEL HOMBRE MUERTO",
    notas: "Limpieza de rutina semanal",
    asignacionAutomatica: true,
    banosInstalados: ["190"],
    condicionContractualId: 27,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-04T08:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 28,
      nombre: "BMI HYUNDAI",
      email: "ana.godoy@bmi.com.ar",
      cuit: "30716452849",
      direccion: "SALAR DEL HOMBRE MUERTO",
      telefono: "3874538166",
      contacto_principal: "Agustin Petersen",
      contacto_principal_telefono: "3874538166",
      contactoObra1: "Ana Godoy",
      contacto_obra1_telefono: "3874 49-6004",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-09-08T13:29:09.656Z",
      estado: "ACTIVO",
    },
  },
  {
    id: 8,
    clienteId: null,
    fechaProgramada: "2026-02-05T15:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "CAPACITACION",
    estado: "PROGRAMADO",
    cantidadBanos: 0,
    cantidadVehiculos: 1,
    cantidadEmpleados: 4,
    ubicacion: "Oficinas centrales MVA - Salta",
    notas: "Capacitación nuevo personal operativo",
    asignacionAutomatica: false,
    banosInstalados: null,
    condicionContractualId: null,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-04T09:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: null,
  },
  {
    id: 9,
    clienteId: 22,
    fechaProgramada: "2026-02-06T09:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "RETIRO",
    estado: "PROGRAMADO",
    cantidadBanos: 3,
    cantidadVehiculos: 1,
    cantidadEmpleados: 2,
    ubicacion: "Festival Serenata a Cafayate",
    notas: "Retiro post-evento",
    asignacionAutomatica: true,
    banosInstalados: ["210", "211", "212"],
    condicionContractualId: 18,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-05T08:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 22,
      nombre: "MUNICIPALIDAD CAFAYATE",
      email: "eventos@cafayate.gob.ar",
      cuit: "30111222333",
      direccion: "Plaza Principal S/N",
      telefono: "3868421000",
      contacto_principal: "Laura Martinez",
      contacto_principal_telefono: "3868421000",
      contactoObra1: "Juan Perez",
      contacto_obra1_telefono: "3868421001",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-06-10T12:00:00.000Z",
      estado: "ACTIVO",
    },
  },
  {
    id: 10,
    clienteId: 15,
    fechaProgramada: "2026-02-06T14:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "LIMPIEZA",
    estado: "PROGRAMADO",
    cantidadBanos: 6,
    cantidadVehiculos: 2,
    cantidadEmpleados: 3,
    ubicacion: "POSCO - Campamento Norte",
    notas: "Reprogramación del servicio suspendido",
    asignacionAutomatica: true,
    banosInstalados: ["101", "102", "103", "104", "105", "106"],
    condicionContractualId: 12,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-05T09:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 15,
      nombre: "MINERA POSCO",
      email: "logistica@posco.com.ar",
      cuit: "30712345678",
      direccion: "Ruta 40 Km 234",
      telefono: "3875123456",
      contacto_principal: "Carlos Mendez",
      contacto_principal_telefono: "3875123456",
      contactoObra1: "Pedro Gonzalez",
      contacto_obra1_telefono: "3875654321",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-05-15T10:00:00.000Z",
      estado: "ACTIVO",
    },
  },
  {
    id: 11,
    clienteId: 30,
    fechaProgramada: "2026-02-07T08:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "INSTALACION",
    estado: "PROGRAMADO",
    cantidadBanos: 4,
    cantidadVehiculos: 2,
    cantidadEmpleados: 3,
    ubicacion: "Obra Viaducto - Ruta 68",
    notas: "Nueva obra de infraestructura vial",
    asignacionAutomatica: false,
    banosInstalados: null,
    condicionContractualId: 35,
    fechaFinAsignacion: "2026-06-30T00:00:00.000Z",
    fechaCreacion: "2026-02-06T08:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 30,
      nombre: "CONSTRUCTORA ANDINA",
      email: "obras@constructoraandina.com",
      cuit: "30987654321",
      direccion: "Av. Bolivia 1500",
      telefono: "3874567890",
      contacto_principal: "Martin Lopez",
      contacto_principal_telefono: "3874567890",
      contactoObra1: "",
      contacto_obra1_telefono: "",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-08-20T08:00:00.000Z",
      estado: "ACTIVO",
    },
  },
  {
    id: 12,
    clienteId: 28,
    fechaProgramada: "2026-02-08T08:00:00.000Z",
    fechaInicio: null,
    fechaFin: null,
    tipoServicio: "LIMPIEZA",
    estado: "PROGRAMADO",
    cantidadBanos: 1,
    cantidadVehiculos: 1,
    cantidadEmpleados: 1,
    ubicacion: "SALAR DEL HOMBRE MUERTO",
    notas: "Limpieza semanal programada",
    asignacionAutomatica: true,
    banosInstalados: ["190"],
    condicionContractualId: 27,
    fechaFinAsignacion: null,
    fechaCreacion: "2026-02-07T08:00:00.000Z",
    comentarioIncompleto: null,
    asignaciones: [],
    cliente: {
      clienteId: 28,
      nombre: "BMI HYUNDAI",
      email: "ana.godoy@bmi.com.ar",
      cuit: "30716452849",
      direccion: "SALAR DEL HOMBRE MUERTO",
      telefono: "3874538166",
      contacto_principal: "Agustin Petersen",
      contacto_principal_telefono: "3874538166",
      contactoObra1: "Ana Godoy",
      contacto_obra1_telefono: "3874 49-6004",
      contactoObra2: "",
      contacto_obra2_telefono: "",
      fecha_registro: "2025-09-08T13:29:09.656Z",
      estado: "ACTIVO",
    },
  },
];

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const STATUS_STYLES: Record<string, { bg: string; border: string }> = {
  PROGRAMADO: {
    bg: "bg-blue-100",
    border: "border-l-blue-700",
  },
  EN_PROGRESO: {
    bg: "bg-yellow-100",
    border: "border-l-yellow-600",
  },
  COMPLETADO: {
    bg: "bg-green-100",
    border: "border-l-green-700",
  },
  CANCELADO: {
    bg: "bg-red-100",
    border: "border-l-red-700",
  },
  SUSPENDIDO: {
    bg: "bg-gray-200",
    border: "border-l-gray-600",
  },
  INCOMPLETO: {
    bg: "bg-orange-100",
    border: "border-l-orange-600",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-gray-100",
  border: "border-l-gray-500",
};

function getDateKey(isoDate: string): string {
  return isoDate.split("T")[0];
}

function formatDisplayDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
}

function getDayName(dateKey: string): string {
  const date = new Date(dateKey + "T12:00:00");
  return DAY_NAMES[date.getDay()];
}

function formatHora(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getWeekDates(): string[] {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date.toISOString().split("T")[0]);
  }
  return weekDates;
}

function groupServicesByDate(
  services: ServiceFromBackend[],
): Record<string, ServiceFromBackend[]> {
  const grouped: Record<string, ServiceFromBackend[]> = {};

  services.forEach((service) => {
    const dateKey = getDateKey(service.fechaProgramada);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(service);
  });

  return grouped;
}

type ServicesScheduleProps = {
  isAdmin?: boolean;
  services?: ServiceFromBackend[];
};

export const ServicesSchedule = ({
  isAdmin = false,
  services,
}: ServicesScheduleProps) => {
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const serviceData =
    services && services?.length > 0 ? services : MOCK_SERVICES;
  const weekDates = getWeekDates();
  const groupedServices = groupServicesByDate(serviceData);
  const today = new Date().toLocaleDateString("en-CA");

  const handleServiceClick = (service: ServiceFromBackend) => {
    // Convertir ServiceFromBackend a Servicio para el modal
    const servicioParaModal: Servicio = {
      id: service.id,
      clienteId: service.clienteId,
      cliente: service.cliente
        ? {
            clienteId: service.cliente.clienteId,
            nombre: service.cliente.nombre,
            email: service.cliente.email,
            cuit: service.cliente.cuit,
            direccion: service.cliente.direccion,
            telefono: service.cliente.telefono,
            contacto_principal: service.cliente.contacto_principal,
            estado: service.cliente.estado,
          }
        : null,
      fechaProgramada: service.fechaProgramada,
      fechaInicio: service.fechaInicio,
      fechaFin: service.fechaFin,
      tipoServicio: service.tipoServicio,
      estado: service.estado,
      cantidadBanos: service.cantidadBanos,
      cantidadEmpleados: service.cantidadEmpleados,
      cantidadVehiculos: service.cantidadVehiculos,
      ubicacion: service.ubicacion,
      notas: service.notas,
      asignacionAutomatica: service.asignacionAutomatica,
      banosInstalados: service.banosInstalados,
      condicionContractualId: service.condicionContractualId,
      fechaFinAsignacion: service.fechaFinAsignacion,
      fechaCreacion: service.fechaCreacion,
      comentarioIncompleto: service.comentarioIncompleto,
      asignaciones: service.asignaciones.map((asig) => ({
        id: asig.id,
        servicioId: asig.servicioId,
        empleadoId: asig.empleadoId,
        empleado: asig.empleado
          ? {
              id: asig.empleado.id,
              nombre: asig.empleado.nombre,
              apellido: asig.empleado.apellido,
              documento: asig.empleado.documento,
              estado: asig.empleado.estado,
            }
          : undefined,
        vehiculoId: asig.vehiculoId,
        vehiculo: asig.vehiculo
          ? {
              id: asig.vehiculo.id,
              numeroInterno: asig.vehiculo.numeroInterno,
              placa: asig.vehiculo.placa,
              marca: asig.vehiculo.marca,
              modelo: asig.vehiculo.modelo,
              estado: asig.vehiculo.estado,
            }
          : undefined,
        banoId: asig.banoId,
        bano: asig.bano
          ? {
              baño_id: asig.bano.baño_id,
              codigo_interno: asig.bano.codigo_interno,
              modelo: asig.bano.modelo,
              estado: asig.bano.estado,
            }
          : undefined,
        rolEmpleado: asig.rolEmpleado,
        fechaAsignacion: asig.fechaAsignacion,
      })),
    };
    setSelectedService(servicioParaModal);
    setIsModalOpen(true);
  };

  return (
    <div
      className={`lg:col-span-3 overflow-x-auto rounded-xl bg-white ${isAdmin ? "" : "py-6"}`}
    >
      {!isAdmin && (
        <CardHeader className="pt-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b mb-4">
          <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Cronograma de servicios programados
          </CardTitle>
        </CardHeader>
      )}
      <div
        className={`grid grid-cols-7 gap-2 min-w-275 ${isAdmin ? "p-1" : "px-6"}`}
      >
        {weekDates.map((dateKey) => {
          const dayServices = groupedServices[dateKey] || [];
          const isToday = dateKey === today;
          return (
            <div
              key={dateKey}
              className={`flex flex-col ${isToday ? "bg-[#04a8a44d]" : "bg-slate-50"} p-2 rounded-lg shadow shadow-stone-400`}
            >
              {/* Header */}
              <div className="rounded-lg px-3 py-2 text-center text-white bg-[#0c3c60]">
                <p className="font-bold text-sm">{getDayName(dateKey)}</p>
                <p className="text-xs opacity-90">
                  {formatDisplayDate(dateKey)}
                </p>
              </div>

              {/* Services */}
              <div className="flex flex-col gap-2 mt-2">
                {dayServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Sin servicios
                  </p>
                ) : (
                  dayServices.map((service) => {
                    const styles =
                      STATUS_STYLES[service.estado] || DEFAULT_STYLE;
                    return (
                      <div
                        key={service.id}
                        className={`${styles.bg} ${styles.border} border-l-4 rounded-lg p-2 text-xs space-y-1 cursor-pointer hover:opacity-70 transition-opacity`}
                        onClick={() => handleServiceClick(service)}
                      >
                        <p>
                          <span className="font-bold">Cliente: </span>
                          {service.cliente?.nombre ?? "Sin asignar"}
                        </p>
                        <p>
                          <span className="font-bold">Servicio: </span>
                          {service.tipoServicio}
                        </p>
                        <p>
                          <span className="font-bold">Ubicación: </span>
                          {service.ubicacion}
                        </p>
                        <p>
                          <span className="font-bold">Hora: </span>
                          {formatHora(service.fechaProgramada)}
                        </p>
                        <p>
                          <span className="font-bold">Baños: </span>
                          {service.cantidadBanos}
                        </p>
                        <p>
                          <span className="font-bold">Empleados: </span>
                          {service.cantidadEmpleados}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalles del servicio */}
      <ServiceDetailsModal
        servicio={selectedService}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};
