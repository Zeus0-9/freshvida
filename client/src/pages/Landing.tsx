import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, TrendingUp, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">FreshVida</span>
          </div>
          <a href={getLoginUrl()} className="text-sm font-medium text-green-600 hover:text-green-700">
            Iniciar sesión
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Leaf className="w-4 h-4" />
            Plataforma agrícola para el desarrollo comunitario
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transforma tu negocio agrícola con <span className="text-green-600">FreshVida</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Gestiona clientes, productos, inventario, pedidos y facturas en una plataforma moderna. Impulsa el desarrollo comunitario a través de talleres educativos y medición de impacto social.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2">
                Iniciar sesión <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Button size="lg" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
              Ver misión
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
              <p className="text-sm text-muted-foreground">Clientes activos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-sm text-muted-foreground">Productos gestionados</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <p className="text-sm text-muted-foreground">Talleres realizados</p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8 border border-green-200 shadow-lg">
            <div className="bg-white rounded-lg p-6 text-muted-foreground text-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-2 font-mono text-xs">
                <div>$ Dashboard de FreshVida</div>
                <div className="text-green-600">▸ Ingresos totales: $188.100</div>
                <div className="text-green-600">▸ Clientes activos: 6</div>
                <div className="text-green-600">▸ Productos en stock: 16</div>
                <div className="text-green-600">▸ Pedidos pendientes: 1</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Características principales</h2>
            <p className="text-lg text-muted-foreground">Todo lo que necesitas para gestionar tu negocio agrícola</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Gestión de Clientes",
                description: "Administra clientes, contactos e historial de pedidos en un solo lugar",
              },
              {
                icon: TrendingUp,
                title: "Control de Inventario",
                description: "Monitorea stock, alertas de bajo inventario y movimientos en tiempo real",
              },
              {
                icon: BookOpen,
                title: "Facturas Automáticas",
                description: "Genera facturas profesionales con un solo clic",
              },
              {
                icon: Leaf,
                title: "Gestión de Productos",
                description: "Organiza productos por categoría, precio y disponibilidad",
              },
              {
                icon: TrendingUp,
                title: "Dashboard Analítico",
                description: "Visualiza ventas, ingresos y métricas clave en gráficos interactivos",
              },
              {
                icon: Users,
                title: "Talleres Comunitarios",
                description: "Registra y mide el impacto de talleres educativos en comunidades",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border border-green-100 hover:border-green-300 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-12 border border-green-200">
            <h2 className="text-3xl font-bold text-foreground mb-6">Nuestra Misión</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              FreshVida nace con el propósito de empoderar a los agricultores y emprendimientos rurales mediante una plataforma integral que no solo gestiona sus operaciones comerciales, sino que también impulsa el desarrollo comunitario.
            </p>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Creemos que la tecnología debe ser accesible, intuitiva y orientada al impacto social. Por eso, FreshVida integra herramientas de gestión empresarial con funcionalidades de educación comunitaria, permitiendo que cada transacción sea una oportunidad para capacitar, conectar y transformar vidas.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[
                { title: "Eficiencia", description: "Automatiza procesos y ahorra tiempo" },
                { title: "Impacto", description: "Mide y potencia tu contribución social" },
                { title: "Comunidad", description: "Conecta con otros agricultores" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">¿Listo para transformar tu negocio?</h2>
          <p className="text-xl text-green-100 mb-8">Únete a FreshVida y comienza a gestionar tu negocio agrícola de manera profesional</p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 gap-2">
              Iniciar sesión ahora <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">FreshVida</span>
              </div>
              <p className="text-sm text-gray-400">Plataforma agrícola para el desarrollo comunitario</p>
            </div>
            <div>
              <p className="font-semibold mb-4">Producto</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Características</a></li>
                <li><a href="#" className="hover:text-white transition">Precios</a></li>
                <li><a href="#" className="hover:text-white transition">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Empresa</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 FreshVida. Todos los derechos reservados.</p>
            <p>Hecho con <span className="text-green-500">❤</span> para la comunidad agrícola</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
