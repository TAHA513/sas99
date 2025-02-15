import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useState } from "react";
import { FileSpreadsheet, BarChart3, Package } from "lucide-react";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import type { Product, Invoice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getStoreSettings } from "@/lib/storage";

export default function ReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  } | undefined>();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const storeSettings = getStoreSettings();
  const defaultCurrency = storeSettings.currencySettings?.defaultCurrency || 'USD';
  const secondaryCurrency = storeSettings.currencySettings?.secondaryCurrency || 'JOD'; // Added secondary currency


  // Helper function to format currency with both values
  const formatCurrency = (amount: number, bothCurrencies: boolean = false): string => {
    const usdAmount = `${amount.toFixed(2)} دولار`;
    const jodAmount = `${amount.toFixed(2)} دينار`;
    return bothCurrencies ? `${usdAmount} / ${jodAmount}` : (defaultCurrency === 'USD' ? usdAmount : jodAmount);
  };

  // Filter invoices by date range
  const filteredInvoices = invoices?.filter(invoice => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const invoiceDate = new Date(invoice.date);
    return invoiceDate >= dateRange.from && invoiceDate <= dateRange.to;
  });

  // Calculate sales statistics
  const salesStats = {
    totalSales: filteredInvoices?.reduce((sum, inv) => sum + inv.finalTotal, 0) || 0,
    totalInvoices: filteredInvoices?.length || 0,
    averageInvoice: filteredInvoices?.length
      ? (filteredInvoices.reduce((sum, inv) => sum + inv.finalTotal, 0) / filteredInvoices.length)
      : 0
  };

  // Get inventory status
  const inventoryStats = {
    totalProducts: products?.length || 0,
    lowStock: products?.filter(p => p.quantity <= p.minimumQuantity).length || 0,
    outOfStock: products?.filter(p => p.quantity <= 0).length || 0
  };

  const exportSalesReport = () => {
    if (!filteredInvoices) return;

    const workbook = XLSX.utils.book_new();

    // Prepare sales data
    const salesData = filteredInvoices.map(invoice => ({
      'رقم الفاتورة': invoice.id,
      'التاريخ': format(new Date(invoice.date), 'dd/MM/yyyy', { locale: ar }),
      'العميل': invoice.customerName || 'عميل نقدي',
      'المجموع': formatCurrency(invoice.subtotal, true),
      'الخصم': formatCurrency(invoice.discountAmount, true),
      'الإجمالي': formatCurrency(invoice.finalTotal, true)
    }));

    const worksheet = XLSX.utils.json_to_sheet(salesData, { RTL: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المبيعات');

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_المبيعات_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "تم تصدير التقرير",
      description: "تم تصدير تقرير المبيعات بنجاح",
    });
  };

  const exportInventoryReport = () => {
    if (!products) return;

    const workbook = XLSX.utils.book_new();

    // Prepare inventory data
    const inventoryData = products.map(product => ({
      'اسم المنتج': product.name,
      'الباركود': product.barcode || '-',
      'الكمية الحالية': product.quantity,
      'الحد الأدنى': product.minimumQuantity,
      'حالة المخزون': product.quantity <= 0 ? 'نفذ المخزون' :
                      product.quantity <= product.minimumQuantity ? 'منخفض' : 'جيد',
      'سعر التكلفة': formatCurrency(product.costPrice, true),
      'سعر البيع': formatCurrency(product.sellingPrice, true)
    }));

    const worksheet = XLSX.utils.json_to_sheet(inventoryData, { RTL: true });
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المخزون');

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_المخزون_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "تم تصدير التقرير",
      description: "تم تصدير تقرير المخزون بنجاح",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">التقارير</h1>
        </div>

        <Tabs defaultValue="sales">
          <TabsList>
            <TabsTrigger value="sales">
              <BarChart3 className="h-4 w-4 ml-2" />
              تقارير المبيعات
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="h-4 w-4 ml-2" />
              تقارير المخزون
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="flex justify-between items-center">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              <Button onClick={exportSalesReport}>
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إجمالي المبيعات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(salesStats.totalSales, true)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">عدد الفواتير</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{salesStats.totalInvoices}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">متوسط قيمة الفاتورة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(salesStats.averageInvoice, true)}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={exportInventoryReport}>
                <FileSpreadsheet className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إجمالي المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{inventoryStats.totalProducts}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">منتجات منخفضة المخزون</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">منتجات نفذت من المخزون</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}