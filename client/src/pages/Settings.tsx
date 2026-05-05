import { useState } from "react";
import { toast } from "sonner";
import { User, Shield, Bell, Info, Leaf, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import FreshVidaLayout from "@/components/FreshVidaLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: users = [], isLoading } = trpc.users.list.useQuery(undefined, { enabled: isAdmin });

  const promoteToAdminMutation = trpc.users.setRole.useMutation({
    onSuccess: () => {
      toast.success("Rol actualizado correctamente");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <FreshVidaLayout title="Configuración">
      <div className="p-6 space-y-6 max-w-3xl">
        {/* Profile Card */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Mi Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-lg">{user?.name ?? "Usuario"}</p>
                <p className="text-muted-foreground text-sm">{user?.email ?? "—"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user?.role === "admin" ? "default" : "secondary"} className="text-xs">
                    {user?.role === "admin" ? "Administrador" : "Empleado"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Miembro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("es-CO", { month: "long", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About FreshVida */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Acerca de FreshVida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">FreshVida</p>
                <p className="text-xs text-muted-foreground">Plataforma Agrícola Integral v1.0</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FreshVida es una plataforma de gestión agrícola orientada al desarrollo comunitario. 
              Facilita la administración de clientes, productos, pedidos e inventario, y promueve 
              la educación agrícola a través de talleres comunitarios.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: "NIT", value: "900.123.456-7" },
                { label: "Teléfono", value: "+57 (1) 234-5678" },
                { label: "Email", value: "info@freshvida.co" },
                { label: "País", value: "Colombia" },
              ].map((item) => (
                <div key={item.label} className="bg-muted/30 rounded-lg p-2.5">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Management (Admin only) */}
        {isAdmin && (
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gestión de Usuarios
              </CardTitle>
              <CardDescription className="text-xs">
                Administra los roles de los usuarios registrados en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="text-left py-2.5 px-4 text-xs text-muted-foreground font-medium uppercase">Usuario</th>
                        <th className="text-left py-2.5 px-4 text-xs text-muted-foreground font-medium uppercase hidden md:table-cell">Email</th>
                        <th className="text-left py-2.5 px-4 text-xs text-muted-foreground font-medium uppercase">Rol</th>
                        <th className="text-right py-2.5 px-4 text-xs text-muted-foreground font-medium uppercase">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-t border-border/50 hover:bg-muted/20">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {u.name?.charAt(0).toUpperCase() ?? "U"}
                              </div>
                              <span className="font-medium text-foreground">{u.name ?? "Sin nombre"}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 hidden md:table-cell text-muted-foreground text-xs">{u.email ?? "—"}</td>
                          <td className="py-2.5 px-4">
                            <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">
                              {u.role === "admin" ? "Admin" : "Empleado"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            {u.id !== user?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => promoteToAdminMutation.mutate({
                                  userId: u.id,
                                  role: u.role === "admin" ? "user" : "admin",
                                })}
                                disabled={promoteToAdminMutation.isPending}
                              >
                                {u.role === "admin" ? "Quitar admin" : "Hacer admin"}
                              </Button>
                            )}
                            {u.id === user?.id && (
                              <span className="text-xs text-muted-foreground">Tú</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">
                            No hay usuarios registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Permissions */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permisos del sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { module: "Dashboard", admin: "Acceso completo", employee: "Solo lectura" },
                { module: "Clientes", admin: "CRUD completo", employee: "Ver y crear" },
                { module: "Productos", admin: "CRUD completo", employee: "Solo lectura" },
                { module: "Pedidos", admin: "CRUD completo", employee: "Ver y crear" },
                { module: "Inventario", admin: "CRUD completo", employee: "Solo lectura" },
                { module: "Facturas", admin: "Ver y generar", employee: "Ver" },
                { module: "Talleres", admin: "CRUD completo", employee: "Ver y registrarse" },
                { module: "Configuración", admin: "Acceso completo", employee: "Solo perfil" },
              ].map((perm) => (
                <div key={perm.module} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-medium text-foreground">{perm.module}</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600 font-medium">Admin: {perm.admin}</span>
                    <span className="text-muted-foreground">Empleado: {perm.employee}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </FreshVidaLayout>
  );
}
