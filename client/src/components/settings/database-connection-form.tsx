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
import { insertDatabaseConnectionSchema, type InsertDatabaseConnection } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DialogClose } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function DatabaseConnectionForm() {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const form = useForm<InsertDatabaseConnection>({
    resolver: zodResolver(insertDatabaseConnectionSchema),
    defaultValues: {
      name: "",
      type: "postgres",
    },
  });

  const watchType = form.watch("type");

  const onSubmit = async (data: InsertDatabaseConnection) => {
    try {
      await apiRequest("POST", "/api/database-connections", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/database-connections"] });
      
      toast({
        title: "تم إضافة الاتصال",
        description: "تم إضافة اتصال قاعدة البيانات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة اتصال قاعدة البيانات",
        variant: "destructive",
      });
    }
  };

  const testConnection = async () => {
    const data = form.getValues();
    setIsTesting(true);
    try {
      await apiRequest("POST", "/api/database-connections/test", data);
      toast({
        title: "نجاح",
        description: "تم الاتصال بقاعدة البيانات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل الاتصال بقاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الاتصال</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل اسماً وصفياً للاتصال" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع قاعدة البيانات</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع قاعدة البيانات" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="firestore">Firestore</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType !== 'sqlite' && (
          <>
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المضيف</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: localhost" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنفذ</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: 5432" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="database"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم قاعدة البيانات</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل اسم قاعدة البيانات" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المستخدم</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل اسم المستخدم" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="أدخل كلمة المرور" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {watchType === 'firestore' && (
          <FormField
            control={form.control}
            name="connectionString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سلسلة الاتصال</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="أدخل سلسلة الاتصال الخاصة بـ Firestore" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4 mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              إلغاء
            </Button>
          </DialogClose>
          <Button 
            type="button" 
            variant="secondary"
            onClick={testConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جارِ الاختبار...
              </>
            ) : (
              'اختبار الاتصال'
            )}
          </Button>
          <Button type="submit">إضافة</Button>
        </div>
      </form>
    </Form>
  );
}
