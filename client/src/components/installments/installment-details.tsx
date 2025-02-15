import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { InstallmentPlan, InstallmentPayment } from "@shared/schema";
import { formatCurrency } from "@/lib/storage";

interface InstallmentDetailsProps {
  plan: InstallmentPlan;
  payments: InstallmentPayment[];
  onRecordPayment: () => void;
}

export function InstallmentDetails({ plan, payments, onRecordPayment }: InstallmentDetailsProps) {
  // حساب تقدم الخطة
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const progressPercentage = (totalPaid / Number(plan.totalAmount)) * 100;
  const remainingAmount = Number(plan.remainingAmount);
  const nextPaymentDue = new Date(plan.startDate);
  nextPaymentDue.setMonth(nextPaymentDue.getMonth() + payments.length);

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

  return (
    <div className="space-y-4">
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
