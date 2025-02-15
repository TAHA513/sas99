import { useAuth } from "@/hooks/use-auth";
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
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export default function StaffDashboard() {
  const { user } = useAuth();
  
  // Redirect if not staff
  if (user?.role !== "staff") {
    return <Redirect to="/" />;
  }

  const { data: todaySales, isLoading: salesLoading } = useQuery({
    queryKey: ["/api/sales/today"],
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments/today"],
  });

  const { data: lowStockProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products/low-stock"],
  });

  if (salesLoading || appointmentsLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">لوحة تحكم الموظفين</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* المبيعات اليومية */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">المبيعات اليومية</h2>
          <div className="text-2xl font-bold">{todaySales?.total || 0} د.ع</div>
          <div className="text-sm text-muted-foreground">
            {todaySales?.count || 0} فاتورة
          </div>
        </Card>

        {/* المواعيد اليوم */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">مواعيد اليوم</h2>
          <div className="text-2xl font-bold">{appointments?.length || 0}</div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.href = '/appointments'}
          >
            عرض المواعيد
          </Button>
        </Card>

        {/* تنبيهات المخزون */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">تنبيهات المخزون</h2>
          <div className="text-2xl font-bold text-red-500">
            {lowStockProducts?.length || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            منتجات تحتاج إعادة طلب
          </div>
        </Card>
      </div>

      {/* جدول المبيعات الأخيرة */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">المبيعات الأخيرة</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الفاتورة</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todaySales?.items?.map((sale: any) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id}</TableCell>
                <TableCell>{sale.amount} د.ع</TableCell>
                <TableCell>{new Date(sale.date).toLocaleString('ar-IQ')}</TableCell>
                <TableCell>{sale.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
