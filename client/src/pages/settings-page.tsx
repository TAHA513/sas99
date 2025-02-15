import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card as CardComponent, CardContent, CardHeader, CardTitle, CardProps as CardComponentProps, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast, toast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Upload, Plus, Building2, Settings as SettingsIcon, Paintbrush } from "lucide-react";
import { SiGooglecalendar } from "react-icons/si";
import { SiFacebook, SiInstagram, SiSnapchat } from "react-icons/si";
import { Setting, User, Customer, SocialMediaAccount, StoreSetting } from "@shared/schema";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

// Add this helper function at the top level
const updateThemeVariables = (primary: string) => {
  // Convert hex to HSL
  const root = document.documentElement;
  const hslColor = hexToHSL(primary);
  root.style.setProperty('--primary', hslColor);
  root.style.setProperty('--primary-foreground', '210 40% 98%');
};

// Add hex to HSL conversion helper
const hexToHSL = (hex: string): string => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

  // Parse the values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h = h * 60;
  }

  // Return the HSL string
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// تحسين مخطط التحقق للحسابات الاجتماعية
const socialMediaAccountSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'snapchat'], {
    required_error: "يرجى اختيار المنصة"
  }),
  username: z.string().min(1, "اسم المستخدم مطلوب").max(50, "اسم المستخدم طويل جداً"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(50, "كلمة المرور طويلة جداً"),
});

type SocialMediaAccountFormData = z.infer<typeof socialMediaAccountSchema>;

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


const CustomCard = ({ className, ...props }: CardComponentProps) => (
  <CardComponent className={cn("w-full", className)} {...props} />
);

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Add theme loading on mount
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        const response = await fetch('/api/theme');
        const theme = await response.json();
        if (theme?.primary) {
          updateThemeVariables(theme.primary);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadInitialTheme();
  }, []);

  const { data: settings } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const { data: storeSettings } = useQuery<StoreSetting>({
    queryKey: ["/api/store-settings"],
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
        description: "تم تحديث الإعدادات بنجاح",
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

  const storeSettingsMutation = useMutation({
    mutationFn: async (data: { 
      storeName?: string; 
      storeLogo?: string;
      primary?: string;
      appearance?: 'light' | 'dark';
      radius?: number;
      fontSize?: string;
      fontFamily?: string;
    }) => {
      try {
        // Update store settings first
        if (data.storeName !== undefined || data.storeLogo !== undefined) {
          const storeRes = await apiRequest("POST", "/api/store-settings", {
            storeName: data.storeName,
            storeLogo: data.storeLogo,
          });
          await storeRes.json();
        }

        // Then update theme if appearance related settings are changed
        if (data.primary || data.appearance || data.radius || data.fontSize || data.fontFamily) {
          const themeRes = await apiRequest("POST", "/api/theme", {
            primary: data.primary,
            appearance: data.appearance,
            radius: data.radius,
            fontSize: data.fontSize,
            fontFamily: data.fontFamily,
            variant: "tint", // Keep the default variant
          });

          if (!themeRes.ok) {
            throw new Error('فشل في تحديث المظهر');
          }

          // If we're just changing the primary color, apply it immediately
          if (data.primary && !data.appearance && !data.radius && !data.fontSize && !data.fontFamily) {
            updateThemeVariables(data.primary);
          } else {
            // Only reload for major theme changes
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }

        return { success: true };
      } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store-settings"] });
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث الإعدادات بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: error.message || "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        storeSettingsMutation.mutate({
          storeName: storeSettings?.storeName || "",
          storeLogo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: socialAccounts } = useQuery<SocialMediaAccount[]>({
    queryKey: ["/api/social-accounts"],
  });

  const accountMutation = useMutation({
    mutationFn: async (data: SocialMediaAccountFormData) => {
      try {
        const res = await apiRequest("POST", "/api/social-accounts", data);
        return await res.json();
      } catch (error) {
        throw new Error("فشل في إضافة الحساب. يرجى المحاولة مرة أخرى.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الحساب بنجاح",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<SocialMediaAccountFormData>({
    resolver: zodResolver(socialMediaAccountSchema),
    defaultValues: {
      platform: undefined,
      username: '',
      password: '',
    },
  });

  const onSubmit = (data: SocialMediaAccountFormData) => {
    accountMutation.mutate(data);
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إعدادات النظام</h1>
            <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر والتكاملات</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>ربط حسابات التواصل الاجتماعي</DialogTitle>
                <DialogDescription>
                  اختر إحدى المنصات التالية للربط مع حسابك
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-start gap-3 h-14"
                  onClick={() => {
                    // سيتم إضافة منطق تسجيل الدخول لفيسبوك
                    toast({
                      title: "قريباً",
                      description: "سيتم إضافة خيار تسجيل الدخول بفيسبوك قريباً",
                    });
                  }}
                >
                  <SiFacebook className="h-6 w-6 text-blue-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">تسجيل الدخول بفيسبوك</span>
                    <span className="text-sm text-muted-foreground">ربط حساب فيسبوك الخاص بك</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-start gap-3 h-14"
                  onClick={() => {
                    // سيتم إضافة منطق تسجيل الدخول لانستغرام
                    toast({
                      title: "قريباً",
                      description: "سيتم إضافة خيار تسجيل الدخول بانستغرام قريباً",
                    });
                  }}
                >
                  <SiInstagram className="h-6 w-6 text-pink-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">تسجيل الدخول بانستغرام</span>
                    <span className="text-sm text-muted-foreground">ربط حساب انستغرام الخاص بك</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center justify-start gap-3 h-14"
                  onClick={() => {
                    // سيتم إضافة منطق تسجيل الدخول لسناب شات
                    toast({
                      title: "قريباً",
                      description: "سيتم إضافة خيار تسجيل الدخول بسناب شات قريباً",
                    });
                  }}
                >
                  <SiSnapchat className="h-6 w-6 text-yellow-500" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">تسجيل الدخول بسناب شات</span>
                    <span className="text-sm text-muted-foreground">ربط حساب سناب شات الخاص بك</span>
                  </div>
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  أو يمكنك إدخال بيانات الحساب يدوياً
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المنصة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المنصة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="facebook">فيسبوك</SelectItem>
                            <SelectItem value="instagram">انستغرام</SelectItem>
                            <SelectItem value="snapchat">سناب شات</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم / رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أدخل اسم المستخدم أو رقم الهاتف" />
                        </FormControl>
                        <FormDescription>
                          يمكنك إدخال اسم المستخدم أو رقم الهاتف الخاص بالحساب
                        </FormDescription>
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

                  <Button
                    type="submit"
                    disabled={accountMutation.isPending || !form.formState.isValid}
                    className="w-full"
                  >
                    {accountMutation.isPending ? "جاري الحفظ..." : "حفظ الحساب"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
          </TabsList>

          <TabsContent value="store" className="space-y-6">
            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex gap-2">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>معلومات المتجر</CardTitle>
                    <CardDescription>
                      إدارة معلومات المتجر والشعار
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم المتجر</Label>
                  <Input
                    placeholder="أدخل اسم المتجر"
                    defaultValue={storeSettings?.storeName || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      storeSettingsMutation.mutate({
                        storeName: newValue,
                        storeLogo: storeSettings?.storeLogo || "",
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>شعار المتجر</Label>
                  <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg">
                    {storeSettings?.storeLogo ? (
                      <div className="relative">
                        <img
                          src={storeSettings.storeLogo}
                          alt="شعار المتجر"
                          className="max-w-[200px] max-h-[200px] object-contain"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-0 right-0 mt-2 mr-2"
                          onClick={() => {
                            storeSettingsMutation.mutate({
                              storeName: storeSettings.storeName || "",
                              storeLogo: "",
                            });
                          }}
                        >
                          حذف
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          اسحب وأفلت الشعار هنا أو اضغط للتحميل
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById("logo-upload") as HTMLInputElement;
                          if (input) {
                            input.click();
                          }
                        }}
                      >
                        <Upload className="h-4 w-4 ml-2" />
                        تحميل شعار جديد
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CustomCard>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <CustomCard>
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
            </CustomCard>

            <CustomCard>
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
            </CustomCard>

            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex gap-2">
                    <SiFacebook className="h-8 w-8 text-blue-600" />
                    <SiInstagram className="h-8 w-8 text-pink-600" />
                    <SiSnapchat className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle>الحسابات المرتبطة</CardTitle>
                    <CardDescription>
                      إدارة حسابات التواصل الاجتماعي المرتبطة بالنظام
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4">
                    {socialAccounts?.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {account.platform === 'facebook' && <SiFacebook className="h-6 w-6 text-blue-600" />}
                          {account.platform === 'instagram' && <SiInstagram className="h-6 w-6 text-pink-600" />}
                          {account.platform === 'snapchat' && <SiSnapchat className="h-6 w-6 text-yellow-500" />}
                          <div>
                            <p className="font-medium">{account.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {account.platform === 'facebook' ? 'فيسبوك' :
                                account.platform === 'instagram' ? 'انستغرام' : 'سناب شات'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                          {account.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </CustomCard>
          </TabsContent>
          <TabsContent value="appearance" className="space-y-6">
            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Paintbrush className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>مظهر التطبيق</CardTitle>
                    <CardDescription>
                      تخصيص مظهر التطبيق والألوان والخطوط
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Color */}
                <div className="space-y-4">
                  <Label>لون النظام الأساسي</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { color: "#0ea5e9", name: "أزرق" },
                      { color: "#10b981", name: "أخضر" },
                      { color: "#8b5cf6", name: "بنفسجي" },
                      { color: "#ef4444", name: "أحمر" },
                      { color: "#f59e0b", name: "برتقالي" }
                    ].map(({ color, name }) => (
                      <Button
                        key={color}
                        variant="outline"
                        className={cn(
                          "w-full h-12 rounded-md",
                          color === storeSettings?.primary && "ring-2 ring-primary"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          storeSettingsMutation.mutate({
                            primary: color
                          });
                        }}
                      >
                        <span className="sr-only">{name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الوضع الداكن</Label>
                    <div className="text-sm text-muted-foreground">
                      تبديل بين الوضع الفاتح والداكن
                    </div>
                  </div>
                  <Switch
                    checked={storeSettings?.appearance === 'dark'}
                    onCheckedChange={(checked) => {
                      storeSettingsMutation.mutate({
                        appearance: checked ? 'dark' : 'light'
                      });
                    }}
                  />
                </div>

                {/* Border Radius */}
                <div className="space-y-4">
                  <Label>نصف قطر الحواف</Label>
                  <Slider
                    defaultValue={[storeSettings?.radius || 0.5]}
                    max={1.5}
                    step={0.1}
                    onValueChange={([value]) => {
                      storeSettingsMutation.mutate({
                        radius: value
                      });
                    }}
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-4">
                  <Label>حجم الخط</Label>
                  <Select
                    value={storeSettings?.fontSize || 'medium'}
                    onValueChange={(value) => {
                      storeSettingsMutation.mutate({
                        fontSize: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حجم الخط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">صغير</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">كبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Family */}
                <div className="space-y-4">
                  <Label>نوع الخط</Label>
                  <Select
                    value={storeSettings?.fontFamily || 'tajawal'}
                    onValueChange={(value) => {
                      storeSettingsMutation.mutate({
                        fontFamily: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الخط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cairo">Cairo</SelectItem>
                      <SelectItem value="tajawal">Tajawal</SelectItem>
                      <SelectItem value="almarai">Almarai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </CustomCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}