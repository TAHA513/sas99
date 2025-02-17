import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Package, Truck, DollarSign, Plus } from "lucide-react";
import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { formatCurrency } from "@/lib/storage";
import { PurchaseForm } from "@/components/purchases/purchase-form";

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // جلب طلبات الشراء
  const { data: purchases } = useQuery({
    queryKey: ["/api/purchase-orders"],
  });

  // فلترة الطلبات حسب البحث
  const filteredPurchases = purchases?.filter(purchase =>
    purchase.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.id.toString().includes(searchTerm)
  );

  // حساب الإحصائيات
  const todayPurchases = purchases?.filter(purchase => 
    new Date(purchase.createdAt).toDateString() === new Date().toDateString()
  )?.length || 0;

  const totalProducts = purchases?.reduce((sum, purchase) => 
    sum + purchase.items.length, 0
  ) || 0;

  const activeSuppliers = new Set(
    purchases?.map(purchase => purchase.supplierId)
  ).size || 0;

  const totalAmount = purchases?.reduce((sum, purchase) => 
    sum + Number(purchase.totalAmount), 0
  ) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">نظام المشتريات</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                طلب شراء جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>إنشاء طلب شراء جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل طلب الشراء مع تحديد المورد والمنتجات المطلوبة
                </DialogDescription>
              </DialogHeader>
              <PurchaseForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">طلبات اليوم</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayPurchases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المنتجات المطلوبة</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الموردين النشطين</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSuppliers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount, true)}</div>
            </CardContent>
          </Card>
        </div>

        {/* البحث */}
        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في طلبات الشراء..."
          />
        </div>

        {/* جدول طلبات الشراء */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المنتجات</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases?.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.id}</TableCell>
                  <TableCell>{purchase.supplier?.name}</TableCell>
                  <TableCell>
                    {format(new Date(purchase.createdAt), 'dd MMMM yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell>{purchase.items.length} منتج</TableCell>
                  <TableCell>{formatCurrency(Number(purchase.totalAmount), true)}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {purchase.status === 'completed' ? 'مكتمل' :
                       purchase.status === 'pending' ? 'قيد الإنتظار' : 'ملغي'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      عرض التفاصيل
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredPurchases || filteredPurchases.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات شراء حالياً
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