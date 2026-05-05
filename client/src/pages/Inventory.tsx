import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, AlertTriangle, Package, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Inventory() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const { data: products = [], isLoading: loadingProducts } = trpc.products.list.useQuery({ includeInactive: false });
  const { data: movements = [], isLoading: loadingMovements } = trpc.inventory.movements.useQuery({});
  const [search, setSearch] = useState("");
  const [showMovement, setShowMovement] = useState(false);
  const [movForm, setMovForm] = useState({ productId: "", type: "in" as "in" | "out" | "adjustment", quantity: "", notes: "" });

  const addMovementMutation = trpc.inventory.addMovement.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      utils.inventory.movements.invalidate();
      toast.success("Movimiento registrado exitosamente");
      setShowMovement(false);
      setMovForm({ productId: "", type: "in", quantity: "", notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const lowStock = products.filter((p) => p.stock < p.minStock);
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleMovement() {
    if (!movForm.productId || !movForm.quantity) {
      toast.error("Selecciona un producto y cantidad");
      return;
    }
    addMovementMutation.mutate({
      productId: parseInt(movForm.productId),
      type: movForm.type,
      quantity: parseInt(movForm.quantity),
      reason: movForm.notes,
    });
  }

  const getStockStatus = (product: typeof products[0]) => {
    const ratio = product.stock / product.minStock;
    if (product.stock === 0) return { label: "Sin stock", color: "bg-red-100 text-red-800 border-red-200" };
    if (ratio < 1) return { label: "Stock bajo", color: "bg-amber-100 text-amber-800 border-amber-200" };
    if (ratio < 2) return { label: "Stock normal", color: "bg-blue-100 text-blue-800 border-blue-200" };
    return { label: "Stock alto", color: "bg-green-100 text-green-800 border-green-200" };
  };

  return (
    <FreshVidaLayout title="Inventario">
      <div className="p-6 space-y-5">
        {/* Alerts */}
        {lowStock.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800">Alerta de stock bajo ({lowStock.length} productos)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map((p) => (
                <span key={p.id} className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full">
                  {p.name}: {p.stock} {p.unit} (mín: {p.minStock})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                  <p className="text-xs text-muted-foreground">Productos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{lowStock.length}</p>
                  <p className="text-xs text-muted-foreground">Stock bajo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {movements.filter((m) => m.type === "in").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Entradas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {movements.filter((m) => m.type === "out").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Salidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stock">
          <div className="flex items-center justify-between mb-3">
            <TabsList>
              <TabsTrigger value="stock">Stock Actual</TabsTrigger>
              <TabsTrigger value="movements">Movimientos</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button onClick={() => setShowMovement(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Movimiento
              </Button>
            </div>
          </div>

          <TabsContent value="stock">
            <Card className="border border-border shadow-sm">
              <CardContent className="p-0">
                {loadingProducts ? (
                  <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Producto</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">Categoría</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Stock Actual</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Stock Mín.</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Estado</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Precio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((product) => {
                          const status = getStockStatus(product);
                          return (
                            <tr key={product.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-8 h-8 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                      <Package className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <span className="font-medium text-foreground">{product.name}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 hidden md:table-cell">
                                <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`font-bold ${product.stock < product.minStock ? "text-red-600" : "text-green-600"}`}>
                                  {product.stock}
                                </span>
                                <span className="text-muted-foreground text-xs ml-1">{product.unit}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center hidden sm:table-cell text-muted-foreground text-sm">
                                {product.minStock} {product.unit}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                                  {status.label}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right hidden lg:table-cell font-semibold text-foreground">
                                ${Number(product.price).toLocaleString("es-CO")}
                              </td>
                            </tr>
                          );
                        })}
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              No se encontraron productos
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <Card className="border border-border shadow-sm">
              <CardContent className="p-0">
                {loadingMovements ? (
                  <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Tipo</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Producto</th>
                          <th className="text-center py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Cantidad</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">Notas</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map((mov) => (
                          <tr key={mov.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${
                                mov.type === "in"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : mov.type === "out"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}>
                                {mov.type === "in" ? <TrendingUp className="w-3 h-3" /> : mov.type === "out" ? <TrendingDown className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3" />}
                                {mov.type === "in" ? "Entrada" : mov.type === "out" ? "Salida" : "Ajuste"}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-foreground">{mov.productName ?? "—"}</td>
                            <td className="py-3 px-4 text-center font-semibold">
                              <span className={mov.type === "in" ? "text-green-600" : mov.type === "out" ? "text-red-600" : "text-blue-600"}>
                                {mov.type === "in" ? "+" : mov.type === "out" ? "-" : "~"}{mov.quantity}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell text-muted-foreground text-xs">{mov.reason ?? "—"}</td>
                            <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                              {new Date(mov.createdAt).toLocaleString("es-CO")}
                            </td>
                          </tr>
                        ))}
                        {movements.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                              No hay movimientos registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Movement Dialog */}
      <Dialog open={showMovement} onOpenChange={(o) => { setShowMovement(o); if (!o) setMovForm({ productId: "", type: "in", quantity: "", notes: "" }); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Producto *</Label>
              <Select value={movForm.productId} onValueChange={(v) => setMovForm({ ...movForm, productId: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} (Stock: {p.stock} {p.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de movimiento</Label>
                <Select value={movForm.type} onValueChange={(v) => setMovForm({ ...movForm, type: v as "in" | "out" | "adjustment" })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Entrada</SelectItem>
                    <SelectItem value="out">Salida</SelectItem>
                    <SelectItem value="adjustment">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cantidad *</Label>
                <Input
                  type="number"
                  min="1"
                  value={movForm.quantity}
                  onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Input
                value={movForm.notes}
                onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })}
                placeholder="Motivo del movimiento..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovement(false)}>Cancelar</Button>
            <Button onClick={handleMovement} disabled={addMovementMutation.isPending}>
              Registrar movimiento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FreshVidaLayout>
  );
}
