import { getSanitariosEnMantenimiento } from '@/app/actions/sanitarios';
import React from 'react'

export default async function MantenimientoSanitariosPage() {
  const sanitarios = await getSanitariosEnMantenimiento();

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