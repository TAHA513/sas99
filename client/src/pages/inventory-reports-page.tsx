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
import { Package2 } from "lucide-react";
import type { Product } from "@shared/schema";

export default function InventoryReportsPage() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const retailProducts = products.filter(p => p.type === "piece");
  const wholesaleProducts = products.filter(p => p.type === "weight");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', {
      style: 'currency',
      currency: 'IQD'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">تقارير المخزون والأسعار</h1>
          <p className="text-muted-foreground">عرض تفصيلي لأرصدة وأسعار المخزون بالجملة والمفرد</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">منتجات المفرد</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retailProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">منتجات الجملة</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wholesaleProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  products.reduce((sum, product) => 
                    sum + (Number(product.quantity) * Number(product.costPrice)), 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة أسعار المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الكمية المتوفرة</TableHead>
                  <TableHead>سعر التكلفة</TableHead>
                  <TableHead>سعر البيع بالمفرد</TableHead>
                  <TableHead>سعر البيع بالجملة</TableHead>
                  <TableHead>الربح المتوقع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const isWholesale = product.type === "weight";
                  const quantity = Number(product.quantity);
                  const costPrice = Number(product.costPrice);
                  const sellingPrice = Number(product.sellingPrice);
                  const expectedProfit = (sellingPrice - costPrice) * quantity;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{isWholesale ? "جملة" : "مفرد"}</TableCell>
                      <TableCell>
                        {quantity} {isWholesale ? "كغم" : "قطعة"}
                      </TableCell>
                      <TableCell>{formatCurrency(costPrice)}</TableCell>
                      <TableCell>
                        {isWholesale ? "-" : formatCurrency(sellingPrice)}
                      </TableCell>
                      <TableCell>
                        {isWholesale ? formatCurrency(sellingPrice) : "-"}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(expectedProfit)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                      لا توجد منتجات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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