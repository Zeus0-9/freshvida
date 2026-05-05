import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Workshops from "./pages/Workshops";
import WorkshopDetail from "./pages/WorkshopDetail";
import Settings from "./pages/Settings";
import IncomeExpense from "./pages/IncomeExpense";
import SocialImpact from "./pages/SocialImpact";
import Reports from "./pages/Reports";

function getUser() {
  const user = localStorage.getItem("freshvida_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("freshvida_user");
    return null;
  }
}

function PrivateRoute({ component: Component }: any) {
  const user = getUser();

  if (!user) {
    window.location.href = "/";
    return null;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: any) {
  const user = getUser();

  if (!user) {
    window.location.href = "/";
    return null;
  }

  if (user.role !== "admin") {
    window.location.href = "/products";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />

      {/* Rutas solo para administrador */}
      <Route path="/dashboard" component={() => <AdminRoute component={Dashboard} />} />
      <Route path="/clients" component={() => <AdminRoute component={Clients} />} />
      <Route path="/inventory" component={() => <AdminRoute component={Inventory} />} />
      <Route path="/income-expense" component={() => <AdminRoute component={IncomeExpense} />} />
      <Route path="/reports" component={() => <AdminRoute component={Reports} />} />

      {/* Rutas para usuarios logueados */}
      <Route path="/products" component={() => <PrivateRoute component={Products} />} />
      <Route path="/orders" component={() => <PrivateRoute component={Orders} />} />
      <Route path="/invoices" component={() => <PrivateRoute component={Invoices} />} />
      <Route path="/invoices/:id" component={() => <PrivateRoute component={Invoices} />} />
      <Route path="/workshops" component={() => <PrivateRoute component={Workshops} />} />
      <Route path="/workshops/:id" component={() => <PrivateRoute component={WorkshopDetail} />} />
      <Route path="/social-impact" component={() => <PrivateRoute component={SocialImpact} />} />
      <Route path="/settings" component={() => <PrivateRoute component={Settings} />} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;