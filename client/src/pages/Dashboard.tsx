import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowUpRight, DollarSign, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "badge-pending",
  processing: "badge-processing",
  delivered: "badge-delivered",
  cancelled: "badge-cancelled",
};

const CHART_COLORS = ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
}

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
}

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const [, navigate] = useLocation();

  // Calcular gastos estimados y ganancia
  const totalRevenue = Number(stats?.totalRevenue ?? 0);
  const estimatedExpenses = totalRevenue * 0.35;
  const netProfit = totalRevenue - estimatedExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  const kpis = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(Number(stats?.totalRevenue ?? 0)),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      change: "+12.5%",
    },
    {
      title: "Total Clientes",
      value: String(stats?.totalClients ?? 0),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: "+3 este mes",
    },
    {
      title: "Total Pedidos",
      value: String(stats?.totalOrders ?? 0),
      icon: ShoppingCart,
      color: "text-purple-600",
      bg: "bg-purple-50",
      change: `${stats?.pendingOrders ?? 0} pendientes`,
    },
    {
      title: "Productos Activos",
      value: String(stats?.totalProducts ?? 0),
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
      change: `${stats?.lowStock?.length ?? 0} con stock bajo`,
    },
  ];

  return (
    <FreshVidaLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="border border-border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {kpi.change}
                  </span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{kpi.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sales Area Chart */}
          <Card className="lg:col-span-2 border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Ventas por Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={(stats?.salesByMonth ?? []).map((d) => ({
                    month: formatMonth(d.month),
                    total: Number(d.total),
                    count: Number(d.count),
                  }))}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Products Pie */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Productos Top</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={(stats?.topProducts ?? []).map((p) => ({
                          name: p.productName,
                          value: Number(p.totalQty),
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {(stats?.topProducts ?? []).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v} unidades`, ""]} contentStyle={{ fontSize: "12px", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {(stats?.topProducts ?? []).slice(0, 4).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i] }} />
                        <span className="text-foreground truncate flex-1">{p.productName}</span>
                        <span className="text-muted-foreground font-medium">{Number(p.totalQty)} u.</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top Products Bar Chart */}
          <Card className="lg:col-span-2 border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Ingresos por Producto</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={(stats?.topProducts ?? []).map((p) => ({
                    name: (p.productName ?? "").slice(0, 12),
                    revenue: Number(p.totalRevenue),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                    />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (stats?.lowStock?.length ?? 0) === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Todo el stock está bien</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(stats?.lowStock ?? []).slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-100 cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => navigate("/inventory")}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">Mín: {product.minStock} {product.unit}</p>
                      </div>
                      <Badge className="badge-low-stock text-xs ml-2 flex-shrink-0">
                        {product.stock} {product.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Pedidos Recientes</CardTitle>
            <button
              className="text-sm text-primary hover:underline font-medium"
              onClick={() => navigate("/orders")}
            >
              Ver todos
            </button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">Pedido</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">Cliente</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">Estado</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium text-xs uppercase tracking-wide">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentOrders ?? []).map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate("/orders")}
                      >
                        <td className="py-3 px-3 font-medium text-primary">{order.orderNumber}</td>
                        <td className="py-3 px-3 text-foreground">{order.clientName ?? "—"}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-foreground">
                          {formatCurrency(Number(order.totalAmount))}
                        </td>
                      </tr>
                    ))}
                    {(stats?.recentOrders?.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No hay pedidos registrados aún
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FreshVidaLayout>
  );
}
