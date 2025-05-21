export const dynamic = "force-dynamic";
import React from "react";
import { getEmployees } from "@/app/actions/empleados";
import ListadoEmpleadosComponent from "@/components/sections/ListadoEmpleadosComponent";

export default async function ListadoEmpleadosPage() {
  const empleados = await getEmployees();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoEmpleadosComponent
          data={empleados.data}
          totalItems={empleados.totalItems}
          currentPage={empleados.currentPage}
          itemsPerPage={15}
        />
      </div>
    </main>
  );
}
