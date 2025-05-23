import { LogoMVA } from "@/assets/ImgDatabase";
import {
  Car,
  Users,
  Toilet,
  UserCheck,
  Hammer,
  Wrench,
  UserCog,
  Shirt,
} from "lucide-react";

const dataSideBar = {
  team: {
    name: "MVA SRL",
    logo: LogoMVA,
    plan: "Sistema de Gestión",
  },

  navMain: [
    {
      title: "Vehículos",
      url: "#",
      icon: Car,
      items: [
        { title: "Listado", url: "/admin/dashboard/vehiculos/listado" },
        {
          title: "Mantenimiento",
          url: "/admin/dashboard/vehiculos/mantenimiento",
        },
      ],
    },
    {
      title: "Empleados",
      url: "/admin/dashboard/empleados",
      icon: Users,
      items: [
        { title: "Listado", url: "/admin/dashboard/empleados/listado" },
        {
          title: "Licencias de empleado",
          url: "/admin/dashboard/empleados/licencias",
        },
        {
          title: "Licencias de conducir",
          url: "/admin/dashboard/empleados/licencias_conducir",
        },
      ],
    },
    {
      title: "Sanitarios",
      url: "#",
      icon: Toilet,
      items: [
        { title: "Listado", url: "/admin/dashboard/sanitarios/listado" },
        {
          title: "Mantenimiento",
          url: "/admin/dashboard/sanitarios/mantenimiento",
        },
      ],
    },
    {
      title: "Clientes",
      url: "/admin/dashboard/clientes",
      icon: UserCheck,
      items: [{ title: "Listado", url: "/admin/dashboard/clientes/listado" }],
    },
    {
      title: "Servicios",
      url: "#",
      icon: Hammer,
      items: [
        {
          title: "Crear Capacitacion",
          url: "/admin/dashboard/servicios/capacitaciones/crear",
        },
        {
          title: "Listado capacitaciones",
          url: "/admin/dashboard/servicios/capacitaciones/listado",
        },
        {
          title: "Crear Instalacion",
          url: "/admin/dashboard/servicios/instalacion/crear",
        },
        {
          title: "Listado Instalaciones",
          url: "/admin/dashboard/servicios/instalacion/listado",
        },
        {
          title: "Crear Servicio Generico",
          url: "/admin/dashboard/servicios/genericos/crear",
        },
        {
          title: "Listado Servicios Genericos",
          url: "/admin/dashboard/servicios/genericos/listado",
        },
      ],
    },
    {
      title: "Condiciones contractuales",
      url: "#",
      icon: Wrench,
      items: [
        {
          title: "Listado",
          url: "/admin/dashboard/condiciones-contractuales/listado",
        },
        {
          title: "Crear Condición",
          url: "/admin/dashboard/condiciones-contractuales/crear",
        },
      ],
    },
    {
      title: "Usuarios",
      url: "/admin/dashboard/usuarios",
      icon: UserCog,
      items: [
        {
          title: "Listado",
          url: "/admin/dashboard/usuarios/listado",
        },
      ],
    },
    {
      title: "Talles de empleados",
      url: "#",
      icon: Shirt,
      items: [
        {
          title: "Listado",
          url: "/admin/dashboard/talles-de-empleados/listado",
        },
      ],
    },
  ],
};

export default dataSideBar;
