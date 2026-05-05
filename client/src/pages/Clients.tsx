import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";

type ClientForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

const emptyForm: ClientForm = { name: "", email: "", phone: "", address: "", city: "", notes: "" };

export default function Clients() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const { data: clients = [], isLoading } = trpc.clients.list.useQuery();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ClientForm>(emptyForm);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      toast.success("Cliente creado exitosamente");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      toast.success("Cliente actualizado");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      toast.success("Cliente eliminado");
    },
    onError: (e) => toast.error(e.message),
  });

  const { data: clientOrders = [] } = trpc.clients.getOrders.useQuery(
    { clientId: viewingId! },
    { enabled: viewingId !== null }
  );

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(client: typeof clients[0]) {
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      city: client.city ?? "",
      notes: client.notes ?? "",
    });
    setEditingId(client.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.name.trim()) { toast.error("El nombre es requerido"); return; }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  }

  const viewingClient = clients.find((c) => c.id === viewingId);

  return (
    <FreshVidaLayout title="Clientes">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">{clients.length} clientes registrados</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={openCreate} className="gap-2 flex-shrink-0">
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Nombre</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">Contacto</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Ciudad</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Registro</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((client) => (
                      <tr key={client.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-semibold text-foreground">{client.name}</p>
                            {client.notes && <p className="text-xs text-muted-foreground truncate max-w-48">{client.notes}</p>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="space-y-0.5">
                            {client.email && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="text-xs">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span className="text-xs">{client.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          {client.city && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="text-sm">{client.city}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                          {new Date(client.createdAt).toLocaleDateString("es-CO")}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => setViewingId(client.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8"
                              onClick={() => openEdit(client)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm("¿Eliminar este cliente?")) {
                                    deleteMutation.mutate({ id: client.id });
                                  }
                                }}
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
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          {search ? "No se encontraron clientes" : "No hay clientes registrados"}
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

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre completo o empresa" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" className="mt-1" />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="555-0000" className="mt-1" />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Ciudad" className="mt-1" />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Dirección" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones adicionales..." className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Guardar cambios" : "Crear cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewingId !== null} onOpenChange={(o) => { if (!o) setViewingId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Cliente</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Nombre:</span><p className="font-semibold">{viewingClient.name}</p></div>
                <div><span className="text-muted-foreground">Ciudad:</span><p className="font-semibold">{viewingClient.city ?? "—"}</p></div>
                <div><span className="text-muted-foreground">Email:</span><p className="font-semibold">{viewingClient.email ?? "—"}</p></div>
                <div><span className="text-muted-foreground">Teléfono:</span><p className="font-semibold">{viewingClient.phone ?? "—"}</p></div>
                <div className="col-span-2"><span className="text-muted-foreground">Dirección:</span><p className="font-semibold">{viewingClient.address ?? "—"}</p></div>
                {viewingClient.notes && <div className="col-span-2"><span className="text-muted-foreground">Notas:</span><p className="font-semibold">{viewingClient.notes}</p></div>}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2">Historial de Pedidos ({clientOrders.length})</h4>
                {clientOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin pedidos registrados</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {clientOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between text-xs p-2 bg-muted/40 rounded-lg">
                        <span className="font-medium text-primary">{order.orderNumber}</span>
                        <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("es-CO")}</span>
                        <span className="font-semibold">${Number(order.totalAmount).toLocaleString("es-CO")}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </FreshVidaLayout>
  );
}
