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
      url: "/vehiculos",
      icon: Car,
      items: [
        { title: "Listado", url: "/vehiculos/listado" },
        { title: "Mantenimiento", url: "/vehiculos/mantenimiento" },
      ],
    },
    {
      title: "Empleados",
      url: "/empleados",
      icon: Users,
      items: [{ title: "Listado", url: "/empleados/listado" }],
    },
    {
      title: "Baños",
      url: "/banos",
      icon: Toilet,
      items: [
        { title: "Listado", url: "/banos/listado" },
        { title: "Mantenimiento", url: "/banos/mantenimiento" },
      ],
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: UserCheck,
      items: [
        { title: "Listado", url: "/clientes/listado" },
        { title: "Contratos", url: "/clientes/contratos" },
        { title: "Servicios Activos", url: "/clientes/servicios-activos" },
      ],
    },
    {
      title: "Servicios",
      url: "/servicios",
      icon: Hammer,
      items: [
        { title: "Crear Servicio", url: "/servicios/crear" },
        { title: "Servicios Activos", url: "/servicios/activos" },
        { title: "Historial", url: "/servicios/historial" },
      ],
    },
    {
      title: "Recursos en Mantenimiento",
      url: "/recursos-en-mantenimiento",
      icon: Wrench,
      items: [
        { title: "Listado", url: "/recursos-en-mantenimiento/listado" },
        {
          title: "Enviar a Mantenimiento",
          url: "/recursos-en-mantenimiento/enviar",
        },
      ],
    },
  ],
};

export default dataSideBar;
