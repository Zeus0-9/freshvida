import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Leaf, BarChart3, Users, Package, ShoppingCart, BookOpen, ArrowRight, CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const features = [
  { icon: BarChart3, title: "Dashboard Analítico", desc: "Visualiza ventas, ingresos y KPIs en tiempo real con gráficos interactivos." },
  { icon: Users, title: "Gestión de Clientes", desc: "Administra tu cartera de clientes con historial completo de pedidos." },
  { icon: Package, title: "Inventario Inteligente", desc: "Control de stock con alertas automáticas de bajo inventario." },
  { icon: ShoppingCart, title: "Pedidos y Facturación", desc: "Crea pedidos, genera facturas profesionales y gestiona estados." },
  { icon: BookOpen, title: "Talleres Comunitarios", desc: "Sección educativa para la comunidad agrícola con registro de participantes." },
  { icon: Shield, title: "Roles y Permisos", desc: "Control de acceso por roles: administrador y empleado con permisos diferenciados." },
];

const stats = [
  { value: "500+", label: "Clientes activos" },
  { value: "98%", label: "Satisfacción" },
  { value: "50+", label: "Talleres realizados" },
  { value: "24/7", label: "Disponibilidad" },
];

export default function Home() {
  const { loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground font-medium">Cargando FreshVida...</p>
        </div>
      </div>
    );
  }

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FreshVida</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/workshops")}>
              Talleres
            </Button>
            <Button size="sm" onClick={() => { window.location.href = loginUrl; }}>
              Iniciar sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 145) 0%, oklch(0.28 0.10 145) 50%, oklch(0.22 0.08 145) 100%)" }}
        />
        <div className="relative container py-24 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full border border-white/20 mb-6">
              <Leaf className="w-4 h-4 text-green-400" />
              Plataforma Agrícola Integral
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Gestión agrícola{" "}
              <span className="text-green-400">inteligente</span>{" "}
              para tu empresa
            </h1>
            <p className="text-xl text-white/75 mb-10 leading-relaxed max-w-2xl">
              FreshVida centraliza la gestión de clientes, productos, pedidos e inventario en una plataforma profesional diseñada para el sector agrícola.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-3 text-base shadow-lg"
                onClick={() => { window.location.href = loginUrl; }}
              >
                Acceder a la plataforma
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent font-semibold px-8 py-3 text-base"
                onClick={() => navigate("/workshops")}
              >
                Ver talleres
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-border">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa diseñada específicamente para empresas agrícolas que buscan eficiencia y crecimiento.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, oklch(0.18 0.06 145), oklch(0.28 0.10 145))" }}>
        <div className="container text-center">
          <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Comienza a gestionar tu empresa hoy
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Únete a FreshVida y transforma la manera en que administras tu negocio agrícola.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Gestión completa", "Reportes en tiempo real", "Soporte dedicado", "Acceso seguro"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                {item}
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-3 text-base shadow-lg"
            onClick={() => { window.location.href = loginUrl; }}
          >
            Iniciar sesión
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">FreshVida</span>
            <span className="text-muted-foreground text-sm">— Plataforma Agrícola Integral</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FreshVida. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
