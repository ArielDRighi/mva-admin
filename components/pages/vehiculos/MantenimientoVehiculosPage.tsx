import React from "react";
import { getMantenimientosVehiculos } from "@/app/actions/mantenimiento_vehiculos";
import MantenimientoVehiculosComponent from "@/components/sections/MantenimientoVehiculosComponent";

export default async function MantenimientoVehiculosPage() {
  const mantenimientos = await getMantenimientosVehiculos();
  console.log("mantenimientosss", mantenimientos);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <MantenimientoVehiculosComponent
          data={mantenimientos.data}
          totalItems={mantenimientos.total}
          currentPage={mantenimientos.page}
          itemsPerPage={mantenimientos.limit}
        />
      </div>
    </main>
  );
}
