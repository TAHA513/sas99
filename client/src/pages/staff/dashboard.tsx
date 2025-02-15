import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Calendar, DollarSign, Package, Users, Clock, Printer } from "lucide-react";
import { Link, useLocation } from "wouter";

// Loading skeleton components
const CardSkeleton = () => (
  <Card className="p-6 hover:shadow-lg transition-shadow animate-pulse">
    <div className="flex items-center gap-4">
      <div className="p-4 bg-muted rounded-full" />
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-6 w-16 bg-muted rounded" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
    </div>
  </Card>
);

const TableSkeleton = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>...</TableHead>
        <TableHead>...</TableHead>
        <TableHead>...</TableHead>
        <TableHead>...</TableHead>
        <TableHead>...</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          {[...Array(5)].map((_, j) => (
            <TableCell key={j}>
              <div className="h-4 w-24 bg-muted rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function StaffDashboard() {
  const [, setLocation] = useLocation();

  // Function to handle invoice printing
  const handlePrintInvoice = (invoice: any) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Add print styles
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة رقم #${invoice.id}</title>
          <style>
            @media print {
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              .invoice-header {
                text-align: center;
                margin-bottom: 30px;
              }
              .invoice-details {
                margin-bottom: 20px;
              }
              .invoice-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              .invoice-table th,
              .invoice-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
              }
              .invoice-total {
                text-align: left;
                margin-top: 20px;
              }
              .status-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
              }
              .status-completed { background: #dcfce7; color: #166534; }
              .status-pending { background: #fef9c3; color: #854d0e; }
              .status-cancelled { background: #fee2e2; color: #991b1b; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <h1>فاتورة</h1>
            <p>رقم الفاتورة: #${invoice.id}</p>
          </div>
          <div class="invoice-details">
            <p>التاريخ: ${new Date(invoice.date).toLocaleDateString('ar-IQ')}</p>
            <p>العميل: ${invoice.customerName || 'عميل نقدي'}</p>
          </div>
          <table class="invoice-table">
            <tr>
              <th>رقم الفاتورة</th>
              <th>العميل</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
              <th>الحالة</th>
            </tr>
            <tr>
              <td>#${invoice.id}</td>
              <td>${invoice.customerName || 'عميل نقدي'}</td>
              <td>${Number(invoice.amount).toLocaleString()} د.ع</td>
              <td>${new Date(invoice.date).toLocaleString('ar-IQ')}</td>
              <td>
                <span class="status-badge status-${invoice.status}">
                  ${invoice.status === 'completed' ? 'مكتمل' :
                    invoice.status === 'pending' ? 'معلق' : 'ملغي'}
                </span>
              </td>
            </tr>
          </table>
          <div class="invoice-total">
            <h3>المجموع الكلي: ${Number(invoice.amount).toLocaleString()} د.ع</h3>
          </div>
        </body>
      </html>
    `);

    // Print and close the window
    printWindow.document.close();
    printWindow.print();
  };

  // Parallel queries with better caching
  const { data: quickStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/staff/quick-stats"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: todaySales, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales/today"],
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/today"],
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  const { data: lowStockProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products/low-stock"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Show loading skeleton instead of full-page loader
  const isInitialLoading = statsLoading && salesLoading && appointmentsLoading && productsLoading;

  if (isInitialLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded mt-2 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        <Card className="p-6">
          <div className="animate-pulse mb-6">
            <div className="h-6 w-32 bg-muted rounded" />
          </div>
          <div className="rounded-md border">
            <TableSkeleton />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">لوحة تحكم الموظفين</h1>
          <p className="text-muted-foreground">
            مرحباً بك في نظام إدارة الأعمال، اليوم {new Date().toLocaleDateString('ar-IQ')}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setLocation("/products")} className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            إدارة المنتجات
          </Button>
          <Button onClick={() => setLocation("/appointments")} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            إدارة المواعيد
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            طباعة التقرير
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* المبيعات اليومية */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">المبيعات اليومية</h2>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                ) : (
                  `${quickStats?.totalSales?.toLocaleString()} د.ع`
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {quickStats?.salesCount} فاتورة
              </div>
            </div>
          </div>
        </Card>
        {/* other cards remain the same */}
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">المبيعات الأخيرة</h2>
              <p className="text-sm text-muted-foreground">آخر المبيعات المسجلة في النظام</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/invoices")} className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              عرض كل المبيعات
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>اسم العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesLoading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-24 bg-muted rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  todaySales?.items?.map((sale: any) => (
                    <TableRow key={sale.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{sale.customerName || 'عميل نقدي'}</TableCell>
                      <TableCell>{Number(sale.amount).toLocaleString()} د.ع</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleString('ar-IQ')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                          sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sale.status === 'completed' ? 'مكتمل' :
                           sale.status === 'pending' ? 'معلق' : 'ملغي'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintInvoice(sale)}
                          className="flex items-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          طباعة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
        {/* Appointments and Low Stock tables remain unchanged */}
      </div>
    </div>
  );
}