export const dynamic = "force-dynamic";
import ListadoCondicionesContractualesComponent from "@/components/sections/ListadoCondicionesContractualesComponent";
import React from "react";

export default async function ListadoCondicionesContractualesPage() {
  // Aquí puedes agregar la lógica para obtener datos de la API cuando la implementes
  // Por ejemplo: const conditions = await getContractualConditions();

  // Por ahora, usaremos datos de prueba
  const mockData = {
    items: [],
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0,
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ListadoCondicionesContractualesComponent
          data={mockData.items}
          totalItems={mockData.total}
          currentPage={mockData.page}
          itemsPerPage={mockData.limit}
        />
      </div>
    </main>
  );
}
