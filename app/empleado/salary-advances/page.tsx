import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateAdvanceForm from '@/components/sections/salary-advances/CreateAdvanceForm';
import AdvanceList from '@/components/sections/salary-advances/AdvanceList';
import { Plus, List } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Adelantos de Salario | MVA Admin',
  description: 'Gestión de adelantos de salario para empleados',
};

export default function SalaryAdvancesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adelantos de Salario</h1>
        <p className="text-muted-foreground">
          Solicite y gestione adelantos de salario de manera sencilla
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Mis Adelantos
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Solicitar Adelanto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <AdvanceList isAdmin={false} />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <CreateAdvanceForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
