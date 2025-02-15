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
import { InstallmentPlan } from "@shared/schema";
import { CreditCard, Plus, Search } from "lucide-react";
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

export default function InstallmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: installmentPlans } = useQuery<InstallmentPlan[]>({
    queryKey: ["/api/installment-plans"],
  });

  // Filter plans based on search term
  const filteredPlans = installmentPlans?.filter((plan) =>
    plan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals for stats
  const totalActiveAmount = filteredPlans
    ?.filter(plan => plan.status === 'active')
    .reduce((sum, plan) => sum + Number(plan.remainingAmount), 0) || 0;

  const totalCollected = filteredPlans
    ?.reduce((sum, plan) => sum + (Number(plan.totalAmount) - Number(plan.remainingAmount)), 0) || 0;

  const overdueCount = filteredPlans
    ?.filter(plan => plan.status === 'overdue').length || 0;

  // Status badge styling
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
              {/* Form component will be added here */}
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
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

        {/* Search */}
        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في خطط التقسيط..."
          />
        </div>

        {/* Installment Plans Table */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans?.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {plan.customerName}
                    <p className="text-sm text-muted-foreground">{plan.phoneNumber}</p>
                  </TableCell>
                  <TableCell>{plan.invoiceId}</TableCell>
                  <TableCell>{formatCurrency(Number(plan.totalAmount), true)}</TableCell>
                  <TableCell>{formatCurrency(Number(plan.downPayment), true)}</TableCell>
                  <TableCell>{formatCurrency(Number(plan.remainingAmount), true)}</TableCell>
                  <TableCell>{plan.numberOfInstallments}</TableCell>
                  <TableCell>{formatCurrency(Number(plan.installmentAmount), true)}</TableCell>
                  <TableCell>
                    {format(new Date(plan.startDate), 'dd MMMM yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(plan.status).color}>
                      {getStatusBadge(plan.status).label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPlans?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
