import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Calendar,
  UserCog,
  Settings,
  Megaphone,
  Ticket,
  Package,
  Barcode,
  Receipt,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "لوحة التحكم",
    href: "/",
    icon: Home,
  },
  {
    title: "العملاء",
    href: "/customers",
    icon: Users,
  },
  {
    title: "المواعيد",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "الموظفين",
    href: "/staff",
    icon: UserCog,
  },
  {
    title: "المنتجات",
    href: "/products",
    icon: Package,
  },
  {
    title: "الفواتير",
    href: "/invoices",
    icon: Receipt,
  },
  {
    title: "التسويق",
    href: "/marketing",
    icon: Megaphone,
  },
  {
    title: "العروض",
    href: "/promotions",
    icon: Ticket,
  },
  {
    title: "الباركود",
    href: "/barcodes",
    icon: Barcode,
  },
  {
    title: "الإعدادات",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const [location] = useLocation();

  return (
    <div className="h-screen w-64 border-l bg-card p-4 flex flex-col">
      <div className="flex items-center justify-center h-16 mb-8">
        <h1 className="text-2xl font-bold">نظام الإدارة</h1>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                location === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </a>
          </Link>
        ))}
      </nav>
    </div>
  );
}