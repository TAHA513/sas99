import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PermissionsManager } from "./permissions-manager";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

export function SecuritySettings() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>إعدادات الأمان</CardTitle>
          </div>
          <CardDescription>
            إدارة إعدادات الأمان والصلاحيات في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsManager />
        </CardContent>
      </Card>
    </div>
  );
}
