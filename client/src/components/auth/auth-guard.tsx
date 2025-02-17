import { useEffect } from "react";
import { useLocation } from "wouter";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);

  return <>{children}</>;
}
