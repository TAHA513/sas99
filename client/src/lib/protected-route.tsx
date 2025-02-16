import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  staffOnly = false,
}: {
  path: string;
  component: () => React.JSX.Element;
  staffOnly?: boolean;
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
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check for staff access
  if (staffOnly && user.role !== 'staff') {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Check for admin access (non-staff routes)
  if (!staffOnly && user.role === 'staff') {
    return (
      <Route path={path}>
        <Redirect to="/staff" />
      </Route>
    );
  }

  return <Component />
}