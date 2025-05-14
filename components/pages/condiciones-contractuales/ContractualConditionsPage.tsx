import React from "react";

const ContractualConditionsPage = () => {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <h1 className="text-2xl font-bold">Condiciones Contractuales</h1>
        <p>Gestión de condiciones contractuales para clientes</p>

        {/* Aquí puedes agregar componentes adicionales o tarjetas informativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
            <h3 className="text-lg font-semibold">Listado de Condiciones</h3>
            <p className="text-sm text-muted-foreground mt-2">Ver y gestionar todas las condiciones contractuales.</p>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
            <h3 className="text-lg font-semibold">Condiciones por Cliente</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Administrar condiciones contractuales específicas por cliente.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContractualConditionsPage;
