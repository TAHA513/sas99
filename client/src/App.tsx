import { Switch, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
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
      <Route path="/">
        <DashboardPage />
      </Route>
      <Route path="/purchases">
        <PurchasesPage />
      </Route>
      <Route path="/suppliers">
        <SuppliersPage />
      </Route>
      <Route path="/customers">
        <CustomersPage />
      </Route>
      <Route path="/staff">
        <StaffPage />
      </Route>
      <Route path="/marketing">
        <MarketingPage />
      </Route>
      <Route path="/promotions">
        <PromotionsPage />
      </Route>
      <Route path="/products">
        <ProductsPage />
      </Route>
      <Route path="/invoices">
        <InvoicesPage />
      </Route>
      <Route path="/installments">
        <InstallmentsPage />
      </Route>
      <Route path="/expenses">
        <ExpensesPage />
      </Route>
      <Route path="/expense-categories">
        <ExpenseCategoriesPage />
      </Route>
      <Route path="/reports">
        <ReportsPage />
      </Route>
      <Route path="/inventory-reports">
        <InventoryReportsPage />
      </Route>
      <Route path="/barcodes">
        <BarcodesPage />
      </Route>
      <Route path="/settings">
        <SettingsPage />
      </Route>
      <Route path="/appointments">
        <AppointmentsPage />
      </Route>
      <Route>
        <NotFound />
      </Route>
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