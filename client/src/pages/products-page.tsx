import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Barcode, Filter, SortAsc, SortDesc } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, ProductGroup } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/product-form";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProductsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "quantity" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: groups } = useQuery<ProductGroup[]>({
    queryKey: ["/api/product-groups"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حذف المنتج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStockStatus = (product: Product) => {
    if (!product.minimumQuantity) return null;

    if (product.quantity <= 0) {
      return {
        label: "نفذ المخزون",
        variant: "destructive" as const,
        showWarning: true
      };
    }

    if (product.quantity <= product.minimumQuantity) {
      return {
        label: "المخزون منخفض",
        variant: "warning" as const,
        showWarning: true
      };
    }

    return {
      label: "متوفر",
      variant: "default" as const,
      showWarning: false
    };
  };

  const getSortedAndFilteredProducts = () => {
    let filtered = products?.filter((product) => {
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        groups?.find(g => g.id === product.groupId)?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGroup = selectedGroup === "all" || product.groupId.toString() === selectedGroup;

      return matchesSearch && matchesGroup;
    }) || [];

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "price":
          comparison = Number(a.sellingPrice) - Number(b.sellingPrice);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const filteredProducts = getSortedAndFilteredProducts();
  const lowStockProducts = filteredProducts.filter(
    (product) => product.minimumQuantity && product.quantity <= product.minimumQuantity
  );

  // Sample data for the chart - in real app, this would come from the API
  const stockData = [
    { name: "يناير", المخزون: 400 },
    { name: "فبراير", المخزون: 300 },
    { name: "مارس", المخزون: 200 },
    { name: "أبريل", المخزون: 278 },
    { name: "مايو", المخزون: 189 },
    { name: "يونيو", المخزون: 239 },
  ];

  const ProductGrid = ({ products }: { products: Product[] }) => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="البحث في المنتجات..."
          className="w-64"
        />

        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب المجموعة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المجموعات</SelectItem>
            {groups?.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">الاسم</SelectItem>
            <SelectItem value="quantity">الكمية</SelectItem>
            <SelectItem value="price">السعر</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const group = groups?.find((g) => g.id === product.groupId);
          const stockStatus = getStockStatus(product);

          return (
            <Card key={product.id} className={
              stockStatus?.showWarning ? "border-yellow-500 dark:border-yellow-400" : ""
            }>
              <CardHeader className="space-y-0 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
                  <Badge variant={stockStatus?.variant || "default"}>
                    {stockStatus?.label || "متوفر"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">{group?.name}</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.barcode && (
                    <div className="flex items-center">
                      <Barcode className="h-4 w-4 ml-2" />
                      <span className="text-sm">{product.barcode}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>النوع:</span>
                    <span>{product.type === "piece" ? "قطعة" : "وزن"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>الكمية:</span>
                    <div className="flex items-center gap-2">
                      <span>{product.quantity}</span>
                      {stockStatus?.showWarning && (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>الحد الأدنى:</span>
                    <span>{product.minimumQuantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>سعر التكلفة:</span>
                    <span>{Number(product.costPrice).toLocaleString()} د.ع</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>سعر البيع:</span>
                    <span>{Number(product.sellingPrice).toLocaleString()} د.ع</span>
                  </div>
                  {product.isWeighted && (
                    <div className="flex justify-between text-sm">
                      <span>منتج وزني:</span>
                      <span>نعم</span>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {products.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            لا توجد منتجات مطابقة لبحثك
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">المنتجات</h1>
            <p className="text-muted-foreground">
              إدارة المنتجات والمخزون في متجرك
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setSelectedProduct(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
              </DialogHeader>
              <ProductForm groups={groups || []} product={selectedProduct || undefined} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>حركة المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockData}>
                  <defs>
                    <linearGradient id="المخزون" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="المخزون"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#المخزون)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">جميع المنتجات</TabsTrigger>
            <TabsTrigger value="low-stock">
              المنتجات منخفضة المخزون
              {lowStockProducts.length > 0 && (
                <Badge variant="destructive" className="mr-2">
                  {lowStockProducts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <ProductGrid products={filteredProducts} />
          </TabsContent>
          <TabsContent value="low-stock">
            <ProductGrid products={lowStockProducts} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}