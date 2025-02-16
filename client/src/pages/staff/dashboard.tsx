import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Loader2, Calendar, DollarSign, Package, AlertCircle, Printer } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

// Loading skeleton component
const SkeletonRow = () => (
  <TableRow className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 w-24 bg-muted rounded" />
      </TableCell>
    ))}
  </TableRow>
);

export default function StaffDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Prefetch data
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["/api/sales/today"],
      staleTime: 1000 * 60 * 2,
    });
    queryClient.prefetchQuery({
      queryKey: ["/api/appointments/today"],
      staleTime: 1000 * 60 * 2,
    });
  }, [queryClient]);

  const { data: todaySales, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales/today"],
    staleTime: 1000 * 60 * 2,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/today"],
    staleTime: 1000 * 60 * 2,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
    staleTime: 1000 * 60 * 5,
  });

  // Handle invoice printing
  const handlePrintInvoice = (invoice: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة رقم #${invoice.id}</title>
          <style>
            @media print {
              body { font-family: Arial, sans-serif; padding: 20px; }
              .invoice-header { text-align: center; margin-bottom: 30px; }
              .invoice-details { margin-bottom: 20px; }
              .invoice-table { width: 100%; border-collapse: collapse; }
              .invoice-table th, .invoice-table td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: right;
              }
              .total { margin-top: 20px; text-align: left; }
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
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>المجموع</th>
            </tr>
            ${invoice.items?.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price} د.ع</td>
                <td>${item.total} د.ع</td>
              </tr>
            `).join('') || ''}
          </table>
          <div class="total">
            <h3>المجموع الكلي: ${Number(invoice.amount).toLocaleString()} د.ع</h3>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">لوحة تحكم الموظفين</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation("/appointments")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            المواعيد
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/products")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            المخزون
          </Button>
        </div>
      </div>

      {/* Alert Section */}
      {alerts?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h2 className="font-semibold">تنبيهات هامة</h2>
          </div>
          <ul className="space-y-1 text-red-600">
            {alerts.map((alert: any, index: number) => (
              <li key={index}>{alert.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Today's Sales */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">مبيعات اليوم</h2>
          <span className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('ar-IQ')}
          </span>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesLoading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
              ) : todaySales?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    لا توجد مبيعات لهذا اليوم
                  </TableCell>
                </TableRow>
              ) : (
                todaySales?.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell>#{sale.id}</TableCell>
                    <TableCell>{sale.customerName || 'عميل نقدي'}</TableCell>
                    <TableCell>{Number(sale.amount).toLocaleString()} د.ع</TableCell>
                    <TableCell>{new Date(sale.date).toLocaleTimeString('ar-IQ')}</TableCell>
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
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Today's Appointments */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">مواعيد اليوم</h2>
          <Button
            variant="link"
            onClick={() => setLocation("/appointments")}
            className="text-primary"
          >
            عرض كل المواعيد
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الوقت</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointmentsLoading ? (
                [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
              ) : appointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    لا توجد مواعيد لهذا اليوم
                  </TableCell>
                </TableRow>
              ) : (
                appointments?.map((appointment: any) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{new Date(appointment.time).toLocaleTimeString('ar-IQ')}</TableCell>
                    <TableCell>{appointment.customerName}</TableCell>
                    <TableCell dir="ltr">{appointment.customerPhone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status === 'completed' ? 'مكتمل' :
                         appointment.status === 'pending' ? 'معلق' : 'ملغي'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}