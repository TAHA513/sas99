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
import { Loader2, Calendar, DollarSign, Package, AlertCircle, Printer, FileDown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import * as XLSX from 'xlsx';

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
  const [searchTermSales, setSearchTermSales] = useState("");
  const [searchTermAppointments, setSearchTermAppointments] = useState("");

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

  // Calculate summary stats
  const totalSales = todaySales?.reduce((sum: number, sale: any) => sum + Number(sale.amount), 0) || 0;
  const totalAppointments = appointments?.length || 0;

  // Filter functions
  const filteredSales = todaySales?.filter((sale: any) => {
    const searchLower = searchTermSales.toLowerCase();
    return (
      sale.id.toString().includes(searchLower) ||
      (sale.customerName || 'عميل نقدي').toLowerCase().includes(searchLower) ||
      sale.amount.toString().includes(searchLower)
    );
  });

  const filteredAppointments = appointments?.filter((appointment: any) => {
    const searchLower = searchTermAppointments.toLowerCase();
    return (
      appointment.customerName.toLowerCase().includes(searchLower) ||
      appointment.customerPhone.includes(searchLower)
    );
  });

  // Export functions
  const exportDailyReport = () => {
    if (!todaySales?.length && !appointments?.length) {
      // No data to export
      alert('لا توجد بيانات للتصدير');
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      let hasData = false;

      if (todaySales?.length > 0) {
        const salesData = todaySales.map((sale: any) => ({
          'رقم الفاتورة': sale.id,
          'اسم العميل': sale.customerName || 'عميل نقدي',
          'المبلغ': `${Number(sale.amount).toLocaleString()} د.ع`,
          'التاريخ': new Date(sale.date).toLocaleString('ar-IQ'),
          'الحالة': sale.status === 'completed' ? 'مكتمل' :
                    sale.status === 'pending' ? 'معلق' : 'ملغي'
        }));

        const ws1 = XLSX.utils.json_to_sheet(salesData);
        XLSX.utils.book_append_sheet(wb, ws1, "المبيعات");
        hasData = true;
      }

      if (appointments?.length > 0) {
        const appointmentsData = appointments.map((appointment: any) => ({
          'وقت الموعد': new Date(appointment.time).toLocaleString('ar-IQ'),
          'اسم العميل': appointment.customerName,
          'رقم الهاتف': appointment.customerPhone,
          'الحالة': appointment.status === 'completed' ? 'مكتمل' :
                    appointment.status === 'pending' ? 'معلق' : 'ملغي'
        }));

        const ws2 = XLSX.utils.json_to_sheet(appointmentsData);
        XLSX.utils.book_append_sheet(wb, ws2, "المواعيد");
        hasData = true;
      }

      if (hasData) {
        const fileName = `تقرير_يومي_${new Date().toLocaleDateString('ar-IQ')}.xlsx`;
        XLSX.writeFile(wb, fileName);
      } else {
        alert('لا توجد بيانات للتصدير');
      }
    } catch (error) {
      console.error('خطأ في تصدير التقرير:', error);
      alert('حدث خطأ أثناء تصدير التقرير');
    }
  };

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
          <Button
            variant="outline"
            onClick={() => setLocation("/invoices")}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            الفواتير
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">إجمالي المبيعات اليوم</h3>
              <p className="text-2xl font-bold">{totalSales.toLocaleString()} د.ع</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">مواعيد اليوم</h3>
              <p className="text-2xl font-bold">{totalAppointments}</p>
            </div>
          </div>
        </Card>
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
          <div>
            <h2 className="text-lg font-semibold">مبيعات اليوم</h2>
            <span className="text-muted-foreground text-sm">
              {new Date().toLocaleDateString('ar-IQ')}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={exportDailyReport}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            تصدير التقرير
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="البحث في المبيعات..."
            value={searchTermSales}
            onChange={(e) => setSearchTermSales(e.target.value)}
            className="max-w-sm"
          />
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
              ) : filteredSales?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales?.map((sale: any) => (
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

        <div className="mb-4">
          <Input
            placeholder="البحث في المواعيد..."
            value={searchTermAppointments}
            onChange={(e) => setSearchTermAppointments(e.target.value)}
            className="max-w-sm"
          />
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
              ) : filteredAppointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments?.map((appointment: any) => (
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