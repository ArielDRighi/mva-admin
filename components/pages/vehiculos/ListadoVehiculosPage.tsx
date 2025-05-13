import React from "react";
import { getVehicles } from "@/app/actions/vehiculos";
import ListadoVehiculosComponent from "@/components/sections/ListadoVehiculosComponent";

export default async function ListadoVehiculosPage() {
  const vehicles = await getVehicles();
  console.log("vehicles", vehicles);
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoVehiculosComponent
          data={vehicles.data}
          totalItems={vehicles.totalItems}
          currentPage={vehicles.currentPage}
          itemsPerPage={vehicles.itemsPerPage}
        />
      </div>
    </main>
  );
}
