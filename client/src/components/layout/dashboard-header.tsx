import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  const { data: lowStockProducts } = useQuery({
    queryKey: ["/api/products/low-stock"],
    queryFn: async () => {
      const res = await fetch("/api/products/low-stock");
      if (!res.ok) throw new Error("فشل في جلب المنتجات");
      return res.json();
    },
  });

  const lowStockCount = lowStockProducts?.length || 0;

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {lowStockCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full"
              >
                {lowStockCount}
              </Badge>
            )}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">تنبيهات المخزون</h4>
            {lowStockCount > 0 ? (
              <div className="space-y-1">
                {lowStockProducts?.map((product: any) => (
                  <div key={product.id} className="text-sm flex justify-between items-center">
                    <span>{product.name}</span>
                    <Badge variant="outline">المتبقي: {product.quantity}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد منتجات منخفضة المخزون</p>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}
