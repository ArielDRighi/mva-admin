import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Calendar,
  DollarSign,
  Key,
  LogOut,
  Siren,
  TreePalm,
  Truck,
  UserRound,
} from "lucide-react";
import { User } from "../sections/DashboardComponent";
import { usePathname } from "next/navigation";

type EmployeeHeaderProps = {
  user: User | null;
  handleChangePassword?: () => void;
  handleLogoutClick?: () => void;
};
export const EmployeeHeader = ({
  user,
  handleChangePassword,
  handleLogoutClick,
}: EmployeeHeaderProps) => {
  const path = usePathname();
  const isDashboard = path === "/empleado/dashboard";
  return (
    <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-xl p-5 shadow-md">
      <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="text-white w-full">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            ¡Bienvenido, {user?.nombre.toUpperCase()}!
          </h1>
          <p className="mt-1 text-blue-100">
            {user?.roles} •{" "}
            <Badge className="bg-white/20 text-white hover:bg-white/30 ml-1">
              {user?.estado}
            </Badge>
          </p>{" "}
          {/* Quick links section moved to header */}
          {isDashboard && (
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
              <Button
                variant="outline"
                className="justify-center bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/contactos_emergencia"
                  className="flex items-center"
                >
                  <Siren className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:flex text-sm line-clamp-2">
                    Contactos de emergencia
                  </span>
                  <span className="flex sm:hidden text-sm">Emergencias</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-center bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link href="/empleado/vestimenta" className="flex items-center">
                  <UserRound className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Mis talles de ropa</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-center bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/licencia_conducir"
                  className="flex items-center"
                >
                  <Truck className="h-4 w-4 shrink-0" />
                  <span className="text-sm hidden sm:flex ">
                    Mi licencia de conducir
                  </span>
                  <span className="text-sm flex sm:hidden ">Mi licencia</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-center bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                asChild
              >
                <Link
                  href="/empleado/adelantos-salario"
                  className="flex items-center"
                >
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Adelantos de salario</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-center bg-white/10 hover:bg-white/20 text-white border-0 h-auto py-2"
                onClick={() => {
                  document.getElementById("vacaciones-licencias")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <TreePalm className="mr-2 h-4 w-4 shrink-0" />
                <span className="text-sm">Vacaciones</span>
              </Button>
            </div>
          )}
        </div>
        {!isDashboard ? (
          <Button
            variant="outline"
            className="bg-white hover:bg-white/90 text-blue-700"
            onClick={() => (window.location.href = "/empleado/dashboard")}
          >
            Volver
          </Button>
        ) : (
          <div
            className="relative lg:absolute lg:top-0 lg:right-0 grid grid-cols-2 gap-2 w-full lg:max-w-96"
            // style={{ maxWidth: "400px" }}
          >
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-0"
              onClick={handleChangePassword}
            >
              <Key className="h-4 w-4 mr-2" /> Cambiar contraseña
            </Button>
            <Button
              variant="outline"
              className="bg-red-500 text-white hover:bg-red-600 border-none"
              onClick={handleLogoutClick}
            >
              <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
