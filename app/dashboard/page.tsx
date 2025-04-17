// app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); // o mostrar 404 si querés mantenerlo ultra oculto
  }

  return (
    <div>
      <h1>Bienvenido al Dashboard</h1>
      {/* contenido privado */}
    </div>
  );
}