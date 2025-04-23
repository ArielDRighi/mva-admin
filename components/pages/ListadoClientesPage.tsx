import React from "react";
import ListadoClientesComponent from "../sections/ListadoClientesComponent";
import { getClients } from "@/app/actions/clientes";

export default async function ListadoClientesPage() {
  const clients = await getClients();
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <ListadoClientesComponent data={clients} />
    </main>
  );
}
