import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Customer, Product } from "@shared/schema";
import { useState } from "react";
import { Plus, MinusCircle, Receipt } from "lucide-react";

type InvoiceItem = {
  productId: number;
  quantity: number;
  price: number;
};

export default function InvoicesPage() {
  const [customerId, setCustomerId] = useState<string>("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [note, setNote] = useState("");

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const addItem = () => {
    setItems([...items, { productId: 0, quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'productId') {
      const product = products?.find(p => p.id === value);
      if (product) {
        newItems[index].price = product.sellingPrice;
      }
    }

    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const vat = subtotal * 0.15; // 15% VAT
    return subtotal + vat;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">الفواتير</h1>
          <Button>
            <Receipt className="h-4 w-4 ml-2" />
            إنشاء فاتورة
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>فاتورة جديدة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>العميل</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>المنتجات</Label>
                <Button variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة منتج
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Select
                        value={String(item.productId)}
                        onValueChange={(value) => updateItem(index, 'productId', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={String(product.id)}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        placeholder="الكمية"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', Number(e.target.value))}
                        placeholder="السعر"
                      />
                    </div>
                    <div className="w-32 text-left">
                      {(item.price * item.quantity).toFixed(2)} ريال
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <MinusCircle className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>المجموع الفرعي:</span>
                <span>{calculateSubtotal().toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{(calculateSubtotal() * 0.15).toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>الإجمالي:</span>
                <span>{calculateTotal().toFixed(2)} ريال</span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="أضف أي ملاحظات إضافية هنا"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button>
                <Receipt className="h-4 w-4 ml-2" />
                إنشاء الفاتورة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
