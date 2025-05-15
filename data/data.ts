import { LogoMVA } from "@/assets/ImgDatabase";
import {
  Car,
  Users,
  Toilet,
  UserCheck,
  Hammer,
  Wrench,
  User,
} from "lucide-react"; // Quité CloudSun, agregué Wrench

const dataSideBar = {
  team: {
    name: "MVA SRL",
    logo: LogoMVA,
    plan: "Empresa",
  },

  navMain: [
    {
      title: "Usuarios",
      url: "/dashboard/usuarios",
      icon: User,
      items: [{ title: "Listado", url: "/dashboard/usuarios/listado" }],
    },
    {
      title: "Vehículos",
      url: "/dashboard/vehiculos",
      icon: Car,
      items: [
        { title: "Listado", url: "/dashboard/vehiculos/listado" },
        { title: "Mantenimiento", url: "/dashboard/vehiculos/mantenimiento" },
      ],
    },
    {
      title: "Empleados",
      url: "/dashboard/empleados",
      icon: Users,
      items: [
        { title: "Listado", url: "/dashboard/empleados/listado" },
        {
          title: "Licencias de empleado",
          url: "/dashboard/empleados/licencias-de-empleado",
        },
      ],
    },
    {
      title: "Sanitarios",
      url: "/dashboard/sanitarios",
      icon: Toilet,
      items: [
        { title: "Listado", url: "/dashboard/sanitarios/listado" },
        { title: "Mantenimiento", url: "/dashboard/sanitarios/mantenimiento" },
      ],
    },
    {
      title: "Clientes",
      url: "/dashboard/clientes",
      icon: UserCheck,
      items: [{ title: "Listado", url: "/dashboard/clientes/listado" }],
    },
    {
      title: "Servicios",
      url: "/dashboard/servicios",
      icon: Hammer,
      items: [
        { title: "Crear Servicio", url: "/dashboard/servicios/crear" },
        { title: "Historial", url: "/dashboard/servicios/historial" },
        { title: "Servicios Activos", url: "/dashboard/servicios/activos" },
      ],
    },
    {
      title: "Condiciones contractuales",
      url: "/dashboard/condiciones-contractuales",
      icon: Wrench,
      items: [
        {
          title: "Listado",
          url: "/dashboard/condiciones-contractuales/listado",
        },
        {
          title: "Crear Condición",
          url: "/dashboard/condiciones-contractuales/crear",
        },
      ],
    },
  ],
};

export default dataSideBar;
