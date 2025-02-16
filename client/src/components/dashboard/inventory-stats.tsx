import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Package, AlertTriangle, TrendingDown } from "lucide-react";

export function InventoryStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/inventory/stats"],
    queryFn: async () => {
      const res = await fetch("/api/inventory/stats");
      if (!res.ok) throw new Error("فشل في جلب إحصائيات المخزون");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-1/2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          حدث خطأ أثناء جلب إحصائيات المخزون
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            منتج في المخزون
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">منتجات منخفضة المخزون</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.lowStockCount}</div>
          <p className="text-xs text-muted-foreground">
            تحتاج إلى إعادة الطلب
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المبيعات اليومية</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.dailySales}</div>
          <p className="text-xs text-muted-foreground">
            منتج تم بيعه اليوم
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
