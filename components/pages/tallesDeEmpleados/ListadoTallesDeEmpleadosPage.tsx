import { getTallesEmpleados } from "@/app/actions/clothing";
import TallesEmpleadosComponent from "@/components/sections/TallesEmpleadosComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Talles de Empleados | MVA Admin",
  description: "Administración de talles de ropa y calzado para empleados",
};

export default async function ListadoTallesDeEmpleadosPage() {
  const { data, total, page, itemsPerPage } = await getTallesEmpleados();

  console.log("Datos recibidos en la página de listado:", { 
    cantidad: data.length,
    total,
    page,
    itemsPerPage 
  });

  return (
    <TallesEmpleadosComponent
      data={data}
      totalItems={total}
      currentPage={page}
      itemsPerPage={itemsPerPage}
    />
  );
}
