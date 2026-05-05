import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";

const CATEGORIES = ["Hortalizas", "Verduras", "Frutas", "Raices", "Hierbas", "Granos", "Otros"];

type ProductForm = {
  name: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  minStock: string;
  unit: string;
  imageUrl: string;
  imageKey: string;
};

const emptyForm: ProductForm = {
  name: "", category: "", description: "", price: "", stock: "0", minStock: "10", unit: "kg", imageUrl: "", imageKey: "",
};

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const { data: products = [], isLoading } = trpc.products.list.useQuery({ includeInactive: isAdmin });
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Producto creado exitosamente");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Producto actualizado");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success("Producto desactivado");
    },
    onError: (e) => toast.error(e.message),
  });

  const uploadMutation = trpc.products.uploadImage.useMutation({
    onSuccess: (data) => {
      setForm((f) => ({ ...f, imageUrl: data.url, imageKey: data.key }));
      toast.success("Imagen subida correctamente");
      setUploading(false);
    },
    onError: (e) => { toast.error(e.message); setUploading(false); },
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("La imagen debe ser menor a 5MB"); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ filename: file.name, contentType: file.type, base64 });
    };
    reader.readAsDataURL(file);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(product: typeof products[0]) {
    setForm({
      name: product.name,
      category: product.category,
      description: product.description ?? "",
      price: product.price,
      stock: String(product.stock),
      minStock: String(product.minStock),
      unit: product.unit ?? "kg",
      imageUrl: product.imageUrl ?? "",
      imageKey: product.imageKey ?? "",
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.category || !form.price) {
      toast.error("Nombre, categoría y precio son requeridos");
      return;
    }
    const data = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: form.price,
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 10,
      unit: form.unit,
      imageUrl: form.imageUrl || undefined,
      imageKey: form.imageKey || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <FreshVidaLayout title="Productos">
      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">{products.length} productos registrados</p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="gap-2 flex-shrink-0">
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => {
              const isLow = product.stock < product.minStock;
              return (
                <Card key={product.id} className="border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="h-36 bg-muted/30 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground/40" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground text-sm leading-tight">{product.name}</h3>
                      {isLow && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 ml-1" />}
                    </div>
                    <Badge variant="secondary" className="text-xs mb-2">{product.category}</Badge>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-lg font-bold text-primary">${Number(product.price).toLocaleString("es-CO")}</p>
                        <p className="text-xs text-muted-foreground">por {product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isLow ? "text-red-500" : "text-green-600"}`}>
                          {product.stock} {product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">en stock</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(product)}>
                          <Edit2 className="w-3 h-3" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { if (confirm("¿Desactivar este producto?")) deleteMutation.mutate({ id: product.id }); }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>{search ? "No se encontraron productos" : "No hay productos registrados"}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del producto" className="mt-1" />
            </div>
            <div>
              <Label>Categoría *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unidad</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["kg", "g", "lb", "unidad", "manojo", "caja", "bolsa", "litro"].map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Precio (COP) *</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Stock actual</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Stock mínimo</Label>
              <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción del producto..." className="mt-1" rows={2} />
            </div>
            <div className="col-span-2">
              <Label>Imagen del producto</Label>
              <div className="mt-1 flex items-center gap-3">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-border" />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  <ImagePlus className="w-4 h-4" />
                  {uploading ? "Subiendo..." : "Subir imagen"}
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FreshVidaLayout>
  );
}
