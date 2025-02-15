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
import { InsertInstallmentPlan, insertInstallmentPlanSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";

export function InstallmentForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

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

  // مراقبة التغييرات في الحقول الرئيسية وحساب الأقساط
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (isUpdating) return;

      if (name === 'totalAmount' || name === 'downPayment' || name === 'numberOfInstallments') {
        const total = value.totalAmount || 0;
        const downPayment = value.downPayment || 0;
        const numberOfInstallments = value.numberOfInstallments || 1;

        if (total && downPayment && numberOfInstallments) {
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
      await apiRequest("POST", "/api/installment-plans", data);

      queryClient.invalidateQueries({ queryKey: ['/api/installment-plans'] });

      toast({
        title: "تم إنشاء خطة التقسيط",
        description: "تم إنشاء خطة التقسيط بنجاح",
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

          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المبلغ الإجمالي</FormLabel>
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

        <div className="grid gap-4 md:grid-cols-2 border-t pt-4 mt-4">
          <div>
            <FormLabel>المبلغ المتبقي</FormLabel>
            <p className="text-2xl font-bold mt-1">
              {form.watch("remainingAmount").toFixed(2)}
            </p>
          </div>

          <div>
            <FormLabel>قيمة القسط الشهري</FormLabel>
            <p className="text-2xl font-bold mt-1">
              {form.watch("installmentAmount").toFixed(2)}
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full">إنشاء خطة التقسيط</Button>
      </form>
    </Form>
  );
}