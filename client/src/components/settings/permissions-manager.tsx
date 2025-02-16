import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function PermissionsManager() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
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

  // جلب قائمة الصلاحيات
  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ["/api/permissions"],
    queryFn: async () => {
      const res = await fetch("/api/permissions");
      if (!res.ok) throw new Error("فشل في جلب الصلاحيات");
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

  // تحديث صلاحيات المستخدم
  const updatePermissionMutation = useMutation({
    mutationFn: async ({
      userId,
      permissionId,
      granted,
    }: {
      userId: number;
      permissionId: number;
      granted: boolean;
    }) => {
      const res = await fetch(`/api/users/${userId}/permissions/${permissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ granted }),
      });
      if (!res.ok) throw new Error("فشل تحديث الصلاحية");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", selectedUserId, "permissions"] });
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

  if (loadingUsers || loadingPermissions) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إدارة صلاحيات المستخدمين</CardTitle>
        <CardDescription>حدد المستخدم لإدارة صلاحياته</CardDescription>
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
                  onClick={() => setSelectedUserId(user.id)}
                >
                  {user.name || user.username}
                </Button>
              ))}
            </div>
          </div>

          {/* جدول الصلاحيات */}
          {selectedUserId && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الصلاحية</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions?.map((permission: any) => {
                    const userPermission = userPermissions?.find(
                      (up: any) => up.permissionId === permission.id
                    );
                    return (
                      <TableRow key={permission.id}>
                        <TableCell>{permission.name}</TableCell>
                        <TableCell>{permission.description}</TableCell>
                        <TableCell>
                          <Switch
                            checked={userPermission?.granted ?? false}
                            onCheckedChange={(checked) =>
                              updatePermissionMutation.mutate({
                                userId: selectedUserId,
                                permissionId: permission.id,
                                granted: checked,
                              })
                            }
                            disabled={updatePermissionMutation.isPending}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}