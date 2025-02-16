import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import LoginPage from "@/pages/auth/login-page";
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
import { ProtectedRoute } from "@/lib/protected-route";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

function Router() {
  useEffect(() => {
    loadThemeSettings();
  }, []);

  return (
    <Switch>
      {/* صفحة تسجيل الدخول */}
      <Route path="/staff/login" component={LoginPage} />

      {/* المسارات المحمية للمدير فقط */}
      <ProtectedRoute path="/" component={DashboardPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/purchases" component={PurchasesPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/suppliers" component={SuppliersPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/customers" component={CustomersPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/staff-management" component={StaffPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/marketing" component={MarketingPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/promotions" component={PromotionsPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/products" component={ProductsPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/invoices" component={InvoicesPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/installments" component={InstallmentsPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/expenses" component={ExpensesPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/expense-categories" component={ExpenseCategoriesPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/reports" component={ReportsPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/inventory-reports" component={InventoryReportsPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/barcodes" component={BarcodesPage} allowedRoles={["admin"]} />
      <ProtectedRoute path="/settings" component={SettingsPage} allowedRoles={["admin"]} />

      {/* المسارات المتاحة للموظفين */}
      <ProtectedRoute path="/staff" component={StaffDashboard} allowedRoles={["admin", "staff"]} />
      <ProtectedRoute path="/appointments" component={AppointmentsPage} allowedRoles={["admin", "staff"]} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;