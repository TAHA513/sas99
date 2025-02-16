import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, ShieldCheck } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const adminForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const staffForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch('/api/admin/login', {
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
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const staffLoginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch('/api/staff/login', {
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
      setLocation("/staff/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAdminSubmit = (data: LoginData) => {
    adminLoginMutation.mutate(data);
  };

  const onStaffSubmit = (data: LoginData) => {
    if (!settings?.enableStaffLogin) {
      toast({
        title: "تسجيل دخول الموظفين معطل",
        description: "يرجى التواصل مع مدير النظام لتفعيل الخدمة",
        variant: "destructive",
      });
      return;
    }
    staffLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            تسجيل الدخول
          </CardTitle>
          <CardDescription className="text-center">
            قم بتسجيل الدخول للوصول إلى النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="admin" className="space-x-2">
                <ShieldCheck className="h-4 w-4" />
                <span>مدير النظام</span>
              </TabsTrigger>
              <TabsTrigger value="staff" className="space-x-2">
                <UserCircle className="h-4 w-4" />
                <span>موظف</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                  <FormField
                    control={adminForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={adminLoginMutation.isPending}
                  >
                    {adminLoginMutation.isPending ? "جاري تسجيل الدخول..." : "دخول كمدير"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="staff">
              <Form {...staffForm}>
                <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                  <FormField
                    control={staffForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المستخدم</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={staffLoginMutation.isPending}
                  >
                    {staffLoginMutation.isPending ? "جاري تسجيل الدخول..." : "دخول كموظف"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}