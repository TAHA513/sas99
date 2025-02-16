import { Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({
  path,
  component: Component,
  requiredPermission,
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredPermission?: string;
}) {
  const { user } = useAuth();

  // Get user permissions if requiredPermission is specified
  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ["/api/users", user?.id, "permissions"],
    queryFn: async () => {
      if (!user?.id || !requiredPermission) return [];
      const res = await fetch(`/api/users/${user.id}/permissions`);
      if (!res.ok) throw new Error("فشل في جلب الصلاحيات");
      return res.json();
    },
    enabled: !!user?.id && !!requiredPermission,
  });

  if (!user) {
    window.location.replace("/auth/login");
    return null;
  }

  // Show loading while checking permissions
  if (requiredPermission && loadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Check if user has required permission
  if (requiredPermission && user.role === "staff") {
    const hasPermission = permissions?.some(
      (p: any) => p.key === requiredPermission && p.granted
    );

    if (!hasPermission) {
      window.location.replace("/");
      return null;
    }
  }

  return <Route path={path} component={Component} />;
}