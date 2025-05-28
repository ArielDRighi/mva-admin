import { Toaster } from "sonner";

export default function DashboardEmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      {children}
      <Toaster richColors closeButton />
    </main>
  );
}
