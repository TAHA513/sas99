import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Staff, User } from "@shared/schema";
import { UserPlus2, Key, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const newStaffSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  name: z.string().min(1, "الاسم مطلوب"),
  role: z.enum(["admin", "sales", "inventory", "accounting"], {
    required_error: "الرجاء اختيار الدور",
  }),
  specialization: z.string().optional(),
});

type NewStaffData = z.infer<typeof newStaffSchema>;

export default function StaffPage() {
  const { data: staff } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isNewStaffDialogOpen, setIsNewStaffDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewStaffData>({
    resolver: zodResolver(newStaffSchema),
  });

  // Mutations
  const createStaffMutation = useMutation({
    mutationFn: async (data: NewStaffData) => {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('فشل إضافة الموظف');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "تم إضافة الموظف بنجاح" });
      setIsNewStaffDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateTokenMutation = useMutation({
    mutationFn: async (staffId: number) => {
      const response = await fetch(`/api/staff/${staffId}/token`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('فشل إنشاء الرمز');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء الرمز بنجاح",
        description: `الرمز الجديد: ${data.token}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: number) => {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('فشل حذف الموظف');
    },
    onSuccess: () => {
      toast({ title: "تم حذف الموظف بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
    },
  });

  // Helper function to get user details
  const getUserDetails = (userId: number) => {
    return users?.find(u => u.id === userId);
  };

  // Function to format work days array into readable string
  const formatWorkDays = (days: string[]) => {
    const arabicDays = {
      sunday: "الأحد",
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت"
    };
    return days.map(day => arabicDays[day as keyof typeof arabicDays]).join("، ");
  };

  // Function to format work hours array into readable string
  const formatWorkHours = (hours: string[]) => {
    return hours.join("، ");
  };

  const filteredStaff = staff?.filter((staffMember) => {
    const searchLower = searchTerm.toLowerCase();
    const user = getUserDetails(staffMember.userId);
    const userName = user?.name.toLowerCase() || '';
    const specialization = (staffMember.specialization || '').toLowerCase();
    const workDays = staffMember.workDays ? formatWorkDays(staffMember.workDays).toLowerCase() : '';

    return (
      userName.includes(searchLower) ||
      specialization.includes(searchLower) ||
      workDays.includes(searchLower)
    );
  });

  const onSubmit = (data: NewStaffData) => {
    createStaffMutation.mutate(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">الموظفين</h1>
          <Dialog open={isNewStaffDialogOpen} onOpenChange={setIsNewStaffDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus2 className="h-4 w-4 ml-2" />
                إضافة موظف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة موظف جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الموظف الجديد
                </DialogDescription>
              </DialogHeader>
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
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدور</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر دور الموظف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">مدير النظام</SelectItem>
                            <SelectItem value="sales">موظف مبيعات</SelectItem>
                            <SelectItem value="inventory">موظف مخزون</SelectItem>
                            <SelectItem value="accounting">موظف محاسبة</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التخصص</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    إضافة موظف
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن موظف..."
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>التخصص</TableHead>
                <TableHead>أيام العمل</TableHead>
                <TableHead>ساعات العمل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff?.map((staffMember) => {
                const user = getUserDetails(staffMember.userId);
                return (
                  <TableRow key={staffMember.id}>
                    <TableCell className="font-medium">{user?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {staffMember.specialization || "غير محدد"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staffMember.workDays ? formatWorkDays(staffMember.workDays) : "غير محدد"}
                    </TableCell>
                    <TableCell>
                      {staffMember.workHours ? formatWorkHours(staffMember.workHours) : "غير محدد"}
                    </TableCell>
                    <TableCell>
                      <Badge className={staffMember.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {staffMember.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => generateTokenMutation.mutate(staffMember.id)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                سيتم حذف الموظف نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteStaffMutation.mutate(staffMember.id)}
                                className="bg-red-600"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredStaff?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}