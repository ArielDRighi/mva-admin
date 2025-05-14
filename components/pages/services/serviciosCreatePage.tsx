export const dynamic = "force-dynamic";
import ServiciosCreateComponent from "@/components/sections/ServiciosCreateComponent";
import React from "react";

export default async function ServiciosCreatePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 grid-cols-1">
        <ServiciosCreateComponent />
      </div>
    </main>
  );
}
