import { LogoMVA } from "@/assets/ImgDatabase";
import { Car, Users, Toilet, UserCheck, Hammer, Wrench, User } from "lucide-react"; // Quité CloudSun, agregué Wrench

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
      items: [
        { title: "Listado", url: "/dashboard/usuarios/listado" },
      ],
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
      title: "Baños",
      url: "/dashboard/banos",
      icon: Toilet,
      items: [
        { title: "Listado", url: "/dashboard/baños/listado" },
        { title: "Mantenimiento", url: "/dashboard/baños/mantenimiento" },
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
        { title: "Listado", url: "/dashboard/servicios/listado" },
        { title: "Crear Servicio", url: "/dashboard/servicios/crear" },
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
      ],
    },
  ],
};

export default dataSideBar;
