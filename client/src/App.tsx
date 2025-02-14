import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import CustomersPage from "@/pages/customers-page";
import AppointmentsPage from "@/pages/appointments-page";
import StaffPage from "@/pages/staff-page";
import SettingsPage from "@/pages/settings-page";
import MarketingPage from "@/pages/marketing-page";
import PromotionsPage from "@/pages/promotions-page";
import ProductsPage from "@/pages/products-page";
import BarcodesPage from "@/pages/barcodes-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/staff" component={StaffPage} />
      <Route path="/marketing" component={MarketingPage} />
      <Route path="/promotions" component={PromotionsPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/barcodes" component={BarcodesPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;