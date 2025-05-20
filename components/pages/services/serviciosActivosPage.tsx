export const dynamic = "force-dynamic";
import React from "react";
import { getInProgressServices } from "@/app/actions/services";
import ListadoServiciosActivosComponent from "@/components/sections/ListadoServiciosActivosComponent";

export default async function ServiciosActivosPage() {
  const servicios = await getInProgressServices();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoServiciosActivosComponent
          data={servicios.items || servicios.data || []}
          totalItems={servicios.total || servicios.totalItems || 0}
          currentPage={servicios.page || servicios.currentPage || 1}
          itemsPerPage={servicios.limit || servicios.itemsPerPage || 15}
        />
      </div>
    </main>
  );
}
