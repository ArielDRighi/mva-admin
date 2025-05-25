// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { LogoMVA } from "@/assets/ImgDatabase";
import { Car, Users, Toilet, ClipboardList } from "lucide-react";

export default async function Home() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (userCookie) {
    // Don't wrap the redirect in a try-catch since redirect() throws an error
    // that's meant to be caught by Next.js, not by our code
    const user = JSON.parse(userCookie);

    if (user.roles.includes("ADMIN") || user.roles.includes("SUPERVISOR")) {
      redirect("/admin/dashboard");
    } else if (user.roles.includes("OPERARIO")) {
      redirect("/empleado/dashboard");
    }
  }

  // If not authenticated, show the home page
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={LogoMVA} alt="MVA Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg">MVA SRL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Iniciar sesión</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Sistema de Gestión MVA
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Administra los servicios, recursos y clientes de tu empresa
                    de forma eficiente.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button
                      size="lg"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Comenzar ahora
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="p-4 bg-white rounded-lg shadow-xl border">
                  <img
                    src={LogoMVA}
                    alt="Dashboard Preview"
                    className="w-full h-auto rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
                  Gestiona todos tus recursos
                </h2>
                <p className="text-gray-500 md:text-xl">
                  Administra vehículos, empleados, sanitarios y servicios desde
                  una única plataforma intuitiva.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <Car className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">Vehículos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Control de flota y estado de mantenimiento.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">Empleados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Gestión de personal y licencias.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <Toilet className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">Sanitarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Inventario y estado de los sanitarios.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <ClipboardList className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">Servicios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Programación y seguimiento de servicios.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
                  Accede a tu panel de control
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl">
                  Inicia sesión para acceder a todas las funcionalidades del
                  sistema.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Link href="/login">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    size="lg"
                  >
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © 2025 MVA SRL. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm text-gray-500 underline-offset-4 hover:underline"
            >
              Términos
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-500 underline-offset-4 hover:underline"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
