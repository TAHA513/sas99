import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldAlert, UserCheck } from "lucide-react";
import { SYSTEM_ROLES, DEFAULT_PERMISSIONS } from "@shared/schema";

export function PermissionsManager() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // جلب قائمة المستخدمين
  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("فشل في جلب المستخدمين");
      return res.json();
    }
  });

  // جلب صلاحيات المستخدم المحدد
  const { data: userPermissions, isLoading: loadingUserPermissions } = useQuery({
    queryKey: ["/api/users", selectedUserId, "permissions"],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/users/${selectedUserId}/permissions`);
      if (!res.ok) throw new Error("فشل في جلب صلاحيات المستخدم");
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  // تحديث دور المستخدم
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("فشل تحديث الدور");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", selectedUserId, "permissions"]
      });
      toast({
        title: "تم تحديث الدور",
        description: "تم تحديث دور المستخدم بنجاح",
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

  // تحديث صلاحيات المستخدم
  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      userId,
      permissionKey,
      granted,
    }: {
      userId: number;
      permissionKey: string;
      granted: boolean;
    }) => {
      const res = await fetch(`/api/users/${userId}/permissions/${permissionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ granted }),
      });
      if (!res.ok) throw new Error("فشل تحديث الصلاحية");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/users", selectedUserId, "permissions"]
      });
      toast({
        title: "تم تحديث الصلاحية",
        description: "تم تحديث صلاحيات المستخدم بنجاح",
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

  if (loadingUsers) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // تنظيم الصلاحيات حسب الفئة
  const groupedPermissions = Object.entries(DEFAULT_PERMISSIONS).reduce((acc, [key, value]) => {
    const category = value.split('_')[0].toLowerCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ key, value });
    return acc;
  }, {} as Record<string, Array<{ key: string, value: string }>>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة صلاحيات المستخدمين</CardTitle>
        <CardDescription>تعيين وتعديل أدوار وصلاحيات المستخدمين</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* قائمة المستخدمين */}
          <div className="space-y-2">
            <Label>اختر المستخدم</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {users?.map((user: any) => (
                <Button
                  key={user.id}
                  variant={selectedUserId === user.id ? "default" : "outline"}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSelectedRole(user.role);
                  }}
                  className="justify-start"
                >
                  <div className="flex items-center gap-2">
                    {user.role === SYSTEM_ROLES.SUPER_ADMIN ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                    <span>{user.name || user.username}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {selectedUserId && (
            <>
              {/* تحديد الدور */}
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select
                  value={selectedRole || undefined}
                  onValueChange={(value) => {
                    setSelectedRole(value);
                    updateRoleMutation.mutate({
                      userId: selectedUserId,
                      role: value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(SYSTEM_ROLES).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* جدول الصلاحيات */}
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>الصلاحية</TableHead>
                            <TableHead>الحالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {permissions.map(({ key, value }) => {
                            const hasPermission = userPermissions?.some(
                              (p: any) => p.key === key && p.granted
                            );
                            return (
                              <TableRow key={key}>
                                <TableCell>{value}</TableCell>
                                <TableCell>
                                  <Switch
                                    checked={hasPermission}
                                    onCheckedChange={(checked) =>
                                      updatePermissionMutation.mutate({
                                        userId: selectedUserId,
                                        permissionKey: key,
                                        granted: checked,
                                      })
                                    }
                                    disabled={
                                      updatePermissionMutation.isPending ||
                                      selectedRole === SYSTEM_ROLES.SUPER_ADMIN
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}