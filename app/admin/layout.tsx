// app/dashboard/layout.tsx
import { AppSidebar } from "@/components/layout/AppSidebar";
import Header from "@/components/layout/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
      <Toaster richColors closeButton/>
    </SidebarProvider>
  );
}
