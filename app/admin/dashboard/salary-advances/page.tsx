import { Metadata } from 'next';
import AdvanceList from '@/components/sections/salary-advances/AdvanceList';

export const metadata: Metadata = {
  title: 'Gestión de Adelantos | MVA Admin',
  description: 'Administración y aprobación de adelantos de salario',
};

export default function AdminAdvancesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Adelantos</h1>
        <p className="text-muted-foreground">
          Revise y apruebe las solicitudes de adelanto de salario de los empleados
        </p>
      </div>

      <AdvanceList isAdmin={true} />
    </div>
  );
}
