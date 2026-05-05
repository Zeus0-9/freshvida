import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FreshVidaLayout from "@/components/FreshVidaLayout";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Reports() {
  // Mock data for monthly report
  const monthlyReport = {
    month: "Mayo 2026",
    totalSales: 188100,
    totalExpenses: 65835,
    netProfit: 122265,
    profitMargin: 65,
    totalOrders: 7,
    activeClients: 6,
    newClients: 2,
    topProducts: [
      { name: "Tomate Chonto", sales: 45000, quantity: 120 },
      { name: "Cilantro Fresco", sales: 32000, quantity: 95 },
      { name: "Zanahoria Baby", sales: 28500, quantity: 85 },
      { name: "Pimentón Rojo", sales: 25600, quantity: 70 },
      { name: "Lechuga Crespa", sales: 18000, quantity: 60 },
    ],
    socialImpact: {
      peopleTrained: 45,
      workshopsHeld: 3,
      resourcesDistributed: 75,
      communitiesReached: 2,
    },
  };

  const chartData = monthlyReport.topProducts.map((p) => ({
    name: p.name.substring(0, 10),
    sales: p.sales,
  }));

  const handleDownloadPDF = () => {
    alert("Función de descarga de PDF disponible en versión premium");
  };

  return (
    <FreshVidaLayout title="Reportes">
      <div className="p-6 space-y-6">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Reporte Mensual</h2>
            <p className="text-muted-foreground">{monthlyReport.month}</p>
          </div>
          <Button onClick={handleDownloadPDF} className="bg-green-600 hover:bg-green-700 gap-2">
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-green-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Total de Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${monthlyReport.totalSales.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">+8% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card className="border border-red-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Total de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">${monthlyReport.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">-5% vs mes anterior</p>
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
              <div className="text-3xl font-bold text-blue-600">${monthlyReport.netProfit.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">{monthlyReport.profitMargin}% margen</p>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Órdenes Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{monthlyReport.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-2">Promedio: ${(monthlyReport.totalSales / monthlyReport.totalOrders).toLocaleString()} por orden</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Métricas de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium">Clientes Activos</span>
                  <span className="text-2xl font-bold text-blue-600">{monthlyReport.activeClients}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm font-medium">Nuevos Clientes</span>
                  <span className="text-2xl font-bold text-green-600">+{monthlyReport.newClients}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium">Órdenes por Cliente</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {(monthlyReport.totalOrders / monthlyReport.activeClients).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium">Ticket Promedio</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ${(monthlyReport.totalSales / monthlyReport.totalOrders).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                Impacto Social del Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm font-medium">Personas Capacitadas</span>
                  <span className="text-2xl font-bold text-blue-600">{monthlyReport.socialImpact.peopleTrained}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm font-medium">Talleres Realizados</span>
                  <span className="text-2xl font-bold text-green-600">{monthlyReport.socialImpact.workshopsHeld}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium">Recursos Distribuidos</span>
                  <span className="text-2xl font-bold text-orange-600">{monthlyReport.socialImpact.resourcesDistributed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-sm font-medium">Comunidades Alcanzadas</span>
                  <span className="text-2xl font-bold text-red-600">{monthlyReport.socialImpact.communitiesReached}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products Bar Chart */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Productos Más Vendidos
              </CardTitle>
              <CardDescription>Top 5 productos por ingresos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="sales" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Distribution Pie Chart */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-600" />
                Distribución de Ingresos
              </CardTitle>
              <CardDescription>Por producto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={monthlyReport.topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {monthlyReport.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"][index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Product Table */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Detalle de Productos</CardTitle>
            <CardDescription>Análisis completo de ventas por producto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Producto</th>
                    <th className="text-right py-3 px-4 font-semibold">Cantidad Vendida</th>
                    <th className="text-right py-3 px-4 font-semibold">Ingresos</th>
                    <th className="text-right py-3 px-4 font-semibold">% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.topProducts.map((product, idx) => (
                    <tr key={idx} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{product.name}</td>
                      <td className="py-3 px-4 text-right">{product.quantity} unidades</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ${product.sales.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="secondary">
                          {((product.sales / monthlyReport.totalSales) * 100).toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="border border-green-200 bg-green-50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Insights Clave</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>
                  <strong>Crecimiento de ventas:</strong> Las ventas aumentaron un 8% respecto al mes anterior, impulsadas principalmente por Tomate Chonto.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>
                  <strong>Eficiencia operacional:</strong> Los gastos se redujeron un 5%, mejorando el margen de ganancia al 65%.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>
                  <strong>Impacto social:</strong> Se capacitaron 45 personas en técnicas agrícolas sostenibles, alcanzando 2 nuevas comunidades.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span>
                  <strong>Retención de clientes:</strong> 6 clientes activos con un promedio de 1.2 órdenes por cliente.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </FreshVidaLayout>
  );
}
