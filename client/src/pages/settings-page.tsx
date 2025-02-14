import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare } from "lucide-react";
import { SiGooglecalendar } from "react-icons/si";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { Setting } from "@shared/schema";

const whatsappSchema = z.object({
  WHATSAPP_API_TOKEN: z.string().min(1, "رمز الوصول مطلوب"),
  WHATSAPP_BUSINESS_PHONE_NUMBER: z.string().min(1, "رقم الهاتف مطلوب"),
});

const googleCalendarSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, "معرف العميل مطلوب"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "الرمز السري مطلوب"),
});

const socialMediaSchema = z.object({
  FACEBOOK_APP_ID: z.string().min(1, "معرف التطبيق مطلوب"),
  FACEBOOK_APP_SECRET: z.string().min(1, "الرمز السري مطلوب"),
  INSTAGRAM_ACCESS_TOKEN: z.string().min(1, "رمز الوصول مطلوب"),
});

type WhatsAppSettings = z.infer<typeof whatsappSchema>;
type GoogleCalendarSettings = z.infer<typeof googleCalendarSchema>;
type SocialMediaSettings = z.infer<typeof socialMediaSchema>;

export default function SettingsPage() {
  const { toast } = useToast();

  const { data: settings } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const whatsappForm = useForm<WhatsAppSettings>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      WHATSAPP_API_TOKEN: settings?.find(s => s.key === "WHATSAPP_API_TOKEN")?.value || "",
      WHATSAPP_BUSINESS_PHONE_NUMBER: settings?.find(s => s.key === "WHATSAPP_BUSINESS_PHONE_NUMBER")?.value || "",
    },
  });

  const googleCalendarForm = useForm<GoogleCalendarSettings>({
    resolver: zodResolver(googleCalendarSchema),
    defaultValues: {
      GOOGLE_CLIENT_ID: settings?.find(s => s.key === "GOOGLE_CLIENT_ID")?.value || "",
      GOOGLE_CLIENT_SECRET: settings?.find(s => s.key === "GOOGLE_CLIENT_SECRET")?.value || "",
    },
  });

  const socialMediaForm = useForm<SocialMediaSettings>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      FACEBOOK_APP_ID: settings?.find(s => s.key === "FACEBOOK_APP_ID")?.value || "",
      FACEBOOK_APP_SECRET: settings?.find(s => s.key === "FACEBOOK_APP_SECRET")?.value || "",
      INSTAGRAM_ACCESS_TOKEN: settings?.find(s => s.key === "INSTAGRAM_ACCESS_TOKEN")?.value || "",
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات التكامل بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onWhatsAppSubmit = async (data: WhatsAppSettings) => {
    for (const [key, value] of Object.entries(data)) {
      await saveSettingsMutation.mutateAsync({ key, value });
    }
  };

  const onGoogleCalendarSubmit = async (data: GoogleCalendarSettings) => {
    for (const [key, value] of Object.entries(data)) {
      await saveSettingsMutation.mutateAsync({ key, value });
    }
  };

  const onSocialMediaSubmit = async (data: SocialMediaSettings) => {
    for (const [key, value] of Object.entries(data)) {
      await saveSettingsMutation.mutateAsync({ key, value });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">إعدادات النظام</h1>

        <div className="grid gap-6">
          {/* WhatsApp Integration Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <MessageSquare className="h-8 w-8 text-green-500" />
                <div>
                  <CardTitle>إعدادات WhatsApp</CardTitle>
                  <CardDescription>
                    قم بإعداد التكامل مع WhatsApp Business API لإرسال الإشعارات التلقائية
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...whatsappForm}>
                <form onSubmit={whatsappForm.handleSubmit(onWhatsAppSubmit)} className="space-y-4">
                  <FormField
                    control={whatsappForm.control}
                    name="WHATSAPP_API_TOKEN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز الوصول (API Token)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          يمكنك الحصول على رمز الوصول من لوحة تحكم WhatsApp Business
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={whatsappForm.control}
                    name="WHATSAPP_BUSINESS_PHONE_NUMBER"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          رقم الهاتف المسجل في WhatsApp Business
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={saveSettingsMutation.isPending}>
                    {saveSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Google Calendar Integration Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <SiGooglecalendar className="h-8 w-8 text-blue-500" />
                <div>
                  <CardTitle>إعدادات Google Calendar</CardTitle>
                  <CardDescription>
                    قم بإعداد التكامل مع Google Calendar لمزامنة المواعيد
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...googleCalendarForm}>
                <form onSubmit={googleCalendarForm.handleSubmit(onGoogleCalendarSubmit)} className="space-y-4">
                  <FormField
                    control={googleCalendarForm.control}
                    name="GOOGLE_CLIENT_ID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرف العميل (Client ID)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          معرف العميل من Google Cloud Console
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={googleCalendarForm.control}
                    name="GOOGLE_CLIENT_SECRET"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرمز السري (Client Secret)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          الرمز السري للعميل من Google Cloud Console
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={saveSettingsMutation.isPending}>
                    {saveSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Social Media Integration Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="flex gap-2">
                  <SiFacebook className="h-8 w-8 text-blue-600" />
                  <SiInstagram className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <CardTitle>إعدادات وسائل التواصل الاجتماعي</CardTitle>
                  <CardDescription>
                    قم بإعداد التكامل مع فيسبوك وانستغرام لإدارة الحملات التسويقية
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...socialMediaForm}>
                <form onSubmit={socialMediaForm.handleSubmit(onSocialMediaSubmit)} className="space-y-4">
                  <FormField
                    control={socialMediaForm.control}
                    name="FACEBOOK_APP_ID"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>معرف تطبيق فيسبوك (App ID)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          معرف التطبيق من Facebook Developers Console
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialMediaForm.control}
                    name="FACEBOOK_APP_SECRET"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرمز السري لتطبيق فيسبوك (App Secret)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          الرمز السري للتطبيق من Facebook Developers Console
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={socialMediaForm.control}
                    name="INSTAGRAM_ACCESS_TOKEN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رمز وصول انستغرام (Access Token)</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          رمز الوصول لحساب انستغرام التجاري
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={saveSettingsMutation.isPending}>
                    {saveSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}