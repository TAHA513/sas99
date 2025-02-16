import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Settings as SettingsIcon, Paintbrush, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { loadThemeSettings } from "@/lib/theme";
import { useQueryClient } from "@tanstack/react-query";
import { DatabaseConnectionForm } from "@/components/settings/database-connection-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "اسم المتجر مطلوب"),
  storeLogo: z.string().optional(),
  enableStaffLogin: z.boolean().default(false),
  trackStaffActivity: z.boolean().default(false),
});

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const storeForm = useForm({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: "",
      storeLogo: "",
      enableStaffLogin: false,
      trackStaffActivity: false,
    },
  });

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const onStoreSubmit = async (data: z.infer<typeof storeSettingsSchema>) => {
    try {
      await fetch("/api/settings/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات المتجر بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إعدادات النظام</h1>
            <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر والتكاملات</p>
          </div>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4">
            <TabsTrigger value="store" className="space-x-2">
              <Building2 className="h-4 w-4" />
              <span>المتجر</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="space-x-2">
              <SettingsIcon className="h-4 w-4" />
              <span>التكاملات</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="space-x-2">
              <Paintbrush className="h-4 w-4" />
              <span>المظهر</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="space-x-2">
              <Database className="h-4 w-4" />
              <span>قواعد البيانات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المتجر</CardTitle>
                <CardDescription>
                  قم بتعديل الإعدادات الأساسية للمتجر
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...storeForm}>
                  <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4">
                    <FormField
                      control={storeForm.control}
                      name="storeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم المتجر</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="storeLogo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شعار المتجر</FormLabel>
                          <FormControl>
                            <Input type="file" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="enableStaffLogin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              تسجيل دخول الموظفين
                            </FormLabel>
                            <FormDescription>
                              السماح للموظفين بتسجيل الدخول إلى النظام
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="trackStaffActivity"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              تتبع نشاط الموظفين
                            </FormLabel>
                            <FormDescription>
                              تسجيل نشاط الموظفين في النظام
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit">حفظ التغييرات</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>التكاملات</CardTitle>
                <CardDescription>
                  قريباً
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>المظهر</CardTitle>
                <CardDescription>
                  تخصيص مظهر التطبيق
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>النمط</Label>
                    <Select defaultValue="light">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النمط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">فاتح</SelectItem>
                        <SelectItem value="dark">داكن</SelectItem>
                        <SelectItem value="system">حسب النظام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>اللون الرئيسي</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {["#000000", "#1a365d", "#2f855a", "#744210", "#702459"].map((color) => (
                        <button
                          key={color}
                          className={cn(
                            "w-8 h-8 rounded-full border",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>حجم الخط</Label>
                    <Slider
                      defaultValue={[16]}
                      max={24}
                      min={12}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <DatabaseConnectionForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}