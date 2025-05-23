import { LogoMVA } from "@/assets/ImgDatabase";
import { Car, Users, Toilet, UserCheck, Hammer, Wrench } from "lucide-react"; // Quité CloudSun, agregué Wrench

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
        {
          title: "Crear Capacitacion",
          url: "/admin/dashboard/capacitaciones/crear",
        },
        {
          title: "Listado capacitaciones",
          url: "/admin/dashboard/capacitaciones/listado",
        },
        {
          title: "Crear Instalacion",
          url: "/admin/dashboard/servicios/instalacion/crear",
        },
        {
          title: "Listado Instalaciones",
          url: "/admin/dashboard/servicios/instalacion/listado",
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
  ],
};

export default dataSideBar;
