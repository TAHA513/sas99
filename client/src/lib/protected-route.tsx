import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: "admin" | "staff";
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if the user has the required role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-destructive">عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}