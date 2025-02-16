import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Shield, UserCheck, History, Users, UserPlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SYSTEM_ROLES } from "@shared/schema";

const newStaffSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.enum([SYSTEM_ROLES.MANAGER, SYSTEM_ROLES.STAFF]),
});

type NewStaffFormData = z.infer<typeof newStaffSchema>;

export function SecuritySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showNewStaffDialog, setShowNewStaffDialog] = useState(false);

  const newStaffForm = useForm<NewStaffFormData>({
    resolver: zodResolver(newStaffSchema),
    defaultValues: {
      username: "",
      name: "",
      password: "",
      role: SYSTEM_ROLES.STAFF,
    },
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings/store"],
    queryFn: async () => {
      const res = await fetch("/api/settings/store");
      if (!res.ok) throw new Error("فشل في جلب الإعدادات");
      return res.json();
    },
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("فشل في جلب المستخدمين");
      return res.json();
    },
  });

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

  const addStaffMutation = useMutation({
    mutationFn: async (data: NewStaffFormData) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل إضافة المستخدم");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setShowNewStaffDialog(false);
      newStaffForm.reset();
      toast({
        title: "تم إضافة المستخدم",
        description: "تم إضافة المستخدم الجديد بنجاح",
      });
    },
  });

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

  if (isLoadingSettings || isLoadingUsers) {
    return <div>جاري التحميل...</div>;
  }

  const handleToggle = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({ key, value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">الأمان والصلاحيات</h2>
          <p className="text-muted-foreground mt-2">إدارة إعدادات الأمان وصلاحيات المستخدمين</p>
        </div>
        <Dialog open={showNewStaffDialog} onOpenChange={setShowNewStaffDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المستخدم الجديد وحدد دوره في النظام
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
                          <SelectItem value={SYSTEM_ROLES.MANAGER}>مدير</SelectItem>
                          <SelectItem value={SYSTEM_ROLES.STAFF}>موظف</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {addStaffMutation.isPending ? "جاري الإضافة..." : "إضافة المستخدم"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>المستخدمون والصلاحيات</CardTitle>
              <CardDescription>
                إدارة المستخدمين وصلاحياتهم في النظام
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user: any) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <UserCheck className="h-6 w-6 text-primary" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.role === SYSTEM_ROLES.MANAGER ? "مدير" : "موظف"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {settings?.staffLoginHistory && settings.staffLoginHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <History className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>سجل تسجيل الدخول</CardTitle>
                <CardDescription>
                  آخر محاولات تسجيل الدخول للمستخدمين
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