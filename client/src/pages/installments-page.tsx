import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { InstallmentPlan, InstallmentPayment, Invoice } from "@shared/schema";
import { CreditCard, Plus, Search, Printer, Download, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/storage";
import { InstallmentForm } from "@/components/installments/installment-form";
import { InstallmentDetails } from "@/components/installments/installment-details";
import { PaymentForm } from "@/components/installments/payment-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InstallmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { data: installmentPlans } = useQuery<InstallmentPlan[]>({
    queryKey: ["/api/installment-plans"],
  });

  const { data: installmentPayments } = useQuery<InstallmentPayment[]>({
    queryKey: ["/api/installment-payments"],
    enabled: !!selectedPlan,
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  // فلترة الخطط حسب البحث
  const filteredPlans = installmentPlans?.filter((plan) =>
    plan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حساب الإحصائيات
  const totalActiveAmount = filteredPlans
    ?.filter(plan => plan.status === 'active')
    .reduce((sum, plan) => sum + Number(plan.remainingAmount), 0) || 0;

  const totalCollected = filteredPlans
    ?.reduce((sum, plan) => sum + (Number(plan.totalAmount) - Number(plan.remainingAmount)), 0) || 0;

  const overdueCount = filteredPlans
    ?.filter(plan => plan.status === 'overdue').length || 0;

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

  // الحصول على المدفوعات للخطة المحددة
  const getPaymentsForPlan = (planId: number) => {
    return installmentPayments?.filter(payment => payment.planId === planId) || [];
  };

  // إنشاء محتوى الفاتورة
  const getInvoiceContent = (plan: InstallmentPlan) => {
    const invoice = invoices?.find(inv => inv.id === plan.invoiceId);
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
  const printInvoice = (plan: InstallmentPlan) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(getInvoiceContent(plan));
      printWindow.document.close();
      printWindow.print();
    }
  };

  // حفظ الفاتورة
  const saveInvoice = (plan: InstallmentPlan) => {
    const blob = new Blob([getInvoiceContent(plan)], { type: 'text/html' });
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
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">نظام البيع بالتقسيط</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                تقسيط جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>إنشاء خطة تقسيط جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات العميل وتفاصيل خطة التقسيط
                </DialogDescription>
              </DialogHeader>
              <InstallmentForm onSuccess={() => setSelectedPlan(null)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إجمالي المبالغ المتبقية</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalActiveAmount, true)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إجمالي المبالغ المحصلة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalCollected, true)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الأقساط المتأخرة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* البحث */}
        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في خطط التقسيط..."
          />
        </div>

        {/* جدول خطط التقسيط */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>المبلغ الإجمالي</TableHead>
                <TableHead>الدفعة الأولى</TableHead>
                <TableHead>المبلغ المتبقي</TableHead>
                <TableHead>عدد الأقساط</TableHead>
                <TableHead>القسط الشهري</TableHead>
                <TableHead>تاريخ البدء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans?.map((plan) => (
                <TableRow 
                  key={plan.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium" onClick={() => setSelectedPlan(plan)}>
                    {plan.customerName}
                    <p className="text-sm text-muted-foreground">{plan.phoneNumber}</p>
                  </TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>{plan.invoiceId}</TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>{formatCurrency(Number(plan.totalAmount), true)}</TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>{formatCurrency(Number(plan.downPayment), true)}</TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>{formatCurrency(Number(plan.remainingAmount), true)}</TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>{plan.numberOfInstallments}</TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>{formatCurrency(Number(plan.installmentAmount), true)}</TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>
                    {format(new Date(plan.startDate), 'dd MMMM yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell onClick={() => setSelectedPlan(plan)}>
                    <Badge className={getStatusBadge(plan.status).color}>
                      {getStatusBadge(plan.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => printInvoice(plan)}>
                          <Printer className="h-4 w-4 ml-2" />
                          طباعة الفاتورة
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => saveInvoice(plan)}>
                          <Download className="h-4 w-4 ml-2" />
                          حفظ الفاتورة
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPlans?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* تفاصيل الخطة المحددة */}
        {selectedPlan && (
          <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>تفاصيل خطة التقسيط</DialogTitle>
                <DialogDescription>
                  تفاصيل وسجل مدفوعات خطة التقسيط
                </DialogDescription>
              </DialogHeader>
              <InstallmentDetails
                plan={selectedPlan}
                payments={getPaymentsForPlan(selectedPlan.id)}
                onRecordPayment={() => setShowPaymentForm(true)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* نموذج تسجيل دفعة جديدة */}
        {showPaymentForm && selectedPlan && (
          <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
                <DialogDescription>
                  تسجيل دفعة جديدة لخطة التقسيط
                </DialogDescription>
              </DialogHeader>
              <PaymentForm
                planId={selectedPlan.id}
                nextPaymentNumber={getPaymentsForPlan(selectedPlan.id).length + 1}
                expectedAmount={Number(selectedPlan.installmentAmount)}
                onSuccess={() => setShowPaymentForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}