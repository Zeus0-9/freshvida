import { DollarSign, Heart } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  FileText,
  Leaf,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", icon: BarChart3, label: "Dashboard", roles: ["admin"] },
  { href: "/clients", icon: Users, label: "Clientes", roles: ["admin"] },
  { href: "/products", icon: Package, label: "Productos", roles: ["admin", "comerciante"] },
  { href: "/orders", icon: ShoppingCart, label: "Pedidos", roles: ["admin", "comerciante"] },
  { href: "/inventory", icon: Warehouse, label: "Inventario", roles: ["admin"] },
  { href: "/invoices", icon: FileText, label: "Facturas", roles: ["admin", "comerciante"] },
  { href: "/income-expense", icon: DollarSign, label: "Ingresos y Gastos", roles: ["admin"] },
  { href: "/social-impact", icon: Heart, label: "Impacto Social", roles: ["admin", "comerciante"] },
  { href: "/reports", icon: BarChart3, label: "Reportes", roles: ["admin"] },
  { href: "/workshops", icon: BookOpen, label: "Talleres", roles: ["admin", "comerciante"] },
  { href: "/settings", icon: Settings, label: "Configuración", roles: ["admin", "comerciante"] },
];

interface FreshVidaLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function FreshVidaLayout({ children, title }: FreshVidaLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const storedUser = localStorage.getItem("freshvida_user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : {
        name: "Invitado",
        email: "",
        role: "comerciante",
      };

  const userRole = user.role;
  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = user.role === "admin" ? "Administrador" : "Comerciante";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--sidebar)" }}
      >
        <div
          className="flex items-center justify-between h-16 px-5 border-b"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-base leading-none block">
                FreshVida
              </span>
              <span
                className="text-xs leading-none"
                style={{ color: "var(--sidebar-foreground)", opacity: 0.6 }}
              >
                Plataforma Agrícola RD
              </span>
            </div>
          </div>

          <button
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3">
          <Badge
            className="text-xs font-medium"
            style={{
              background: "oklch(0.60 0.20 145 / 0.2)",
              color: "oklch(0.80 0.15 145)",
              border: "1px solid oklch(0.60 0.20 145 / 0.3)",
            }}
          >
            {roleLabel}
          </Badge>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {filteredNav.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));

            return (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-green-500/20 text-green-400"
                    : "text-white/60 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-4.5 h-4.5 flex-shrink-0 ${
                    isActive ? "text-green-400" : ""
                  }`}
                  style={{ width: "18px", height: "18px" }}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
              </button>
            );
          })}
        </nav>

        <div
          className="p-4 border-t"
          style={{ borderColor: "var(--sidebar-border)" }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-500/20 text-green-400 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {user.name}
                  </p>
                  <p className="text-white/40 text-xs truncate">{user.email}</p>
                </div>

                <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("freshvida_user");
                  window.location.href = "/";
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {title && (
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("es-DO", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}