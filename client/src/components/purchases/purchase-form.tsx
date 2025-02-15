import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertPurchaseOrder, insertPurchaseOrderSchema, Product, Supplier } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface PurchaseFormProps {
  onSuccess?: () => void;
}

interface PurchaseItem {
  productId: number;
  quantity: number;
  price: number;
  total: number;
}

export function PurchaseForm({ onSuccess }: PurchaseFormProps) {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<PurchaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // جلب قائمة المنتجات والموردين
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  // فلترة المنتجات حسب البحث
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

  const form = useForm<InsertPurchaseOrder>({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      supplierId: undefined,
      totalAmount: 0,
      status: 'pending',
      notes: '',
      items: [],
    },
  });

  // إضافة منتج إلى القائمة
  const addProduct = (productId: string, quantity: number) => {
    const product = products?.find(p => p.id === Number(productId));
    if (product) {
      const price = Number(product.purchasePrice) || 0;
      const total = price * quantity;
      setSelectedProducts(prev => [
        ...prev,
        {
          productId: product.id,
          quantity,
          price,
          total
        }
      ]);
    }
  };

  // حذف منتج من القائمة
  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  // تعديل كمية المنتج
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setSelectedProducts(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          quantity: newQuantity,
          total: item.price * newQuantity
        };
      }
      return item;
    }));
  };

  // حساب المبلغ الإجمالي
  useEffect(() => {
    const total = selectedProducts.reduce((sum, item) => sum + item.total, 0);
    form.setValue("totalAmount", total);
    form.setValue("items", selectedProducts);
  }, [selectedProducts, form]);

  const onSubmit = async (data: InsertPurchaseOrder) => {
    try {
      await apiRequest("POST", "/api/purchase-orders", data);
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });

      toast({
        title: "تم إنشاء طلب الشراء",
        description: "تم إنشاء طلب الشراء بنجاح",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء طلب الشراء",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المورد</FormLabel>
              <Select
                onValueChange={value => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers?.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* اختيار المنتجات */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* البحث */}
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن منتج..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* قائمة المنتجات المفلترة */}
              {searchTerm && filteredProducts && (
                <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex justify-between items-center p-2 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        addProduct(product.id.toString(), 1);
                        setSearchTerm("");
                      }}
                    >
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(Number(product.purchasePrice), true)}
                      </span>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-center py-2 text-muted-foreground">
                      لا توجد نتائج
                    </p>
                  )}
                </div>
              )}

              {/* جدول المنتجات المختارة */}
              {selectedProducts.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الكمية</TableHead>
                      <TableHead>السعر</TableHead>
                      <TableHead>الإجمالي</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.map((item, index) => {
                      const product = products?.find(p => p.id === item.productId);
                      return (
                        <TableRow key={index}>
                          <TableCell>{product?.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.price, true)}</TableCell>
                          <TableCell>{formatCurrency(item.total, true)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProduct(index)}
                            >
                              حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4 mt-4">
          <div>
            <FormLabel>المبلغ الإجمالي</FormLabel>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(form.watch("totalAmount"), true)}
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full">إنشاء طلب الشراء</Button>
      </form>
    </Form>
  );
}
