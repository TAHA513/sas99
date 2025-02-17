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
import { Card, CardContent } from "@/components/ui/card";
import { Search, Barcode } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [barcode, setBarcode] = useState("");

  // جلب قائمة المنتجات
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // فلترة المنتجات حسب البحث
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchTerm))
  );

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

  // إضافة منتج باستخدام الباركود
  const handleBarcodeSubmit = () => {
    if (!barcode) return;

    const product = products?.find(p => p.barcode === barcode);
    if (product) {
      addProduct(product.id.toString(), 1);
      setBarcode("");
    } else {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على المنتج",
        variant: "destructive",
      });
    }
  };

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
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* البحث والباركود */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث عن منتج..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="إدخال الباركود..."
                      className="pl-10"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSubmit()}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleBarcodeSubmit}
                  >
                    إضافة
                  </Button>
                </div>
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
                        {formatCurrency(Number(product.sellingPrice), true)}
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