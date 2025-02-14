import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Barcode } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, ProductGroup } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/product-form";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

export default function ProductsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: groups } = useQuery<ProductGroup[]>({
    queryKey: ["/api/product-groups"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف المنتج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products?.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower) ||
      groups?.find(g => g.id === product.groupId)?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>إضافة منتج جديد</DialogTitle>
              </DialogHeader>
              <ProductForm groups={groups || []} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في المنتجات..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts?.map((product) => {
            const group = groups?.find((g) => g.id === product.groupId);
            return (
              <Card key={product.id}>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">{group?.name}</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {product.barcode && (
                      <div className="flex items-center">
                        <Barcode className="h-4 w-4 ml-2" />
                        <span className="text-sm">{product.barcode}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>النوع:</span>
                      <span>{product.type === "piece" ? "قطعة" : "وزن"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الكمية:</span>
                      <span>{product.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>سعر التكلفة:</span>
                      <span>{product.costPrice} ريال</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>سعر البيع:</span>
                      <span>{product.sellingPrice} ريال</span>
                    </div>
                    {product.isWeighted && (
                      <div className="flex justify-between text-sm">
                        <span>منتج وزني:</span>
                        <span>نعم</span>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>تعديل المنتج</DialogTitle>
                          </DialogHeader>
                          <ProductForm groups={groups || []} product={product} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredProducts?.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              لا توجد منتجات مطابقة لبحثك
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}