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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertExpenseSchema, type InsertExpense } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";

export function ExpenseForm() {
  const { toast } = useToast();
  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      amount: 0,
      description: "",
      paymentMethod: "cash",
      recipient: "",
      status: "completed",
      date: new Date(),
      categoryId: 1,
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/expense-categories"],
  });

  const onSubmit = async (data: InsertExpense) => {
    try {
      await apiRequest("POST", "/api/expenses", data);

      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });

      toast({
        title: "تم إضافة المصروف",
        description: "تم إضافة المصروف بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المصروف",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الفئة</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة المصروف" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المبلغ</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الوصف</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التاريخ</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                  value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>طريقة الدفع</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المستلم</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4 mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              إلغاء
            </Button>
          </DialogClose>
          <Button type="submit">إضافة</Button>
        </div>
      </form>
    </Form>
  );
}