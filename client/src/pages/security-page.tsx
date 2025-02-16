import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function SecurityPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: currentUser?.role === "admin",
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم حذف المستخدم بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "فشل حذف المستخدم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (currentUser?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-destructive">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>إدارة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الصلاحية</TableHead>
                  <TableHead>آخر تسجيل دخول</TableHead>
                  <TableHead>محاولات تسجيل الدخول</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      {user.role === "admin" ? "مسؤول" : "موظف"}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? formatDistanceToNow(new Date(user.lastLoginAt), {
                            addSuffix: true,
                            locale: ar,
                          })
                        : "لم يسجل الدخول بعد"}
                    </TableCell>
                    <TableCell>{user.loginAttempts}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // Don't allow removing the last admin
                          const adminCount = users.filter(
                            (u) => u.role === "admin"
                          ).length;
                          if (
                            user.role === "admin" &&
                            adminCount <= 1 &&
                            user.id === currentUser.id
                          ) {
                            toast({
                              title: "لا يمكن حذف المسؤول الأخير",
                              variant: "destructive",
                            });
                            return;
                          }
                          removeUserMutation.mutate(user.id);
                        }}
                        disabled={removeUserMutation.isPending}
                      >
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
