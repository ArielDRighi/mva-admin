import React from "react";
import ListadoSanitariosComponent from "../sections/ListadoSanitariosComponent";
import { getSanitarios } from "@/app/actions/sanitarios";

export default async function ListadoSanitariosPage() {
  const sanitarios = await getSanitarios();

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoSanitariosComponent
          data={sanitarios.items}
          totalItems={sanitarios.total}
          currentPage={sanitarios.currentPage}
          itemsPerPage={sanitarios.itemsPerPage}
        />
      </div>
    </main>
  );
}
