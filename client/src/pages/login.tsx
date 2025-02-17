import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPassword = localStorage.getItem("admin_password") || "12345678";

    if (username === "admin" && password === storedPassword) {
      localStorage.setItem("isAuthenticated", "true");
      setLocation("/");
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في نظام الإدارة",
      });
    } else {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "اسم المستخدم أو كلمة المرور غير صحيحة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">نظام الإدارة</h1>
          <h2 className="text-xl text-muted-foreground">SAS</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم المستخدم</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ادخل اسم المستخدم"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">كلمة المرور</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ادخل كلمة المرور"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            تسجيل الدخول
          </Button>
        </form>
      </div>
    </div>
  );
}