import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useState, useEffect, useRef } from "react";
import { MinusCircle, Receipt, Search, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type InvoiceItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

export default function InvoicesPage() {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Get current date/time in Arabic format
  const currentDateTime = format(new Date(), 'dd MMMM yyyy - HH:mm', { locale: ar });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Keep barcode input focused
  useEffect(() => {
    const focusInput = () => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    };

    focusInput();
    // Focus on barcode input whenever it loses focus
    document.addEventListener('click', focusInput);

    return () => {
      document.removeEventListener('click', focusInput);
    };
  }, []);

  // Handle barcode scan
  const handleBarcodeScan = (barcode: string) => {
    const product = products?.find(p => p.barcode === barcode);
    if (product) {
      addProduct(product);
      setBarcodeInput("");
    } else {
      toast({
        title: "المنتج غير موجود",
        description: "لم يتم العثور على المنتج بهذا الباركود",
        variant: "destructive",
      });
    }
  };

  // Add product to invoice
  const addProduct = (product: Product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price
              }
            : item
        );
      }
      return [...prevItems, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.sellingPrice,
        total: product.sellingPrice
      }];
    });
  };

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    setItems(items.map((item, i) =>
      i === index
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  // Remove item from invoice
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;

  // Filter products based on search query
  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  // Print invoice
  const printInvoice = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = `
      <html dir="rtl">
        <head>
          <title>فاتورة</title>
          <style>
            @page { size: A4; margin: 1cm; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f8f9fa; }
            .totals { margin-top: 30px; text-align: left; }
            .footer { margin-top: 50px; text-align: center; font-size: 0.9em; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>فاتورة</h1>
            <p>${currentDateTime}</p>
          </div>

          <div class="info">
            <p><strong>العميل:</strong> ${customerName || 'غير محدد'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)} ريال</td>
                  <td>${item.total.toFixed(2)} ريال</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>المجموع:</strong> ${subtotal.toFixed(2)} ريال</p>
            ${discount > 0 ? `<p><strong>الخصم (${discount}%):</strong> ${discountAmount.toFixed(2)} ريال</p>` : ''}
            <p><strong>الإجمالي النهائي:</strong> ${finalTotal.toFixed(2)} ريال</p>
          </div>

          ${note ? `
            <div class="footer">
              <p><strong>ملاحظات:</strong> ${note}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Save invoice function
  const saveInvoice = () => {
    toast({
      title: "تم حفظ الفاتورة",
      description: "تم حفظ الفاتورة بنجاح",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">فاتورة جديدة</h1>
            <p className="text-muted-foreground mt-1">{currentDateTime}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveInvoice}>
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </Button>
            <Button onClick={printInvoice}>
              <Receipt className="h-4 w-4 ml-2" />
              طباعة
            </Button>
          </div>
        </div>

        <div className="grid gap-4 flex-1 md:grid-cols-[1fr,400px]">
          {/* Main Content - Products List */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Hidden Barcode Input - Positioned better */}
              <input
                ref={barcodeInputRef}
                type="text"
                className="fixed top-0 left-0 opacity-0 pointer-events-none"
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value);
                  if (e.target.value.length >= 8) { // Minimum barcode length
                    handleBarcodeScan(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && barcodeInput) {
                    handleBarcodeScan(barcodeInput);
                  }
                }}
              />

              {/* Products Search */}
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن منتج..."
                  className="pr-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && filteredProducts && (
                  <div className="absolute w-full mt-1 p-2 bg-card border rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        className="w-full text-right px-2 py-1.5 hover:bg-accent rounded-md"
                        onClick={() => {
                          addProduct(product);
                          setSearchQuery("");
                        }}
                      >
                        {product.name} - {product.barcode}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-right">المنتج</th>
                      <th className="p-2 text-center">الكمية</th>
                      <th className="p-2 text-center">السعر</th>
                      <th className="p-2 text-center">الإجمالي</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, Number(e.target.value))}
                            className="w-20 mx-auto text-center"
                          />
                        </td>
                        <td className="p-2 text-center">{item.price.toFixed(2)}</td>
                        <td className="p-2 text-center">{item.total.toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                          >
                            <MinusCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          قم بمسح باركود أو البحث عن منتج لإضافته
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Invoice Details */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Customer Name Input */}
              <div className="space-y-2">
                <Label>اسم العميل</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="أدخل اسم العميل"
                />
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <Label>نسبة الخصم (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي:</span>
                  <span>{subtotal.toFixed(2)} ريال</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>الخصم ({discount}%):</span>
                    <span>- {discountAmount.toFixed(2)} ريال</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي النهائي:</span>
                  <span>{finalTotal.toFixed(2)} ريال</span>
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

              {/* Save & Print Buttons */}
              <div className="grid gap-2">
                <Button className="w-full" variant="outline" onClick={saveInvoice}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ الفاتورة
                </Button>
                <Button className="w-full" onClick={printInvoice}>
                  <Receipt className="h-4 w-4 ml-2" />
                  طباعة الفاتورة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}