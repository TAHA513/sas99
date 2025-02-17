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
  LineChart,
  CreditCard,
  ShoppingCart,
  Truck,
  DollarSign,
  FolderIcon,
  ClipboardList, // Add import for inventory report icon
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
    title: "المشتريات",
    href: "/purchases",
    icon: ShoppingCart,
  },
  {
    title: "الموردين",
    href: "/suppliers",
    icon: Truck,
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
    title: "التقسيط",
    href: "/installments",
    icon: CreditCard,
  },
  {
    title: "المصروفات",
    href: "/expenses",
    icon: DollarSign,
  },
  {
    title: "فئات المصروفات",
    href: "/expense-categories",
    icon: FolderIcon,
  },
  {
    title: "التقارير العامة",
    href: "/reports",
    icon: LineChart,
  },
  {
    title: "تقارير المخزون",
    href: "/inventory-reports",
    icon: ClipboardList,
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
      <div className="flex flex-col items-center justify-center h-16 mb-8">
        <h1 className="text-2xl font-bold">نظام الإدارة</h1>
        <h2 className="text-lg text-muted-foreground">SAS</h2>
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center justify-start gap-3 px-3 py-2 h-10",
                location === item.href
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );
}