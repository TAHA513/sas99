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
import { InsertInstallmentPlan, insertInstallmentPlanSchema, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/storage";

interface ProductItem {
  productId: number;
  quantity: number;
  price: number;
  total: number;
}

export function InstallmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);

  // جلب قائمة المنتجات
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<InsertInstallmentPlan>({
    resolver: zodResolver(insertInstallmentPlanSchema),
    defaultValues: {
      totalAmount: 0,
      downPayment: 0,
      numberOfInstallments: 1,
      installmentAmount: 0,
      remainingAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  // إضافة منتج إلى القائمة
  const addProduct = (productId: string, quantity: number) => {
    const product = products?.find(p => p.id === Number(productId));
    if (product) {
      const total = Number(product.sellingPrice) * quantity;
      setSelectedProducts(prev => [
        ...prev,
        {
          productId: product.id,
          quantity,
          price: Number(product.sellingPrice),
          total
        }
      ]);
    }
  };

  // حذف منتج من القائمة
  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  // حساب المبلغ الإجمالي
  useEffect(() => {
    const total = selectedProducts.reduce((sum, item) => sum + item.total, 0);
    form.setValue("totalAmount", total);
  }, [selectedProducts, form]);

  // مراقبة التغييرات في الحقول الرئيسية وحساب الأقساط
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (isUpdating) return;

      if (name === 'totalAmount' || name === 'downPayment' || name === 'numberOfInstallments') {
        const total = value.totalAmount || 0;
        const downPayment = value.downPayment || 0;
        const numberOfInstallments = value.numberOfInstallments || 1;

        if (total && numberOfInstallments) {
          setIsUpdating(true);
          const remaining = total - downPayment;
          const installment = remaining / numberOfInstallments;

          form.setValue("remainingAmount", remaining);
          form.setValue("installmentAmount", installment);
          setIsUpdating(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isUpdating]);

  const onSubmit = async (data: InsertInstallmentPlan) => {
    try {
      // إنشاء الفاتورة أولاً
      const invoice = await apiRequest("POST", "/api/invoices", {
        customerName: data.customerName,
        items: selectedProducts,
        subtotal: data.totalAmount,
        discount: 0,
        discountAmount: 0,
        finalTotal: data.totalAmount,
        note: "فاتورة تقسيط",
      });

      // إنشاء خطة التقسيط مع ربطها بالفاتورة
      const installmentPlan = await apiRequest("POST", "/api/installment-plans", {
        ...data,
        invoiceId: invoice.id,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/installment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });

      toast({
        title: "تم إنشاء خطة التقسيط",
        description: "تم إنشاء خطة التقسيط والفاتورة بنجاح",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء خطة التقسيط",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم العميل</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* اختيار المنتجات */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select onValueChange={(value) => addProduct(value, 1)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="اختر منتج" />
              </SelectTrigger>
              <SelectContent>
                {products?.map(product => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name} - {formatCurrency(Number(product.sellingPrice), true)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.price, true)}</TableCell>
                      <TableCell>{formatCurrency(item.total, true)}</TableCell>
                      <TableCell>
                        <Button
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

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="downPayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الدفعة الأولى</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberOfInstallments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عدد الأقساط</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    {...field} 
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ بداية التقسيط</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identityDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهوية</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guarantorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم الكفيل (اختياري)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="guarantorPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم هاتف الكفيل (اختياري)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3 border-t pt-4 mt-4">
          <div>
            <FormLabel>المبلغ الإجمالي</FormLabel>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(form.watch("totalAmount"), true)}
            </p>
          </div>

          <div>
            <FormLabel>المبلغ المتبقي</FormLabel>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(form.watch("remainingAmount"), true)}
            </p>
          </div>

          <div>
            <FormLabel>قيمة القسط الشهري</FormLabel>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(form.watch("installmentAmount"), true)}
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full">إنشاء خطة التقسيط</Button>
      </form>
    </Form>
  );
}