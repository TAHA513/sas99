import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  useEffect(() => {
    // التوجيه المباشر إلى لوحة التحكم
    window.location.replace("/");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}