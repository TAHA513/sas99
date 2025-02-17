import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AuthPage() {
  const { loginMutation, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="w-full">
          <CardHeader className="text-2xl font-bold text-center">
            نظام إدارة الأعمال
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => loginMutation.mutate({})} 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "جاري الدخول..." : "دخول للنظام"}
            </Button>
          </CardContent>
        </Card>

        <div className="hidden lg:flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4 text-right">مرحباً بك في نظام إدارة الأعمال</h1>
          <p className="text-gray-600 text-right">
            نظام متكامل لإدارة العملاء والمواعيد والموظفين
          </p>
        </div>
      </div>
    </div>
  );
}