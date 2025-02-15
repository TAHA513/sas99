import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  UserCog,
  TrendingUp,
  Package2,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";
import { ar } from "date-fns/locale";

// Sample data - replace with actual API data
const salesData = [
  { name: "يناير", المبيعات: 4000, الأرباح: 2400 },
  { name: "فبراير", المبيعات: 3000, الأرباح: 1398 },
  { name: "مارس", المبيعات: 2000, الأرباح: 9800 },
  { name: "أبريل", المبيعات: 2780, الأرباح: 3908 },
  { name: "مايو", المبيعات: 1890, الأرباح: 4800 },
  { name: "يونيو", المبيعات: 2390, الأرباح: 3800 },
];

const categoryData = [
  { name: "إلكترونيات", value: 400 },
  { name: "ملابس", value: 300 },
  { name: "أغذية", value: 300 },
  { name: "أدوات منزلية", value: 200 },
];

const topProductsData = [
  { name: "منتج 1", قيمة_المبيعات: 4000 },
  { name: "منتج 2", قيمة_المبيعات: 3000 },
  { name: "منتج 3", قيمة_المبيعات: 2000 },
  { name: "منتج 4", قيمة_المبيعات: 2780 },
  { name: "منتج 5", قيمة_المبيعات: 1890 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: staff } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">العملاء</CardTitle>
              <Users className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي عدد العملاء المسجلين</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المواعيد</CardTitle>
              <Calendar className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{appointments?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">مواعيد اليوم</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
              <Package2 className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المنتجات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
              <UserCog className="h-4 w-4 text-foreground opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي عدد الموظفين</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Sales and Profit Trends */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>تحليل المبيعات والأرباح</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${value.toLocaleString('ar-IQ')} د.ع`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString('ar-IQ')} د.ع`, '']}
                    labelStyle={{ fontFamily: 'inherit', textAlign: 'right' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="المبيعات"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="الأرباح"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المنتجات حسب الفئات</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${value.toLocaleString('ar-IQ')} د.ع`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString('ar-IQ')} د.ع`, 'قيمة المبيعات']}
                    labelStyle={{ fontFamily: 'inherit', textAlign: 'right' }}
                  />
                  <Bar
                    dataKey="قيمة_المبيعات"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}