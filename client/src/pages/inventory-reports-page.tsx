import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Package2, DollarSign, LineChart, TrendingUp, Wallet, BarChart3 } from "lucide-react";
import type { Product } from "@shared/schema";
import {
  PieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function InventoryReportsPage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const retailProducts = products.filter(p => p.type === "piece");
  const wholesaleProducts = products.filter(p => p.type === "weight");

  // حساب إجمالي قيمة المخزون بسعر التكلفة
  const totalInventoryCost = products.reduce((sum, product) => {
    return sum + (Number(product.quantity) * Number(product.costPrice))
  }, 0);

  // حساب إجمالي قيمة المخزون بسعر البيع
  const totalInventorySalePrice = products.reduce((sum, product) => {
    return sum + (Number(product.quantity) * Number(product.sellingPrice))
  }, 0);

  // حساب الربح المتوقع
  const expectedProfit = totalInventorySalePrice - totalInventoryCost;

  // حساب نسبة الربح
  const profitMargin = ((expectedProfit / totalInventoryCost) * 100).toFixed(2);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD'
    }).format(amount);
  };

  // بيانات الرسم البياني الدائري
  const pieChartData = [
    { name: 'منتجات المفرد', value: retailProducts.length },
    { name: 'منتجات الجملة', value: wholesaleProducts.length },
  ];

  // بيانات الرسم البياني العمودي للمقارنة
  const barChartData = products.slice(0, 5).map(product => ({
    name: product.name,
    'سعر التكلفة': Number(product.costPrice),
    'سعر البيع': Number(product.sellingPrice),
  }));

  // بيانات الرسم البياني الخطي للأرباح
  const profitData = products.slice(0, 5).map(product => ({
    name: product.name,
    'الربح المتوقع': Number(product.sellingPrice) - Number(product.costPrice),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">تقارير المخزون والسيولة</h1>
          <p className="text-muted-foreground">عرض تفصيلي للسيولة المتوفرة وأرصدة المخزون</p>
        </div>

        {/* قسم السيولة الجديد */}
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle>تقرير السيولة المتوفرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">السيولة بسعر التكلفة</h3>
                <div className="text-2xl font-bold">{formatCurrency(totalInventoryCost)}</div>
                <p className="text-sm text-muted-foreground">
                  إجمالي رأس المال المستثمر في المخزون
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">السيولة بسعر البيع</h3>
                <div className="text-2xl font-bold">{formatCurrency(totalInventorySalePrice)}</div>
                <p className="text-sm text-muted-foreground">
                  إجمالي القيمة المتوقعة عند بيع كامل المخزون
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* قسم احصائيات المخزون */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد المنتجات الكلي في المخزون
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">منتجات المفرد</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retailProducts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد منتجات البيع بالمفرد
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">منتجات الجملة</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wholesaleProducts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد منتجات البيع بالجملة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* رسم بياني دائري لتوزيع المنتجات */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>توزيع المنتجات</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8884d8' : '#82ca9d'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `عدد المنتجات: ${value}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني خطي للأرباح المتوقعة */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>الأرباح المتوقعة (أعلى 5 منتجات)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => `${value.toLocaleString('ar-IQ')} د.ع`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString('ar-IQ')} د.ع`, 'الربح المتوقع']}
                    labelStyle={{ fontFamily: 'inherit', textAlign: 'right' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="الربح المتوقع" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d', strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                    animationDuration={1500}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني عمودي لمقارنة الأسعار */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>مقارنة الأسعار (أعلى 5 منتجات)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => `${value.toLocaleString('ar-IQ')} د.ع`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toLocaleString('ar-IQ')} د.ع`, '']}
                    labelStyle={{ fontFamily: 'inherit', textAlign: 'right' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="سعر التكلفة" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar 
                    dataKey="سعر البيع" 
                    fill="#82ca9d" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="retail" className="space-y-4">
          <TabsList>
            <TabsTrigger value="retail">المفرد</TabsTrigger>
            <TabsTrigger value="wholesale">الجملة</TabsTrigger>
          </TabsList>

          <TabsContent value="retail" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل مبيعات المفرد</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الباركود</TableHead>
                      <TableHead>الكمية المتوفرة</TableHead>
                      <TableHead>سعر التكلفة</TableHead>
                      <TableHead>سعر البيع</TableHead>
                      <TableHead>القيمة الإجمالية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retailProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.barcode || '-'}</TableCell>
                        <TableCell>{product.quantity.toString()}</TableCell>
                        <TableCell>{formatCurrency(Number(product.costPrice))}</TableCell>
                        <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(product.quantity) * Number(product.costPrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {retailProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          لا توجد منتجات مفردة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wholesale" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل مبيعات الجملة</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الباركود</TableHead>
                      <TableHead>الوزن المتوفر</TableHead>
                      <TableHead>سعر التكلفة للكيلو</TableHead>
                      <TableHead>سعر البيع للكيلو</TableHead>
                      <TableHead>القيمة الإجمالية</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wholesaleProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.barcode || '-'}</TableCell>
                        <TableCell>{product.quantity.toString()} كغم</TableCell>
                        <TableCell>{formatCurrency(Number(product.costPrice))}</TableCell>
                        <TableCell>{formatCurrency(Number(product.sellingPrice))}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(product.quantity) * Number(product.costPrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                    {wholesaleProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          لا توجد منتجات جملة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}