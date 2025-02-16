import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Product, StoreSetting } from "@shared/schema";
import { useState, useEffect, useRef } from "react";
import { MinusCircle, Receipt, Search, Save, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/storage";
import * as XLSX from 'xlsx';

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

  const { data: storeSettings } = useQuery<StoreSetting>({
    queryKey: ["/api/store-settings"],
  });

  // Focus management function
  useEffect(() => {
    const focusInput = () => {
      if (barcodeInputRef.current &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA') {
        barcodeInputRef.current.focus();
      }
    };

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


  // Update printInvoice function with improved styling
  const printInvoice = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = `
      <html dir="rtl">
        <head>
          <title>فاتورة</title>
          <style>
            @page { 
              size: 80mm 297mm; /* Thermal printer size */
              margin: 0; 
            }
            @media print {
              body { 
                width: 80mm;
                margin: 0;
                padding: 5mm;
              }
            }
            body { 
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px dashed #000;
            }
            .logo { 
              max-width: 60mm; 
              max-height: 60mm; 
              margin: 0 auto 10px;
            }
            .store-name { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .invoice-details {
              margin-bottom: 10px;
              padding: 5px 0;
              border-bottom: 1px dashed #000;
            }
            .items { 
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            .items th { 
              border-bottom: 1px solid #000;
              padding: 5px;
              text-align: right;
              font-size: 11px;
            }
            .items td { 
              padding: 5px;
              text-align: right;
              font-size: 11px;
            }
            .totals { 
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px dashed #000;
            }
            .footer { 
              margin-top: 20px;
              text-align: center;
              font-size: 10px;
              padding-top: 10px;
              border-top: 1px dashed #000;
            }
            .divider {
              border-bottom: 1px dashed #000;
              margin: 10px 0;
            }
            .qr-code {
              text-align: center;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${storeSettings?.storeLogo ? `
              <img src="${storeSettings.storeLogo}" class="logo" alt="شعار المتجر" />
            ` : ''}
            ${storeSettings?.storeName ? `
              <div class="store-name">${storeSettings.storeName}</div>
            ` : ''}
          </div>

          <div class="invoice-details">
            <div>رقم الفاتورة: ${new Date().getTime()}</div>
            <div>التاريخ: ${currentDateTime}</div>
            <div>العميل: ${customerName || 'عميل نقدي'}</div>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price, true)}</td>
                  <td>${formatCurrency(item.total, true)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>المجموع: ${formatCurrency(subtotal, true)}</div>
            ${discount > 0 ? `
              <div>الخصم (${discount}%): ${formatCurrency(discountAmount, true)}</div>
            ` : ''}
            <div style="font-weight: bold; margin-top: 5px;">
              الإجمالي النهائي: ${formatCurrency(finalTotal, true)}
            </div>
          </div>

          ${note ? `
            <div class="divider"></div>
            <div>ملاحظات: ${note}</div>
          ` : ''}

          <div class="footer">
            ${storeSettings?.storeName ? `
              <div>شكراً لتسوقكم من ${storeSettings.storeName}</div>
            ` : ''}
          </div>

          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const saveInvoice = async () => {
    try {
      const invoiceData = {
        customerName,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal,
        discount,
        discountAmount,
        finalTotal,
        note,
        date: new Date().toISOString()
      };

      await apiRequest("POST", "/api/invoices", invoiceData);

      // Reset form after successful save
      setItems([]);
      setCustomerName('');
      setDiscount(0);
      setNote('');
      setBarcodeInput('');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });

      toast({
        title: "تم حفظ الفاتورة",
        description: "تم حفظ الفاتورة بنجاح في النظام",
      });
    } catch (error) {
      toast({
        title: "خطأ في حفظ الفاتورة",
        description: "حدث خطأ أثناء محاولة حفظ الفاتورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  // Add new function to export to Excel
  const exportToExcel = () => {
    if (!items || items.length === 0) {
      toast({
        title: "لا يمكن تصدير الفاتورة",
        description: "الفاتورة لا تحتوي على أي منتجات",
        variant: "destructive",
      });
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      // Convert items to Excel format with proper formatting
      const excelData = items.map(item => ({
        'اسم المنتج': item.name,
        'الكمية': item.quantity,
        'السعر': `${formatCurrency(item.price, true)}`,
        'المجموع': `${formatCurrency(item.total, true)}`
      }));

      // Add summary rows
      excelData.push(
        {
          'اسم المنتج': 'المجموع الفرعي',
          'الكمية': '',
          'السعر': '',
          'المجموع': `${formatCurrency(subtotal, true)}`
        }
      );

      if (discount > 0) {
        excelData.push({
          'اسم المنتج': `الخصم (${discount}%)`,
          'الكمية': '',
          'السعر': '',
          'المجموع': `${formatCurrency(discountAmount, true)}`
        });
      }

      excelData.push({
        'اسم المنتج': 'الإجمالي النهائي',
        'الكمية': '',
        'السعر': '',
        'المجموع': `${formatCurrency(finalTotal, true)}`
      });

      // Create worksheet with RTL support
      const worksheet = XLSX.utils.json_to_sheet(excelData, { RTL: true });

      // Set column widths
      const colWidths = [
        { wch: 30 }, // Product name
        { wch: 10 }, // Quantity
        { wch: 15 }, // Price
        { wch: 15 }, // Total
      ];
      worksheet['!cols'] = colWidths;

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الفاتورة');

      // Generate Excel file
      const fileName = `فاتورة_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "تم تصدير الفاتورة",
        description: "تم تصدير الفاتورة بنجاح إلى ملف Excel",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير الفاتورة. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
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
            <Button variant="outline" onClick={exportToExcel} disabled={items.length === 0}>
              <FileSpreadsheet className="h-4 w-4 ml-2" />
              تصدير Excel
            </Button>
            <Button onClick={saveInvoice}>
              <Save className="h-4 w-4 ml-2" />
              حفظ الفاتورة
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
                className="fixed top-[-100px] left-0 opacity-0 pointer-events-none z-50"
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value);
                  if (e.target.value.length >= 8) {
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
                        <td className="p-2 text-center">{formatCurrency(item.price, true)}</td>
                        <td className="p-2 text-center">{formatCurrency(item.total, true)}</td>
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
                  <span>{formatCurrency(subtotal, true)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>الخصم ({discount}%):</span>
                    <span>- {formatCurrency(discountAmount, true)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي النهائي:</span>
                  <span>{formatCurrency(finalTotal, true)}</span>
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

              {/* Action Buttons */}
              <div className="grid gap-2">
                <Button className="w-full" variant="secondary" onClick={printInvoice}>
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