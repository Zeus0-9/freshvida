import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FreshVidaLayout from "@/components/FreshVidaLayout";
import { Users, BookOpen, Package, Heart, Plus, MapPin, Calendar, Target } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SocialImpact() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", description: "" });

  // Mock data
  const mockImpact = {
    totalPeopleTrained: 250,
    workshopsCompleted: 12,
    resourcesDistributed: 450,
    communitiesReached: 8,
    communities: [
      {
        id: 1,
        name: "Comunidad Agrícola El Roble",
        location: "Vereda El Roble, Cundinamarca",
        peopleTrained: 35,
        workshopsAttended: 3,
        resourcesReceived: 60,
      },
      {
        id: 2,
        name: "Asociación de Productores La Esperanza",
        location: "Municipio de Facatativá",
        peopleTrained: 28,
        workshopsAttended: 2,
        resourcesReceived: 45,
      },
      {
        id: 3,
        name: "Grupo de Mujeres Emprendedoras",
        location: "Vereda La Palmera",
        peopleTrained: 42,
        workshopsAttended: 4,
        resourcesReceived: 75,
      },
      {
        id: 4,
        name: "Cooperativa Agrícola San Juan",
        location: "Municipio de Zipaquirá",
        peopleTrained: 38,
        workshopsAttended: 3,
        resourcesReceived: 65,
      },
      {
        id: 5,
        name: "Jóvenes Agricultores del Valle",
        location: "Vereda San Isidro",
        peopleTrained: 31,
        workshopsAttended: 2,
        resourcesReceived: 50,
      },
      {
        id: 6,
        name: "Red de Productores Sostenibles",
        location: "Municipio de Ubaté",
        peopleTrained: 45,
        workshopsAttended: 4,
        resourcesReceived: 80,
      },
      {
        id: 7,
        name: "Asociación Campesina Unida",
        location: "Vereda La Laguna",
        peopleTrained: 22,
        workshopsAttended: 2,
        resourcesReceived: 40,
      },
      {
        id: 8,
        name: "Colectivo de Agricultura Orgánica",
        location: "Municipio de Guacheta",
        peopleTrained: 9,
        workshopsAttended: 1,
        resourcesReceived: 35,
      },
    ],
  };

  const handleAddCommunity = () => {
    if (!formData.name || !formData.location) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }
    toast.success("Comunidad registrada correctamente");
    setOpenDialog(false);
    setFormData({ name: "", location: "", description: "" });
  };

  return (
    <FreshVidaLayout title="Impacto Social">
      <div className="p-6 space-y-6">
        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-blue-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Personas Capacitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{mockImpact.totalPeopleTrained}+</div>
              <p className="text-xs text-muted-foreground mt-2">En 8 comunidades</p>
            </CardContent>
          </Card>

          <Card className="border border-green-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                Talleres Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{mockImpact.workshopsCompleted}</div>
              <p className="text-xs text-muted-foreground mt-2">Este año</p>
            </CardContent>
          </Card>

          <Card className="border border-orange-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                Recursos Distribuidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{mockImpact.resourcesDistributed}</div>
              <p className="text-xs text-muted-foreground mt-2">Kits de semillas y herramientas</p>
            </CardContent>
          </Card>

          <Card className="border border-red-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                Comunidades Beneficiadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{mockImpact.communitiesReached}</div>
              <p className="text-xs text-muted-foreground mt-2">En la región</p>
            </CardContent>
          </Card>
        </div>

        {/* Communities Table */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Comunidades Beneficiadas</CardTitle>
              <CardDescription>Registro de impacto por comunidad</CardDescription>
            </div>
            {isAdmin && (
              <Button size="sm" onClick={() => setOpenDialog(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Comunidad
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Comunidad</th>
                    <th className="text-left py-3 px-4 font-semibold">Ubicación</th>
                    <th className="text-center py-3 px-4 font-semibold">Personas Capacitadas</th>
                    <th className="text-center py-3 px-4 font-semibold">Talleres</th>
                    <th className="text-center py-3 px-4 font-semibold">Recursos</th>
                  </tr>
                </thead>
                <tbody>
                  {mockImpact.communities.map((community) => (
                    <tr key={community.id} className="border-t border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{community.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{community.location}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {community.peopleTrained}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {community.workshopsAttended}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          {community.resourcesReceived}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Impact Stories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Objetivos del Mes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Capacitar 50 nuevas personas", progress: 75 },
                { title: "Realizar 3 talleres", progress: 100 },
                { title: "Distribuir 100 kits de semillas", progress: 60 },
                { title: "Alcanzar 2 nuevas comunidades", progress: 50 },
              ].map((objective, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">{objective.title}</p>
                    <span className="text-xs text-muted-foreground">{objective.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${objective.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Testimonios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "María González",
                  community: "Comunidad El Roble",
                  text: "Los talleres de FreshVida cambiaron mi forma de cultivar. Ahora tengo mejores cosechas y más ingresos.",
                },
                {
                  name: "Juan Rodríguez",
                  community: "Asociación La Esperanza",
                  text: "Gracias a las capacitaciones, pude implementar técnicas sostenibles en mi finca.",
                },
              ].map((testimonial, idx) => (
                <div key={idx} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                  <p className="text-sm italic text-foreground mb-2">"{testimonial.text}"</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.community}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Dialog para agregar comunidad */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nueva Comunidad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la Comunidad</Label>
                <Input
                  id="name"
                  placeholder="Ej: Comunidad Agrícola El Roble"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  placeholder="Ej: Vereda El Roble, Cundinamarca"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción de la comunidad..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddCommunity} className="bg-green-600 hover:bg-green-700">
                Registrar Comunidad
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FreshVidaLayout>
  );
}
