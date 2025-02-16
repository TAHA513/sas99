import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card as CardComponent, CardContent, CardHeader, CardTitle, CardProps as CardComponentProps, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageSquare, Upload, Plus, Building2, Settings as SettingsIcon, Paintbrush, Database, Users, History, KeyRound, UserPlus, Trash2, Loader2, Calendar, Package, Receipt, Sections } from "lucide-react";
import { SiGooglecalendar } from "react-icons/si";
import { SiFacebook, SiInstagram, SiSnapchat } from "react-icons/si";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { updateThemeColors, updateThemeFonts, loadThemeSettings } from "@/lib/theme";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStoreSettings,
  setStoreSettings,
  getSocialAccounts,
  addSocialAccount,
  getWhatsAppSettings,
  setWhatsAppSettings,
  getGoogleCalendarSettings,
  setGoogleCalendarSettings,
  getSocialMediaSettings,
  setSocialMediaSettings,
  type StoreSettings,
  type SocialMediaAccount,
  type WhatsAppSettings,
  type GoogleCalendarSettings,
  type SocialMediaSettings
} from "@/lib/storage";
import { DatabaseConnectionForm } from "@/components/settings/database-connection-form";
import type { DatabaseConnection } from "@shared/schema";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PermissionsManager } from "@/components/settings/permissions-manager";

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

const currencySettingsSchema = z.object({
  defaultCurrency: z.enum(['USD', 'IQD'], {
    required_error: "يرجى اختيار العملة الافتراضية"
  }),
  usdToIqdRate: z.number()
    .min(1, "يجب أن يكون سعر الصرف أكبر من 0")
    .max(999999, "سعر الصرف غير صالح"),
});

type CurrencySettings = z.infer<typeof currencySettingsSchema>;

const CustomCard = ({ className, ...props }: CardComponentProps) => (
  <CardComponent className={cn("w-full", className)} {...props} />
);

const colorOptions = [
  { type: 'solid', color: "#0ea5e9", name: "أزرق" },
  { type: 'solid', color: "#10b981", name: "أخضر" },
  { type: 'solid', color: "#8b5cf6", name: "بنفسجي" },
  { type: 'solid', color: "#ef4444", name: "أحمر" },
  { type: 'solid', color: "#f59e0b", name: "برتقالي" },
  { type: 'gradient', colors: ["#00c6ff", "#0072ff"], name: "تدرج أزرق" },
  { type: 'gradient', colors: ["#11998e", "#38ef7d"], name: "تدرج أخضر" },
  { type: 'gradient', colors: ["#fc466b", "#3f5efb"], name: "تدرج وردي" },
  { type: 'gradient', colors: ["#f12711", "#f5af19"], name: "تدرج برتقالي" },
  { type: 'gradient', colors: ["#8e2de2", "#4a00e0"], name: "تدرج بنفسجي" },
];

const createGradient = (color1: string, color2: string) => `linear-gradient(to right, ${color1}, ${color2})`;

const adminCredentialsSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

const staffCredentialsSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
  staffId: z.string().min(1, "رقم الموظف مطلوب"),
  role: z.enum(["staff"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type AdminCredentialsFormData = z.infer<typeof adminCredentialsSchema>;
type StaffCredentialsFormData = z.infer<typeof staffCredentialsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const { data: storeSettings } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: getStoreSettings,
  });

  const { data: socialAccounts } = useQuery({
    queryKey: ['socialAccounts'],
    queryFn: getSocialAccounts,
  });

  const whatsappForm = useForm<WhatsAppSettings>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: getWhatsAppSettings(),
  });

  const googleCalendarForm = useForm<GoogleCalendarSettings>({
    resolver: zodResolver(googleCalendarSchema),
    defaultValues: getGoogleCalendarSettings(),
  });

  const socialMediaForm = useForm<SocialMediaSettings>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: getSocialMediaSettings(),
  });

  const currencyForm = useForm<CurrencySettings>({
    resolver: zodResolver(currencySettingsSchema),
    defaultValues: {
      defaultCurrency: 'USD',
      usdToIqdRate: 1460,
    }
  });

  const adminForm = useForm<AdminCredentialsFormData>({
    resolver: zodResolver(adminCredentialsSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    }
  });

  const staffForm = useForm<StaffCredentialsFormData>({
    resolver: zodResolver(staffCredentialsSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      staffId: "",
      role: "staff"
    }
  });

  const storeSettingsMutation = useMutation({
    mutationFn: async (data: {
      storeName?: string;
      storeLogo?: string;
      primary?: string | { gradient: string[] };
      fontSize?: string;
      fontFamily?: string;
      currencySettings?: CurrencySettings;
      enableStaffLogin?: boolean;
      staffLoginHistory?: any[];
      restrictStaffAccess?: boolean;
      trackStaffActivity?: boolean;
      enableSalesPartition?: boolean;
      enableAppointmentsPartition?: boolean;
      enableInventoryPartition?: boolean;
      enableReportsPartition?: boolean;
    }) => {
      if (data.storeName !== undefined || data.storeLogo !== undefined) {
        const newSettings = {
          ...(data.storeName !== undefined && { storeName: data.storeName }),
          ...(data.storeLogo !== undefined && { storeLogo: data.storeLogo }),
        };
        setStoreSettings(newSettings);
      }

      if (data.primary) {
        updateThemeColors(data.primary);
      }

      if (data.fontSize || data.fontFamily) {
        updateThemeFonts(
          data.fontSize || localStorage.getItem('theme-font-size') || 'medium',
          data.fontFamily || localStorage.getItem('theme-font-family') || 'tajawal'
        );
      }
      if (data.currencySettings) {
        setStoreSettings({ ...storeSettings, currencySettings: data.currencySettings });
      }
      if (data.enableStaffLogin !== undefined) {
        setStoreSettings({ ...storeSettings, enableStaffLogin: data.enableStaffLogin })
      }
      if (data.restrictStaffAccess !== undefined) {
        setStoreSettings({ ...storeSettings, restrictStaffAccess: data.restrictStaffAccess })
      }
      if (data.trackStaffActivity !== undefined) {
        setStoreSettings({ ...storeSettings, trackStaffActivity: data.trackStaffActivity })
      }
      if (data.enableSalesPartition !== undefined) {
        setStoreSettings({ ...storeSettings, enableSalesPartition: data.enableSalesPartition });
      }
      if (data.enableAppointmentsPartition !== undefined) {
        setStoreSettings({ ...storeSettings, enableAppointmentsPartition: data.enableAppointmentsPartition });
      }
      if (data.enableInventoryPartition !== undefined) {
        setStoreSettings({ ...storeSettings, enableInventoryPartition: data.enableInventoryPartition });
      }
      if (data.enableReportsPartition !== undefined) {
        setStoreSettings({ ...storeSettings, enableReportsPartition: data.enableReportsPartition });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث الإعدادات بنجاح",
      });
    },
  });

  const accountMutation = useMutation({
    mutationFn: (data: SocialMediaAccountFormData) => {
      const newAccount = addSocialAccount(data);
      return newAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialAccounts'] });
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الحساب بنجاح",
      });
      form.reset();
      setIsDialogOpen(false);
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
    setWhatsAppSettings(data);
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث إعدادات WhatsApp بنجاح",
    });
  };

  const onGoogleCalendarSubmit = async (data: GoogleCalendarSettings) => {
    setGoogleCalendarSettings(data);
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث إعدادات Google Calendar بنجاح",
    });
  };

  const onSocialMediaSubmit = async (data: SocialMediaSettings) => {
    setSocialMediaSettings(data);
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث إعدادات وسائل التواصل الاجتماعي بنجاح",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        storeSettingsMutation.mutate({
          storeLogo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: connections } = useQuery({
    queryKey: ['databaseConnections'],
    queryFn: () => {
      return Promise.resolve([{
        id: '1',
        name: 'Main Database',
        type: 'MySQL',
        host: 'localhost',
        database: 'mydb',
        isActive: true,
        createdAt: new Date().toISOString()
      }]);
    }
  });

  const adminCredentialsMutation = useMutation({
    mutationFn: async (data: AdminCredentialsFormData) => {
      const response = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات تسجيل دخول المدير بنجاح",
      });
      adminForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const staffCredentialsMutation = useMutation({
    mutationFn: async (data: StaffCredentialsFormData) => {
      const response = await fetch('/api/staff/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم إضافة بيانات تسجيل دخول الموظف بنجاح",
      });
      staffForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add this after other queries
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الحساب بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });


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
                    disabled={accountMutation.isLoading || !form.formState.isValid}
                    className="w-full"
                  >
                    {accountMutation.isLoading ? "جاري الحفظ..." : "حفظ الحساب"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 gap-4">
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
            <TabsTrigger value="permissions" className="space-x-2">
              <Users className="h-4 w-4" />
              <span>الصلاحيات</span>
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
                      storeSettingsMutation.mutate({ storeName: e.target.value, storeLogo: storeSettings?.storeLogo || "" });
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
                            storeSettingsMutation.mutate({ storeName: storeSettings.storeName || "", storeLogo: "" });
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

            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex gap-2">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle>إعدادات العملة</CardTitle>
                    <CardDescription>
                      تحديد العملة الافتراضية وسعر الصرف
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Form {...currencyForm}>
                  <form onSubmit={currencyForm.handleSubmit((data) => {
                    storeSettingsMutation.mutate({ currencySettings: data });
                  })} className="space-y-4">
                    <FormField
                      control={currencyForm.control}
                      name="defaultCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العملة الافتراضية</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر العملة الافتراضية" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">دولار أمريكي</SelectItem>
                              <SelectItem value="IQD">دينار عراقي</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={currencyForm.control}
                      name="usdToIqdRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر صرف الدولار مقابل الدينار العراقي</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                              placeholder="أدخل سعر الصرف"
                            />
                          </FormControl>
                          <FormDescription>
                            1 دولار = كم دينار عراقي
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={storeSettingsMutation.isLoading}>
                      {storeSettingsMutation.isLoading ? "جاري الحفظ..." : "حفظ إعدادات العملة"}
                    </Button>
                  </form>
                </Form>
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
                    <Button type="submit" disabled={storeSettingsMutation.isLoading}>
                      {storeSettingsMutation.isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
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
                    <Button type="submit" disabled={storeSettingsMutation.isLoading}>
                      {storeSettingsMutation.isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </CustomCard>

            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="flex gap-2">
                    <SiFacebook className="h-8 w8 text-blue-600" />
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
                          {account.platform === 'facebook' && <SiFacebook className="h6 w-6 text-blue-600" />}
                          {account.platform === 'instagram' && <SiInstagram className="h-6 w-6 text-pink-600" />}
                          {account.platform === 'snapchat' && <SiSnapchat className="h-6 w-6 text-yellow500" />}
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
                <div className="space-y-4">
                  <Label>لون النظام الأساسي</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((option) => (
                      <Button
                        key={option.type === 'solid' ? option.color : option.colors.join('-')}
                        variant="outline"
                        className={cn(
                          "w-full h-12 rounded-md",
                          ((option.type === 'solid' && option.color === localStorage.getItem('theme-color')) ||
                            (option.type === 'gradient' &&
                              JSON.stringify(option.colors) === localStorage.getItem('theme-gradient'))) &&
                            "ring-2 ring-primary"
                        )}
                        style={{
                          background: option.type === 'solid'
                            ? option.color
                            : createGradient(option.colors[0], option.colors[1])
                        }}
                        onClick={() => {
                          storeSettingsMutation.mutate({
                            primary: option.type === 'solid'
                              ? option.color
                              : { gradient: option.colors }
                          });
                        }}
                      >
                        <span className="sr-only">{option.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>حجم الخط</Label>
                  <Select
                    defaultValue={localStorage.getItem('theme-font-size') || 'medium'}
                    onValueChange={(value) => {
                      storeSettingsMutation.mutate({ fontSize: value });
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

                <div className="space-y-4">
                  <Label>نوع الخط</Label>
                  <Select
                    defaultValue={localStorage.getItem('theme-font-family') || 'tajawal'}
                    onValueChange={(value) => {
                      storeSettingsMutation.mutate({ fontFamily: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الخط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tajawal">Tajawal</SelectItem>
                      <SelectItem value="cairo">Cairo</SelectItem>
                      <SelectItem value="noto-sans-arabic">Noto Sans Arabic</SelectItem>
                      <SelectItem value="dubai">Dubai</SelectItem>
                      <SelectItem value="ibm-plex-sans-arabic">IBM Plex Sans Arabic</SelectItem>
                      <SelectItem value="aref-ruqaa">Aref Ruqaa</SelectItem>
                      <SelectItem value="almarai">Almarai</SelectItem>
                      <SelectItem value="lateef">Lateef</SelectItem>
                      <SelectItem value="scheherazade">Scheherazade New</SelectItem>
                      <SelectItem value="harmattan">Harmattan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </CustomCard>
          </TabsContent>
          <TabsContent value="database" className="space-y-6">
            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Database className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>إدارة قواعد البيانات</CardTitle>
                    <CardDescription>
                      إدارة اتصالات قواعد البيانات في النظام
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة اتصال جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة اتصال قاعدة بيانات جديد</DialogTitle>
                        <DialogDescription>
                          أدخل تفاصيل الاتصال بقاعدة البيانات
                        </DialogDescription>
                      </DialogHeader>
                      <DatabaseConnectionForm />
                    </DialogContent>
                  </Dialog>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border rounded-lg"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>اسم الاتصال</TableHead>
                          <TableHead>النوع</TableHead>
                          <TableHead>المضيف</TableHead>
                          <TableHead>قاعدة البيانات</TableHead>
                          <TableHead>الحالة</TableHead>
                          <TableHead>تاريخ الإنشاء</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {connections?.map((connection) => (
                          <TableRow key={connection.id}>
                            <TableCell className="font-medium">{connection.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Database className="h-4 w-4 ml-2" />
                                {connection.type}
                              </div>
                            </TableCell>
                            <TableCell>{connection.host || '-'}</TableCell>
                            <TableCell>{connection.database || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={connection.isActive ? "default" : "secondary"}>
                                {connection.isActive ? 'نشط' : 'غير نشط'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(connection.createdAt).toLocaleDateString('ar-IQ')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  تحرير
                                </Button>
                                <Button variant="destructive" size="sm">
                                  حذف
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!connections?.length && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              لا توجد اتصالات حالياً
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </motion.div>
                </div>
              </CardContent>
            </CustomCard>
          </TabsContent>
          <TabsContent value="staff" className="space-y-6">
            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>إعدادات تسجيل دخول الموظفين</CardTitle>
                    <CardDescription>
                      إدارة صلاحيات وتتبع دخول الموظفين للنظام
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-4">
                  <div>
                    <Label className="text-base">تفعيل تسجيل دخول الموظفين</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للموظفين بتسجيل الدخول للنظام مع صلاحيات محدودة
                    </p>
                  </div>
                  <Switch
                    checked={storeSettings?.enableStaffLogin || false}
                    onCheckedChange={(checked) => {
                      storeSettingsMutation.mutate({
                        enableStaffLogin: checked,
                        storeName: storeSettings?.storeName || "",
                        storeLogo: storeSettings?.storeLogo || ""
                      });
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">سجل تسجيل دخول الموظفين</h3>
                  </div>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الموظف</TableHead>
                          <TableHead>وقت الدخول</TableHead>
                          <TableHead>نوع الدخول</TableHead>
                          <TableHead>الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {storeSettings?.staffLoginHistory?.map((log: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{log.staffName}</TableCell>
                            <TableCell>{new Date(log.loginTime).toLocaleString('ar-IQ')}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {log.loginType === 'web' ? 'متصفح' : 'تطبيق'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={log.status === 'success' ? 'default' : 'destructive'}
                              >
                                {log.status === 'success' ? 'ناجح' : 'فاشل'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!storeSettings?.staffLoginHistory || storeSettings.staffLoginHistory.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              لا يوجد سجل لتسجيل الدخول
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">إعدادات الصلاحيات</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-4">
                      <div>
                        <Label className="text-base">تقييد الوصول لصفحة الموظفين فقط</Label>
                        <p className="text-sm text-muted-foreground">
                          منع الموظفين من الوصول إلى باقي صفحات النظام
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.restrictStaffAccess || false}
                        onCheckedChange={(checked) => {
                          storeSettingsMutation.mutate({
                            restrictStaffAccess: checked,
                            storeName: storeSettings?.storeName || "",
                            storeLogo: storeSettings?.storeLogo || ""
                          });
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-4">
                      <div>
                        <Label className="text-base">تتبع نشاط الموظفين</Label>
                        <p className="text-sm text-muted-foreground">
                          تسجيل جميع عمليات تسجيل الدخول والخروج للموظفين
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.trackStaffActivity || false}
                        onCheckedChange={(checked) => {
                          storeSettingsMutation.mutate({
                            trackStaffActivity: checked,
                            storeName: storeSettings?.storeName || "",
                            storeLogo: storeSettings?.storeLogo || ""
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <CustomCard>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <KeyRound className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>بيانات تسجيل دخول المدير</CardTitle>
                        <CardDescription>
                          تعيين بيانات تسجيل الدخول للمدير مع صلاحيات كاملة للنظام
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...adminForm}>
                      <form onSubmit={adminForm.handleSubmit((data) => {
                        const { confirmPassword, ...adminData } = data;
                        adminCredentialsMutation.mutate(adminData);
                      })} className="space-y-4">
                        <FormField
                          control={adminForm.control}
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
                          control={adminForm.control}
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
                        <FormField
                          control={adminForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأكيد كلمة المرور</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} placeholder="أعد إدخال كلمة المرور" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={adminCredentialsMutation.isPending}
                          className="w-full"
                        >
                          {adminCredentialsMutation.isPending ? "جاري الحفظ..." : "حفظ بيانات المدير"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </CustomCard>

                <CustomCard className="mt-6">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <UserPlus className="h-8 w-8 text-primary" />
                      <div>
                        <CardTitle>إضافة حساب موظف جديد</CardTitle>
                        <CardDescription>
                          إنشاء حساب جديد للموظف مع صلاحيات محدودة
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...staffForm}>
                      <form onSubmit={staffForm.handleSubmit((data) => {
                        const { confirmPassword, ...staffData } = data;
                        staffCredentialsMutation.mutate(staffData);
                      })} className="space-y-4">
                        <FormField
                          control={staffForm.control}
                          name="staffId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الموظف</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="أدخل رقم الموظف" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={staffForm.control}
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
                          control={staffForm.control}
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
                        <FormField
                          control={staffForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تأكيد كلمة المرور</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} placeholder="أعد إدخال كلمة المرور" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          disabled={staffCredentialsMutation.isPending}
                          className="w-full"
                        >
                          {staffCredentialsMutation.isPending ? "جاري الإضافة..." : "إضافة حساب موظف"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </CustomCard>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">قائمة المستخدمين</h3>
                    </div>
                  </div>

                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Table className="mt-4">
                      <TableHeader>
                        <TableRow>
                          <TableHead>اسم المستخدم</TableHead>
                          <TableHead>الدور</TableHead>
                          <TableHead>رقم الموظف</TableHead>
                          <TableHead>تاريخ الإنشاء</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                                {user.role === 'admin' ? 'مدير' : 'موظف'}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.staffId || '-'}</TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString('ar')}</TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>هل أنت متأكد من حذف هذا الحساب؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      سيتم حذف الحساب نهائياً ولن يتمكن المستخدم من الوصول إلى النظام.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      حذف الحساب
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

              </CardContent>
            </CustomCard>
          </TabsContent>
          <TabsContent value="permissions" className="space-y-6">
            <CustomCard>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>صلاحيات النظام</CardTitle>
                    <CardDescription>
                      إدارة صلاحيات المستخدمين والموظفين
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <PermissionsManager />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">بارتشن الموظفين</h3>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">قسم المبيعات</p>
                            <p className="text-sm text-muted-foreground">الوصول إلى المبيعات والفواتير</p>
                          </div>
                        </div>
                        <Switch
                          checked={storeSettings?.enableSalesPartition}
                          onCheckedChange={(checked) => {
                            storeSettingsMutation.mutate({ enableSalesPartition: checked })
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">قسم المواعيد</p>
                            <p className="text-sm text-muted-foreground">إدارة مواعيد العملاء</p>
                          </div>
                        </div>
                        <Switch
                          checked={storeSettings?.enableAppointmentsPartition}
                          onCheckedChange={(checked) => {
                            storeSettingsMutation.mutate({ enableAppointmentsPartition: checked })
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">قسم المخزون</p>
                            <p className="text-sm text-muted-foreground">إدارة المنتجات والمخزون</p>
                          </div>
                        </div>
                        <Switch
                          checked={storeSettings?.enableInventoryPartition}
                          onCheckedChange={(checked) => {
                            storeSettingsMutation.mutate({ enableInventoryPartition: checked })
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Receipt className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">قسم التقارير</p>
                            <p className="text-sm text-muted-foreground">عرض التقارير والإحصائيات</p>
                          </div>
                        </div>
                        <Switch
                          checked={storeSettings?.enableReportsPartition}
                          onCheckedChange={(checked) => {
                            storeSettingsMutation.mutate({ enableReportsPartition: checked })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CustomCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}