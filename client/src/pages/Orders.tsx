import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, FileText, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

type OrderItem = { productId: number; quantity: number; unitPrice: string };
type OrderForm = { clientId: string; status: string; notes: string; items: OrderItem[] };

const emptyForm: OrderForm = { clientId: "", status: "pending", notes: "", items: [] };

function formatCurrency(v: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);
}

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const { data: orders = [], isLoading } = trpc.orders.list.useQuery({});
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery({ includeInactive: false });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<OrderForm>(emptyForm);

  const createMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      toast.success("Pedido creado exitosamente");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      toast.success("Estado actualizado");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      utils.orders.list.invalidate();
      toast.success("Pedido eliminado");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.clientName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function addItem() {
    if (products.length === 0) return;
    const first = products[0];
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: first.id, quantity: 1, unitPrice: first.price }],
    }));
  }

  function removeItem(index: number) {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setForm((f) => {
      const items = [...f.items];
      if (field === "productId") {
        const product = products.find((p) => p.id === Number(value));
        items[index] = { ...items[index], productId: Number(value), unitPrice: product?.price ?? "0" };
      } else if (field === "quantity") {
        items[index] = { ...items[index], quantity: Number(value) };
      } else if (field === "unitPrice") {
        items[index] = { ...items[index], unitPrice: String(value) };
      }
      return { ...f, items };
    });
  }

  const orderTotal = form.items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0);

  function handleSubmit() {
    if (!form.clientId) { toast.error("Selecciona un cliente"); return; }
    if (form.items.length === 0) { toast.error("Agrega al menos un producto"); return; }
    createMutation.mutate({
      clientId: parseInt(form.clientId),
      status: form.status as "pending" | "processing" | "delivered" | "cancelled",
      notes: form.notes,
      items: form.items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
    });
  }

  return (
    <FreshVidaLayout title="Pedidos">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">{orders.length} pedidos registrados</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar pedidos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }} className="gap-2 flex-shrink-0">
              <Plus className="w-4 h-4" />
              Nuevo Pedido
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Pedido</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">Cliente</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Estado</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Total</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Fecha</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-primary">{order.orderNumber}</td>
                        <td className="py-3.5 px-4 hidden md:table-cell text-foreground">{order.clientName ?? "—"}</td>
                        <td className="py-3.5 px-4">
                          <Select
                            value={order.status}
                            onValueChange={(v) => updateStatusMutation.mutate({
                              id: order.id,
                              status: v as "pending" | "processing" | "delivered" | "cancelled",
                            })}
                          >
                            <SelectTrigger className={`w-36 h-7 text-xs border ${STATUS_COLORS[order.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold hidden sm:table-cell">
                          {formatCurrency(Number(order.totalAmount))}
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                          {new Date(order.createdAt).toLocaleDateString("es-CO")}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              title="Ver factura"
                              onClick={() => navigate(`/invoices/${order.id}`)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-destructive hover:text-destructive"
                                onClick={() => { if (confirm("¿Eliminar este pedido?")) deleteMutation.mutate({ id: order.id }); }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          {search || statusFilter !== "all" ? "No se encontraron pedidos" : "No hay pedidos registrados"}
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

      {/* Create Order Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente *</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Productos del pedido</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Agregar
                </Button>
              </div>
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 bg-muted/30 rounded-lg">
                    <div className="col-span-5">
                      <Select
                        value={String(item.productId)}
                        onValueChange={(v) => updateItem(i, "productId", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => <SelectItem key={p.id} value={String(p.id)} className="text-xs">{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Cant."
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Precio"
                      />
                    </div>
                    <div className="col-span-1 text-xs text-right font-medium text-muted-foreground">
                      ${(item.quantity * Number(item.unitPrice)).toLocaleString("es-CO")}
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="icon" className="w-7 h-7 text-destructive" onClick={() => removeItem(i)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {form.items.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed border-border rounded-lg">
                    Agrega productos al pedido
                  </p>
                )}
              </div>
              {form.items.length > 0 && (
                <div className="flex justify-end mt-2 pt-2 border-t border-border">
                  <span className="text-sm font-bold">Total: {formatCurrency(orderTotal)}</span>
                </div>
              )}
            </div>

            <div>
              <Label>Notas</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones del pedido..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              Crear pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FreshVidaLayout>
  );
}
