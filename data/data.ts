import { LogoMVA } from "@/assets/ImgDatabase";
import { Car, Users, Toilet, UserCheck, Hammer, Wrench } from "lucide-react"; // Quité CloudSun, agregué Wrench

const dataSideBar = {
  team: {
    name: "MVA SRL",
    logo: LogoMVA,
    plan: "Empresa",
  },

  navMain: [
    {
      title: "Vehículos",
      url: "dashboard/vehiculos",
      icon: Car,
      items: [
        { title: "Listado", url: "dashboard/vehiculos/listado" },
        { title: "Mantenimiento", url: "dashboard/vehiculos/mantenimiento" },
      ],
    },
    {
      title: "Empleados",
      url: "dashboard/empleados",
      icon: Users,
      items: [{ title: "Listado", url: "dashboard/empleados/listado" }],
    },
    {
      title: "Baños",
      url: "dashboard/banos",
      icon: Toilet,
      items: [
        { title: "Listado", url: "dashboard/baños/listado" },
        { title: "Mantenimiento", url: "dashboard/baños/mantenimiento" },
      ],
    },
    {
      title: "Clientes",
      url: "dashboard/clientes",
      icon: UserCheck,
      items: [
        { title: "Listado", url: "dashboard/clientes/listado" },
        { title: "Contratos", url: "dashboard/clientes/contratos" },
        {
          title: "Servicios Activos",
          url: "dashboard/clientes/servicios-activos",
        },
      ],
    },
    {
      title: "Servicios",
      url: "dashboard/servicios",
      icon: Hammer,
      items: [
        { title: "Crear Servicio", url: "dashboard/servicios/crear" },
        { title: "Servicios Activos", url: "dashboard/servicios/activos" },
        { title: "Historial", url: "dashboard/servicios/historial" },
      ],
    },
    {
      title: "Recursos en Mantenimiento",
      url: "dashboard/recursos-en-mantenimiento",
      icon: Wrench,
      items: [
        {
          title: "Listado",
          url: "dashboard/recursos-en-mantenimiento/listado",
        },
        {
          title: "Enviar a Mantenimiento",
          url: "dashboard/recursos-en-mantenimiento/enviar",
        },
      ],
    },
  ],
};

export default dataSideBar;
