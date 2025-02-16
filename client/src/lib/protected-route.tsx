import { Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = ["admin", "staff"],
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: string[];
}) {
  return <Route path={path} component={Component} />;
}