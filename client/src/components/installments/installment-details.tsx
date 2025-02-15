import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { InstallmentPlan, InstallmentPayment, Invoice } from "@shared/schema";
import { formatCurrency } from "@/lib/storage";
import { Printer, Download, Share2 } from "lucide-react"; 
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InstallmentDetailsProps {
  plan: InstallmentPlan;
  payments: InstallmentPayment[];
  onRecordPayment: () => void;
}

export function InstallmentDetails({ plan, payments, onRecordPayment }: InstallmentDetailsProps) {
  // Fetch invoice details
  const { data: invoice } = useQuery<Invoice>({
    queryKey: ["/api/invoices", plan.invoiceId],
    enabled: !!plan.invoiceId,
  });

  // حساب تقدم الخطة
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const progressPercentage = (totalPaid / Number(plan.totalAmount)) * 100;
  const remainingAmount = Number(plan.remainingAmount);
  const nextPaymentDue = new Date(plan.startDate);
  nextPaymentDue.setMonth(nextPaymentDue.getMonth() + payments.length);

  // إنشاء محتوى الفاتورة
  const getInvoiceContent = () => {
    return `
      <html dir="rtl">
        <head>
          <title>فاتورة تقسيط - ${plan.customerName}</title>
          <style>
            @font-face {
              font-family: 'Cairo';
              src: url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');
            }
            body { 
              font-family: 'Cairo', Arial, sans-serif; 
              padding: 20px;
              direction: rtl;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
            }
            .details { 
              margin-bottom: 20px;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            .table th, .table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: right;
            }
            .table th {
              background: #f5f5f5;
            }
            .total { 
              text-align: left; 
              margin-top: 20px;
              padding: 15px;
              border-top: 2px solid #eee;
            }
            .signature {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature div {
              width: 200px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 50px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>فاتورة تقسيط</h1>
            <p>رقم الفاتورة: ${plan.invoiceId}</p>
            <p>التاريخ: ${format(new Date(plan.startDate), 'dd MMMM yyyy', { locale: ar })}</p>
          </div>

          <div class="details">
            <h3>معلومات العميل:</h3>
            <p>الاسم: ${plan.customerName}</p>
            <p>رقم الهاتف: ${plan.phoneNumber}</p>
            <p>رقم الهوية: ${plan.identityDocument}</p>
            ${plan.guarantorName ? `
              <h3>معلومات الكفيل:</h3>
              <p>الاسم: ${plan.guarantorName}</p>
              <p>رقم الهاتف: ${plan.guarantorPhone}</p>
            ` : ''}
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${invoice?.items.map(item => `
                <tr>
                  <td>${item.productId}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price, true)}</td>
                  <td>${formatCurrency(item.total, true)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <p>المبلغ الإجمالي: ${formatCurrency(Number(plan.totalAmount), true)}</p>
            <p>الدفعة الأولى: ${formatCurrency(Number(plan.downPayment), true)}</p>
            <p>المبلغ المتبقي: ${formatCurrency(Number(plan.remainingAmount), true)}</p>
            <p>عدد الأقساط: ${plan.numberOfInstallments}</p>
            <p>قيمة القسط: ${formatCurrency(Number(plan.installmentAmount), true)}</p>
          </div>

          <div class="signature">
            <div>
              <p class="signature-line"></p>
              <p>توقيع العميل</p>
            </div>
            <div>
              <p class="signature-line"></p>
              <p>توقيع الموظف المسؤول</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // طباعة الفاتورة
  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getInvoiceContent());
      printWindow.document.close();
      printWindow.print();
    }
  };

  // حفظ الفاتورة
  const saveInvoice = () => {
    const blob = new Blob([getInvoiceContent()], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `فاتورة_تقسيط_${plan.invoiceId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* أزرار الطباعة والحفظ */}
      <div className="flex justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 ml-2" />
              خيارات الفاتورة
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={printInvoice}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة الفاتورة
            </DropdownMenuItem>
            <DropdownMenuItem onClick={saveInvoice}>
              <Download className="h-4 w-4 ml-2" />
              حفظ الفاتورة
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* تفاصيل المنتجات */}
      {invoice && (
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.price, true)}</TableCell>
                    <TableCell>{formatCurrency(item.total, true)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* معلومات العميل */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات العميل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">اسم العميل</p>
              <p className="font-medium">{plan.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الهاتف</p>
              <p className="font-medium">{plan.phoneNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">رقم الهوية</p>
              <p className="font-medium">{plan.identityDocument}</p>
            </div>
            {plan.guarantorName && (
              <div>
                <p className="text-sm text-muted-foreground">الكفيل</p>
                <p className="font-medium">{plan.guarantorName}</p>
                <p className="text-sm">{plan.guarantorPhone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل الخطة */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل خطة التقسيط</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
              <p className="text-xl font-bold">{formatCurrency(Number(plan.totalAmount), true)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الدفعة الأولى</p>
              <p className="text-xl font-bold">{formatCurrency(Number(plan.downPayment), true)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المبلغ المتبقي</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(remainingAmount, true)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">القسط الشهري</p>
              <p className="text-xl font-bold">{formatCurrency(Number(plan.installmentAmount), true)}</p>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>تقدم السداد</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">القسط القادم</p>
              <p className="font-medium">
                {format(nextPaymentDue, 'dd MMMM yyyy', { locale: ar })}
              </p>
            </div>
            <Badge className={getStatusBadge(plan.status).color}>
              {getStatusBadge(plan.status).label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* سجل المدفوعات */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سجل المدفوعات</CardTitle>
          <Button onClick={onRecordPayment} disabled={plan.status !== 'active'}>
            تسجيل دفعة جديدة
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-2 border rounded-lg"
              >
                <div>
                  <p className="font-medium">القسط {payment.paymentNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payment.paymentDate), 'dd MMMM yyyy', { locale: ar })}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold">{formatCurrency(Number(payment.amount), true)}</p>
                  <Badge
                    className={
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {payment.status === 'paid' ? 'تم الدفع' : 'متأخر'}
                  </Badge>
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                لا توجد مدفوعات مسجلة بعد
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// تنسيق حالة القسط
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "نشط", color: "bg-green-100 text-green-800" },
    completed: { label: "مكتمل", color: "bg-blue-100 text-blue-800" },
    overdue: { label: "متأخر", color: "bg-red-100 text-red-800" },
    cancelled: { label: "ملغي", color: "bg-gray-100 text-gray-800" },
  };

  return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
};