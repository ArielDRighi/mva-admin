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
      url: "/admin/dashboard/vehiculos",
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
      ],
    },
    {
      title: "Sanitarios",
      url: "/admin/dashboard/sanitarios",
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
      url: "/dashboard/servicios",
      icon: Hammer,
      items: [
        { title: "Crear Servicio", url: "/admin/dashboard/servicios/crear" },
        { title: "Historial", url: "/admin/dashboard/servicios/historial" },
        {
          title: "Servicios Activos",
          url: "/admin/dashboard/servicios/activos",
        },
      ],
    },
    {
      title: "Condiciones contractuales",
      url: "/admin/dashboard/condiciones-contractuales",
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
      url: "/admin/dashboard/talles-de-empleados",
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
