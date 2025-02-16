import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ["admin", "staff"],
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: string[];
}) {
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
        <Redirect to="/staff/login" />
      </Route>
    );
  }

  // التحقق من صلاحيات المستخدم
  if (!allowedRoles.includes(user.role)) {
    return (
      <Route path={path}>
        <Redirect to="/staff" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}