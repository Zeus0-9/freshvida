import FreshVidaLayout from "@/components/FreshVidaLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Calendar, MapPin, Users, Clock, BookOpen, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, useLocation } from "wouter";

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>();
  const workshopId = parseInt(id ?? "0");
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const { data: workshop, isLoading } = trpc.workshops.getById.useQuery({ id: workshopId });
  const { data: participants = [] } = trpc.workshops.participants.useQuery(
    { workshopId },
    { enabled: isAuthenticated }
  );
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "" });

  const registerMutation = trpc.workshops.registerParticipant.useMutation({
    onSuccess: () => {
      utils.workshops.participants.invalidate();
      toast.success("¡Registro exitoso! Te esperamos en el taller.");
      setShowRegister(false);
      setRegForm({ name: "", email: "", phone: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const removeParticipantMutation = trpc.workshops.removeParticipant.useMutation({
    onSuccess: () => {
      utils.workshops.participants.invalidate();
      toast.success("Participante eliminado");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleRegister() {
    if (!regForm.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    registerMutation.mutate({
      workshopId,
      name: regForm.name,
      email: regForm.email,
      phone: regForm.phone,
    });
  }

  if (isLoading) {
    return (
      <FreshVidaLayout title="Cargando...">
        <div className="p-6 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </FreshVidaLayout>
    );
  }

  if (!workshop) {
    return (
      <FreshVidaLayout title="Taller no encontrado">
        <div className="p-6 text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">El taller no fue encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/workshops")}>
            Volver a talleres
          </Button>
        </div>
      </FreshVidaLayout>
    );
  }

  const dateObj = workshop.date ? new Date(workshop.date) : null;
  const isAlreadyRegistered = participants.some((p) => p.email === user?.email);

  const content = (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate("/workshops")}>
        <ArrowLeft className="w-4 h-4" />
        Volver a talleres
      </Button>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
        {workshop.imageUrl ? (
          <img src={workshop.imageUrl} alt={workshop.title} className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 145), oklch(0.28 0.10 145))" }}>
            <BookOpen className="w-16 h-16 text-white/60" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              {workshop.category && (
                <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-2">
                  {workshop.category}
                </span>
              )}
              <h1 className="text-2xl font-bold text-foreground mb-2">{workshop.title}</h1>
              {workshop.instructor && (
                <p className="text-muted-foreground text-sm">
                  Instructor: <span className="font-medium text-foreground">{workshop.instructor}</span>
                </p>
              )}
            </div>
            {isAuthenticated && !isAlreadyRegistered && workshop.active && (
              <Button onClick={() => setShowRegister(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Registrarme
              </Button>
            )}
            {isAlreadyRegistered && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Ya estás registrado
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          {workshop.description && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed">{workshop.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Participants (admin only) */}
          {isAdmin && (
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Participantes ({participants.length}/{workshop.maxParticipants})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="text-left py-2.5 px-4 text-xs text-muted-foreground font-medium uppercase">Nombre</th>
                        <th className="text-left py-2.5 px-4 text-xs text-muted-foreground font-medium uppercase hidden md:table-cell">Email</th>
                        <th className="text-left py-2.5 px-4 text-xs text-muted-foreground font-medium uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.id} className="border-t border-border/50">
                          <td className="py-2.5 px-4 font-medium">{p.name}</td>
                          <td className="py-2.5 px-4 hidden md:table-cell text-muted-foreground text-xs">{p.email ?? "—"}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{new Date(p.registeredAt).toLocaleDateString("es-CO")}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive h-6 px-2 text-xs"
                                onClick={() => { if (confirm("¿Eliminar participante?")) removeParticipantMutation.mutate({ id: p.id }); }}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {participants.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-muted-foreground text-sm">
                            No hay participantes registrados aún
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <Card className="border border-border shadow-sm">
            <CardContent className="p-4 space-y-3">
              {dateObj && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="text-sm font-medium">{dateObj.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="text-xs text-muted-foreground">{dateObj.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              )}
              {workshop.duration && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Duración</p>
                    <p className="text-sm font-medium">{workshop.duration >= 60 ? `${Math.floor(workshop.duration / 60)}h ${workshop.duration % 60 > 0 ? `${workshop.duration % 60}min` : ""}` : `${workshop.duration} minutos`}</p>
                  </div>
                </div>
              )}
              {workshop.location && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lugar</p>
                    <p className="text-sm font-medium">{workshop.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cupos</p>
                  <p className="text-sm font-medium">{participants.length} / {workshop.maxParticipants} registrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <FreshVidaLayout title={workshop.title}>
      {content}
      <RegisterDialog
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onSubmit={handleRegister}
        form={regForm}
        setForm={setRegForm}
        isPending={registerMutation.isPending}
      />
    </FreshVidaLayout>
  );
}

// Register Dialog
function RegisterDialog({ open, onClose, onSubmit, form, setForm, isPending }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrarme al taller</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label>Nombre completo *</Label>
            <Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="Tu nombre" className="mt-1" />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" className="mt-1" />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value })} placeholder="+57 300 000 0000" className="mt-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isPending}>Confirmar registro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
