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
import { InsertInstallmentPayment, insertInstallmentPaymentSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface PaymentFormProps {
  planId: number;
  nextPaymentNumber: number;
  expectedAmount: number;
  onSuccess?: () => void;
}

export function PaymentForm({ planId, nextPaymentNumber, expectedAmount, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertInstallmentPayment>({
    resolver: zodResolver(insertInstallmentPaymentSchema),
    defaultValues: {
      planId,
      paymentNumber: nextPaymentNumber,
      amount: expectedAmount,
      paymentDate: new Date().toISOString(),
      status: 'paid',
      notes: '',
    },
  });

  const onSubmit = async (data: InsertInstallmentPayment) => {
    try {
      await apiRequest("POST", "/api/installment-payments", data);

      // تحديث البيانات
      queryClient.invalidateQueries({ queryKey: ['/api/installment-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/installment-payments'] });

      toast({
        title: "تم تسجيل الدفعة",
        description: "تم تسجيل الدفعة بنجاح",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدفعة",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ الدفع</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={e => field.onChange(new Date(e.target.value).toISOString())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">تسجيل الدفعة</Button>
      </form>
    </Form>
  );
}