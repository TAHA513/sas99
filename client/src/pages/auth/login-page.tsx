import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, loginMutation } = useAuth();
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch (error: any) {
      form.setError("root", {
        message: error.message || "حدث خطأ في تسجيل الدخول"
      });
    }
  };

  const setupSystem = async () => {
    try {
      setSetupStatus("loading");
      const response = await fetch("/api/setup", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("فشل في إعداد النظام");
      }

      const data = await response.json();
      setSetupStatus("success");
      form.setValue("username", "admin");
      form.setValue("password", "admin123");
    } catch (error) {
      setSetupStatus("error");
      console.error("Setup error:", error);
    }
  };

  useEffect(() => {
    if (user) {
      if (user.role === "مدير") {
        window.location.replace("/dashboard");
      } else {
        window.location.replace("/staff");
      }
    }
  }, [user]);

  if (loginMutation.isPending || setupStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">تسجيل الدخول</CardTitle>
          <CardDescription className="text-center">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {form.formState.errors.root && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>خطأ</AlertTitle>
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
              <Button type="submit" className="w-full">
                دخول
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  مستخدم جديد؟
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={setupSystem}
                  disabled={setupStatus === "success"}
                >
                  {setupStatus === "success" ? "تم إعداد النظام" : "إعداد النظام"}
                </Button>
                {setupStatus === "success" && (
                  <p className="text-sm text-muted-foreground mt-2">
                    تم إعداد النظام. يمكنك تسجيل الدخول باستخدام:
                    <br />
                    اسم المستخدم: admin
                    <br />
                    كلمة المرور: admin123
                  </p>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}