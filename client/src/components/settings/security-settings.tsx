import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Shield, UserCheck, History, Users, UserPlus, Trash2, Key } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SYSTEM_ROLES, DEFAULT_PERMISSIONS } from "@shared/schema";

// مخطط نموذج إضافة موظف جديد
const newStaffSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  role: z.enum(Object.values(SYSTEM_ROLES) as [string, ...string[]]),
});

type NewStaffFormData = z.infer<typeof newStaffSchema>;

export function SecuritySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewStaffDialog, setShowNewStaffDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // نموذج إضافة موظف جديد
  const newStaffForm = useForm<NewStaffFormData>({
    resolver: zodResolver(newStaffSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      role: SYSTEM_ROLES.STAFF,
    },
  });

  // جلب إعدادات الأمان
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings/store"],
    queryFn: async () => {
      const res = await fetch("/api/settings/store");
      if (!res.ok) throw new Error("فشل في جلب الإعدادات");
      return res.json();
    },
  });

  // جلب قائمة المستخدمين
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("فشل في جلب المستخدمين");
      return res.json();
    },
  });

  // جلب صلاحيات المستخدم المحدد
  const { data: userPermissions } = useQuery({
    queryKey: ["/api/users", selectedUserId, "permissions"],
    queryFn: async () => {
      const res = await fetch(`/api/users/${selectedUserId}/permissions`);
      if (!res.ok) throw new Error("فشل في جلب الصلاحيات");
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  // تحديث إعدادات الأمان
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
      queryClient.invalidateQueries({ queryKey: ["/api/settings/store"] });
      toast({
        title: "تم تحديث الإعدادات",
        description: "تم تحديث إعدادات الأمان بنجاح",
      });
    },
  });

  // إضافة موظف جديد
  const addStaffMutation = useMutation({
    mutationFn: async (data: NewStaffFormData) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل إضافة الموظف");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowNewStaffDialog(false);
      newStaffForm.reset();
      toast({
        title: "تم إضافة الموظف",
        description: "تم إضافة الموظف الجديد بنجاح",
      });
    },
  });

  // حذف موظف
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل حذف المستخدم");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح",
      });
    },
  });

  // تحديث صلاحيات المستخدم
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ userId, permission, granted }: { userId: number; permission: string; granted: boolean }) => {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission, granted }),
      });
      if (!res.ok) throw new Error("فشل تحديث الصلاحيات");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", selectedUserId, "permissions"] });
      toast({
        title: "تم تحديث الصلاحيات",
        description: "تم تحديث صلاحيات المستخدم بنجاح",
      });
    },
  });

  if (isLoadingSettings || isLoadingUsers) {
    return <div>جاري التحميل...</div>;
  }

  const handleToggle = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ key, value });
  };

  // تنظيم الصلاحيات حسب الفئة
  const groupedPermissions = Object.entries(DEFAULT_PERMISSIONS).reduce((acc, [key, value]) => {
    const category = key.split('_')[0];
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, value });
    return acc;
  }, {} as Record<string, Array<{ key: string; value: string }>>);

  return (
    <div className="space-y-6">
      {/* إعدادات الأمان الأساسية */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>إعدادات الأمان الأساسية</CardTitle>
              <CardDescription>
                تحكم في إعدادات الأمان وصلاحيات الوصول للنظام
              </CardDescription>
            </div>
          </div>
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
            />
          </div>
        </CardContent>
      </Card>

      {/* إدارة الموظفين والصلاحيات */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>إدارة الموظفين والصلاحيات</CardTitle>
                <CardDescription>
                  إضافة وإدارة الموظفين وتحديد صلاحياتهم
                </CardDescription>
              </div>
            </div>
            <Dialog open={showNewStaffDialog} onOpenChange={setShowNewStaffDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 ml-2" />
                  إضافة موظف جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة موظف جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات الموظف الجديد وحدد دوره في النظام
                  </DialogDescription>
                </DialogHeader>
                <Form {...newStaffForm}>
                  <form onSubmit={newStaffForm.handleSubmit((data) => addStaffMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={newStaffForm.control}
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
                      control={newStaffForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={newStaffForm.control}
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
                    <FormField
                      control={newStaffForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الدور</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="اختر الدور" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(SYSTEM_ROLES).map(([key, value]) => (
                                <SelectItem key={value} value={value}>
                                  {key}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">
                      {addStaffMutation.isPending ? "جاري الإضافة..." : "إضافة الموظف"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* قائمة الموظفين */}
            <div className="grid gap-4">
              {users?.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <UserCheck className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-medium">{user.name || user.username}</div>
                      <div className="text-sm text-muted-foreground">{user.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <Key className="h-4 w-4 ml-2" />
                      الصلاحيات
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUserMutation.mutate(user.id)}
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            {/* إدارة صلاحيات المستخدم المحدد */}
            {selectedUserId && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">صلاحيات المستخدم</h3>
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {permissions.map(({ key, value }) => {
                          const hasPermission = userPermissions?.some(
                            (p: any) => p.key === key && p.granted
                          );
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <Label htmlFor={key}>{value}</Label>
                              <Switch
                                id={key}
                                checked={hasPermission}
                                onCheckedChange={(checked) =>
                                  updatePermissionMutation.mutate({
                                    userId: selectedUserId,
                                    permission: key,
                                    granted: checked,
                                  })
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* سجل تسجيل الدخول */}
      {settings?.staffLoginHistory && settings.staffLoginHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <History className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>سجل تسجيل الدخول</CardTitle>
                <CardDescription>
                  آخر محاولات تسجيل الدخول للموظفين
                </CardDescription>
              </div>
            </div>
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
                {settings.staffLoginHistory.map((log: any, index: number) => (
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