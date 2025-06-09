'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, XCircle, Eye, Filter, Calendar, DollarSign } from 'lucide-react';
import { SalaryAdvance, SalaryAdvanceFilters } from '@/types/salaryAdvanceTypes';
import { getMyAdvancesAction, getAllAdvancesAction, approveAdvanceAction, rejectAdvanceAction } from '@/app/actions/salaryAdvanceActions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCookie } from 'cookies-next';
import { getUserById } from '@/app/actions/users';
import { ByIDUserResponse } from '@/types/userTypes';

interface AdvanceListProps {
  isAdmin?: boolean;
}

export default function AdvanceList({ isAdmin = false }: AdvanceListProps) {
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvance, setSelectedAdvance] = useState<SalaryAdvance | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SalaryAdvanceFilters>({
    status: 'all',
    page: 1,
    limit: 10,
  });  const loadAdvances = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Admin can see all advances with full filters
        const result = await getAllAdvancesAction(filters);
        setAdvances(result.advances || []);
      } else {
        // Employee can only see their own advances - no employeeId needed
        const result = await getMyAdvancesAction();
        setAdvances(result || []);
      }
    } catch (error) {
      console.error('Error loading advances:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los adelantos';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvances();
  }, [filters]);  const handleApproval = async (status: 'approved' | 'rejected') => {
    if (!selectedAdvance) return;

    setIsProcessing(true);
    try {
      let result;
      if (status === 'approved') {
        result = await approveAdvanceAction(selectedAdvance.id);
      } else {
        result = await rejectAdvanceAction(selectedAdvance.id);
      }

      // If we get here, the action was successful
      toast.success(
        status === 'approved' 
          ? 'Adelanto aprobado exitosamente' 
          : 'Adelanto rechazado exitosamente'
      );
      setIsApprovalDialogOpen(false);
      setSelectedAdvance(null);
      setApprovalComment('');
      loadAdvances();
      
    } catch (error) {
      console.error('Error processing advance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la solicitud';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {isAdmin ? 'Gestión de Adelantos de Salario' : 'Mis Adelantos de Salario'}
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? 'Revise y gestione las solicitudes de adelanto de salario de los empleados'
              : 'Visualice el estado de sus solicitudes de adelanto de salario'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label htmlFor="status-filter">Estado:</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => setFilters({ ...filters, status: value as any, page: 1 })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Label htmlFor="date-from">Desde:</Label>
              <Input
                id="date-from"
                type="date"
                className="w-40"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined, page: 1 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="date-to">Hasta:</Label>
              <Input
                id="date-to"
                type="date"
                className="w-40"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined, page: 1 })}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ status: 'all', page: 1, limit: 10 })}
            >
              Limpiar
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && <TableHead>Empleado</TableHead>}
                  <TableHead>Monto</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Solicitud</TableHead>
                  {isAdmin && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                      Cargando adelantos...
                    </TableCell>
                  </TableRow>
                ) : advances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                      No se encontraron adelantos
                    </TableCell>
                  </TableRow>
                ) : (
                  advances.map((advance) => (
                    <TableRow key={advance.id}>
                      {isAdmin && (
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {advance.employee.nombre} {advance.employee.apellido}
                            </p>
                            <p className="text-sm text-gray-500">
                              Legajo: {advance.employee.legajo}
                            </p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        {formatCurrency(advance.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={advance.reason}>
                          {advance.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(advance.status)}
                      </TableCell>
                      <TableCell>
                        {formatDate(advance.createdAt)}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAdvance(advance)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {advance.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdvance(advance);
                                  setIsApprovalDialogOpen(true);
                                }}
                              >
                                Revisar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAdvance && !isApprovalDialogOpen} onOpenChange={() => setSelectedAdvance(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Adelanto</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud de adelanto
            </DialogDescription>
          </DialogHeader>
          {selectedAdvance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Empleado</Label>
                  <p>{selectedAdvance.employee.nombre} {selectedAdvance.employee.apellido}</p>
                  <p className="text-sm text-gray-500">Legajo: {selectedAdvance.employee.legajo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Monto</Label>
                  <p className="text-lg font-medium">{formatCurrency(selectedAdvance.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedAdvance.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Solicitud</Label>
                  <p>{formatDate(selectedAdvance.createdAt)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Motivo</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedAdvance.reason}</p>
              </div>
              {selectedAdvance.approvedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Aprobado por</Label>
                    <p>{selectedAdvance.approvedBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fecha de Aprobación</Label>
                    <p>{selectedAdvance.approvedAt ? formatDate(selectedAdvance.approvedAt) : '-'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar Solicitud de Adelanto</DialogTitle>
            <DialogDescription>
              Apruebe o rechace la solicitud de adelanto de {selectedAdvance?.employee.nombre} {selectedAdvance?.employee.apellido}
            </DialogDescription>
          </DialogHeader>
          {selectedAdvance && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Monto Solicitado</Label>
                  <p className="text-lg font-medium">{formatCurrency(selectedAdvance.amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fecha de Solicitud</Label>
                  <p>{formatDate(selectedAdvance.createdAt)}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Motivo</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedAdvance.reason}</p>
              </div>
              <div>
                <Label htmlFor="approval-comment">Comentario (opcional)</Label>
                <Textarea
                  id="approval-comment"
                  placeholder="Agregue un comentario sobre su decisión..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsApprovalDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApproval('rejected')}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </Button>
            <Button
              onClick={() => handleApproval('approved')}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
