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
import { Textarea } from "@/components/ui/textarea";
import { insertExpenseCategorySchema, type InsertExpenseCategory } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DialogClose } from "@/components/ui/dialog";
import { motion } from "framer-motion";

const formAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const inputAnimation = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.2 }
};

export function ExpenseCategoryForm() {
  const { toast } = useToast();
  const form = useForm<InsertExpenseCategory>({
    resolver: zodResolver(insertExpenseCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: InsertExpenseCategory) => {
    try {
      await apiRequest("POST", "/api/expense-categories", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/expense-categories"] });
      
      toast({
        title: "تم إضافة الفئة",
        description: "تم إضافة فئة المصروفات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة فئة المصروفات",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div {...formAnimation}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <motion.div {...inputAnimation} transition={{ delay: 0.1 }}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الفئة</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل اسم الفئة" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div {...inputAnimation} transition={{ delay: 0.2 }}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="أدخل وصف الفئة" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div 
            className="flex justify-end gap-4 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <DialogClose asChild>
              <Button type="button" variant="outline">
                إلغاء
              </Button>
            </DialogClose>
            <Button type="submit">إضافة</Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
