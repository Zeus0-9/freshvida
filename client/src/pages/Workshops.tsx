import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, BookOpen, Calendar, MapPin, Users, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const WORKSHOP_CATEGORIES = ["Orgánico", "Hidroponia", "Sostenibilidad", "Tecnología", "Negocios", "Comunidad", "Otro"];

type WorkshopForm = {
  title: string;
  description: string;
  instructor: string;
  date: string;
  duration: string;
  location: string;
  maxParticipants: string;
  category: string;
  imageUrl: string;
};

const emptyForm: WorkshopForm = {
  title: "", description: "", instructor: "", date: "", duration: "120",
  location: "", maxParticipants: "20", category: "", imageUrl: "",
};

export default function Workshops() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const { data: workshops = [], isLoading } = trpc.workshops.list.useQuery({ activeOnly: false });
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<WorkshopForm>(emptyForm);

  const createMutation = trpc.workshops.create.useMutation({
    onSuccess: () => {
      utils.workshops.list.invalidate();
      toast.success("Taller creado exitosamente");
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.workshops.update.useMutation({
    onSuccess: () => {
      utils.workshops.list.invalidate();
      toast.success("Taller actualizado");
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.workshops.delete.useMutation({
    onSuccess: () => {
      utils.workshops.list.invalidate();
      toast.success("Taller eliminado");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = workshops.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    (w.instructor ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (w.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(w: typeof workshops[0]) {
    setForm({
      title: w.title,
      description: w.description ?? "",
      instructor: w.instructor ?? "",
      date: w.date ? new Date(w.date).toISOString().slice(0, 16) : "",
      duration: String(w.duration ?? 120),
      location: w.location ?? "",
      maxParticipants: String(w.maxParticipants ?? 20),
      category: w.category ?? "",
      imageUrl: w.imageUrl ?? "",
    });
    setEditingId(w.id);
    setShowForm(true);
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.date) {
      toast.error("Título y fecha son requeridos");
      return;
    }
    const data = {
      title: form.title,
      description: form.description,
      instructor: form.instructor,
      date: form.date,
      duration: parseInt(form.duration) || 120,
      location: form.location,
      maxParticipants: parseInt(form.maxParticipants) || 20,
      category: form.category,
      imageUrl: form.imageUrl || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  }

  // If not authenticated, show public view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">FreshVida</span>
            </div>
            <Button size="sm" onClick={() => navigate("/")}>Iniciar sesión</Button>
          </div>
        </nav>
        <div className="container py-12">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3">Talleres Comunitarios</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Aprende sobre agricultura sostenible, técnicas modernas y desarrollo comunitario con nuestros expertos.
            </p>
          </div>
          <div className="relative max-w-sm mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar talleres..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.filter((w) => w.active).map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} onClick={() => navigate(`/workshops/${workshop.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <FreshVidaLayout title="Talleres Comunitarios">
      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">{workshops.length} talleres registrados</p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar talleres..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="gap-2 flex-shrink-0">
                <Plus className="w-4 h-4" />
                Nuevo Taller
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((workshop) => (
              <div key={workshop.id} className="relative">
                <WorkshopCard
                  workshop={workshop}
                  onClick={() => navigate(`/workshops/${workshop.id}`)}
                />
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-7 h-7 bg-white/90 hover:bg-white shadow-sm"
                      onClick={(e) => { e.stopPropagation(); openEdit(workshop); }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-7 h-7 bg-white/90 hover:bg-white shadow-sm text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("¿Eliminar este taller?")) deleteMutation.mutate({ id: workshop.id });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No hay talleres registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) { setForm(emptyForm); setEditingId(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Taller" : "Nuevo Taller"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nombre del taller" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe el taller..." className="mt-1" rows={3} />
            </div>
            <div>
              <Label>Instructor</Label>
              <Input value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="Nombre del instructor" className="mt-1" />
            </div>
            <div>
              <Label>Categoría</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Seleccionar...</option>
                {WORKSHOP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Fecha y hora *</Label>
              <Input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Duración (min)</Label>
              <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Lugar</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lugar del taller" className="mt-1" />
            </div>
            <div>
              <Label>Máx. participantes</Label>
              <Input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Guardar cambios" : "Crear taller"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FreshVidaLayout>
  );
}

function WorkshopCard({ workshop, onClick }: { workshop: any; onClick: () => void }) {
  const dateObj = workshop.date ? new Date(workshop.date) : null;
  return (
    <Card
      className="border border-border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="h-32 overflow-hidden relative">
        {workshop.imageUrl ? (
          <img src={workshop.imageUrl} alt={workshop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 145), oklch(0.28 0.10 145))" }}>
            <BookOpen className="w-10 h-10 text-white/60" />
          </div>
        )}
        {workshop.category && (
          <Badge className="absolute top-2 left-2 text-xs bg-white/90 text-foreground border-0 shadow-sm">
            {workshop.category}
          </Badge>
        )}
        {!workshop.active && (
          <Badge className="absolute top-2 right-2 text-xs bg-gray-800/80 text-white border-0">
            Inactivo
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {workshop.title}
        </h3>
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {dateObj && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{dateObj.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          )}
          {workshop.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">{workshop.location}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Máx. {workshop.maxParticipants}</span>
            </div>
            {workshop.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{workshop.duration} min</span>
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
