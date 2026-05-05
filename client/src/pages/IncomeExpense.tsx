import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import FreshVidaLayout from "@/components/FreshVidaLayout";
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Edit2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function IncomeExpense() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ description: "", amount: "", category: "otros" });

  // Mock data for demonstration
  const mockIncomeExpense = {
    totalIncome: 188100,
    totalExpenses: 65835,
    netProfit: 122265,
    income: [
      { id: 1, date: "2026-05-02", description: "Venta Tomate Chonto", amount: 45000, type: "income" },
      { id: 2, date: "2026-05-01", description: "Venta Cilantro Fresco", amount: 32000, type: "income" },
      { id: 3, date: "2026-04-30", description: "Venta Zanahoria Baby", amount: 28500, type: "income" },
      { id: 4, date: "2026-04-28", description: "Venta Pimentón Rojo", amount: 25600, type: "income" },
    ],
    expenses: [
      { id: 5, date: "2026-05-02", description: "Compra de semillas", amount: 12000, category: "insumos" },
      { id: 6, date: "2026-05-01", description: "Transporte", amount: 8500, category: "transporte" },
      { id: 7, date: "2026-04-30", description: "Fertilizante", amount: 15000, category: "insumos" },
      { id: 8, date: "2026-04-28", description: "Mantenimiento equipos", amount: 10335, category: "mantenimiento" },
    ],
  };

  const handleAddExpense = () => {
    if (!formData.description || !formData.amount) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    toast.success("Gasto registrado correctamente");
    setOpenDialog(false);
    setFormData({ description: "", amount: "", category: "otros" });
  };

  return (
    <FreshVidaLayout title="Ingresos y Gastos">
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-green-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Total Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${mockIncomeExpense.totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">De pedidos completados</p>
            </CardContent>
          </Card>

          <Card className="border border-red-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Total Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">${mockIncomeExpense.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">Gastos operacionales</p>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Ganancia Neta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">${mockIncomeExpense.netProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {((mockIncomeExpense.netProfit / mockIncomeExpense.totalIncome) * 100).toFixed(1)}% margen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ingresos y Gastos Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingresos */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Ingresos
              </CardTitle>
              <CardDescription>Registros de ventas completadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-green-900">Fecha</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-green-900">Descripción</th>
                      <th className="text-right py-2.5 px-4 text-xs font-semibold text-green-900">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockIncomeExpense.income.map((item) => (
                      <tr key={item.id} className="border-t border-green-100 hover:bg-green-50/50">
                        <td className="py-2.5 px-4 text-xs">{new Date(item.date).toLocaleDateString("es-CO")}</td>
                        <td className="py-2.5 px-4 font-medium">{item.description}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-green-600">
                          ${item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Gastos */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  Gastos
                </CardTitle>
                <CardDescription>Registros de gastos operacionales</CardDescription>
              </div>
              {isAdmin && (
                <Button size="sm" onClick={() => setOpenDialog(true)} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Gasto
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-red-900">Fecha</th>
                      <th className="text-left py-2.5 px-4 text-xs font-semibold text-red-900">Descripción</th>
                      <th className="text-right py-2.5 px-4 text-xs font-semibold text-red-900">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockIncomeExpense.expenses.map((item) => (
                      <tr key={item.id} className="border-t border-red-100 hover:bg-red-50/50">
                        <td className="py-2.5 px-4 text-xs">{new Date(item.date).toLocaleDateString("es-CO")}</td>
                        <td className="py-2.5 px-4 font-medium">{item.description}</td>
                        <td className="py-2.5 px-4 text-right font-semibold text-red-600">
                          ${item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog para agregar gasto */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Ej: Compra de semillas"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insumos">Insumos</SelectItem>
                    <SelectItem value="transporte">Transporte</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddExpense} className="bg-red-600 hover:bg-red-700">
                Registrar Gasto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FreshVidaLayout>
  );
}
