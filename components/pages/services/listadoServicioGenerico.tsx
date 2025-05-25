import { ListadoServicioGenericoComponent } from "@/components/sections/listadoServicioGenericoComponent";
import React from "react";

export default async function ListadoServicioGenericoPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoServicioGenericoComponent />
      </div>
    </main>
  );
}
