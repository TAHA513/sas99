import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import StaffDashboard from "@/pages/staff/dashboard";
import CustomersPage from "@/pages/customers-page";
import AppointmentsPage from "@/pages/appointments-page";
import StaffPage from "@/pages/staff-page";
import MarketingPage from "@/pages/marketing-page";
import PromotionsPage from "@/pages/promotions-page";
import ProductsPage from "@/pages/products-page";
import BarcodesPage from "@/pages/barcodes-page";
import InvoicesPage from "@/pages/invoices-page";
import InstallmentsPage from "@/pages/installments-page";
import ReportsPage from "@/pages/reports-page";
import PurchasesPage from "@/pages/purchases-page";
import SuppliersPage from "@/pages/suppliers-page";
import ExpensesPage from "@/pages/expenses-page";
import ExpenseCategoriesPage from "@/pages/expense-categories-page";
import SettingsPage from "@/pages/settings-page";
import InventoryReportsPage from "@/pages/inventory-reports-page";
import { useEffect } from "react";
import { loadThemeSettings } from "@/lib/theme";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

function Router() {
  // Load theme settings on app initialization
  useEffect(() => {
    loadThemeSettings();
  }, []);

  return (
    <Switch>
      {/* المسارات الرئيسية */}
      <Route path="/" component={DashboardPage} />
      <Route path="/staff" component={StaffDashboard} />
      <Route path="/purchases" component={PurchasesPage} />
      <Route path="/suppliers" component={SuppliersPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/appointments" component={AppointmentsPage} />
      <Route path="/staff-management" component={StaffPage} />
      <Route path="/marketing" component={MarketingPage} />
      <Route path="/promotions" component={PromotionsPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/invoices" component={InvoicesPage} />
      <Route path="/installments" component={InstallmentsPage} />
      <Route path="/expenses" component={ExpensesPage} />
      <Route path="/expense-categories" component={ExpenseCategoriesPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/inventory-reports" component={InventoryReportsPage} />
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