import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Shield, UserCheck, History } from "lucide-react";

export function SecuritySettings() {
  const { toast } = useToast();

  // جلب إعدادات الأمان
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings/store"],
    queryFn: async () => {
      const res = await fetch("/api/settings/store");
      if (!res.ok) throw new Error("فشل في جلب الإعدادات");
      return res.json();
    },
  });

  // تحديث الإعدادات
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { key: string; value: boolean }) => {
      const res = await fetch("/api/settings/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل تحديث الإعدادات");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الإعدادات",
        description: "تم تحديث إعدادات الأمان بنجاح",
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

  const handleToggle = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ key, value });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الأمان</CardTitle>
          <CardDescription>
            تحكم في إعدادات الأمان وصلاحيات الوصول للنظام
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* تسجيل دخول الموظفين */}
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-0.5">
              <Label>تسجيل دخول الموظفين</Label>
              <div className="text-sm text-muted-foreground">
                السماح للموظفين بتسجيل الدخول إلى النظام
              </div>
            </div>
            <Switch
              checked={settings?.enableStaffLogin}
              onCheckedChange={(checked) => handleToggle("enableStaffLogin", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          {/* تقييد وصول الموظفين */}
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-0.5">
              <Label>تقييد وصول الموظفين</Label>
              <div className="text-sm text-muted-foreground">
                تقييد وصول الموظفين إلى أقسام معينة من النظام
              </div>
            </div>
            <Switch
              checked={settings?.restrictStaffAccess}
              onCheckedChange={(checked) => handleToggle("restrictStaffAccess", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          {/* تتبع نشاط الموظفين */}
          <div className="flex items-center justify-between space-x-4">
            <div className="space-y-0.5">
              <Label>تتبع نشاط الموظفين</Label>
              <div className="text-sm text-muted-foreground">
                تسجيل كافة أنشطة الموظفين في النظام
              </div>
            </div>
            <Switch
              checked={settings?.trackStaffActivity}
              onCheckedChange={(checked) => handleToggle("trackStaffActivity", checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* سجل تسجيل الدخول */}
      {settings?.staffLoginHistory && settings.staffLoginHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>سجل تسجيل الدخول</CardTitle>
            <CardDescription>آخر محاولات تسجيل الدخول للموظفين</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>التاريخ والوقت</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.staffLoginHistory.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}</TableCell>
                    <TableCell>
                      {log.success ? (
                        <span className="text-green-600">نجاح</span>
                      ) : (
                        <span className="text-red-600">فشل</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
