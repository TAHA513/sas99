import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import JsBarcode from "jsbarcode";
import { Printer, Download, RefreshCw, Sheet, Paintbrush } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export default function BarcodesPage() {
  const { toast } = useToast();
  const [barcodeValue, setBarcodeValue] = useState("");
  const [bulkBarcodes, setBulkBarcodes] = useState("");
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const [barcodeWidth, setBarcodeWidth] = useState("2");
  const [barcodeHeight, setBarcodeHeight] = useState("100");
  const [copies, setCopies] = useState("1");
  const singleBarcodeRef = useRef<SVGSVGElement>(null);
  const bulkBarcodesRef = useRef<HTMLDivElement>(null);

  const generateBarcode = (value: string, svgElement: SVGSVGElement) => {
    if (!value) return false;

    try {
      JsBarcode(svgElement, value, {
        format: barcodeFormat,
        width: Number(barcodeWidth),
        height: Number(barcodeHeight),
        displayValue: true,
        font: "Arial",
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 2,
        fontSize: 20,
        background: "#ffffff",
        lineColor: "#000000",
        margin: 10,
      });
      // Add the barcode value as a data attribute for regeneration in print window
      svgElement.setAttribute('data-value', value);
      return true;
    } catch (error) {
      toast({
        title: "خطأ في توليد الباركود",
        description: "تأكد من صحة القيمة المدخلة",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (barcodeValue && singleBarcodeRef.current) {
      generateBarcode(barcodeValue, singleBarcodeRef.current);
    }
  }, [barcodeValue, barcodeFormat, barcodeWidth, barcodeHeight]);

  const generateBulkBarcodes = () => {
    if (!bulkBarcodesRef.current) return;

    // Clear previous content
    bulkBarcodesRef.current.innerHTML = '';

    const values = bulkBarcodes.split('\n').filter(v => v.trim());

    values.forEach((value, index) => {
      const container = document.createElement('div');
      container.className = 'mb-4';

      // Create copies based on the user input
      for (let i = 0; i < Number(copies); i++) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        if (generateBarcode(value, svg)) {
          container.appendChild(svg);
        }
      }

      bulkBarcodesRef.current?.appendChild(container);
    });
  };

  useEffect(() => {
    if (bulkBarcodes) {
      generateBulkBarcodes();
    }
  }, [bulkBarcodes, barcodeFormat, barcodeWidth, barcodeHeight, copies]);

  const printBarcodes = (thermal = false) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = `
      <html dir="rtl">
        <head>
          <title>طباعة الباركود</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page { 
              size: ${thermal ? '58mm 40mm' : 'A4'}; 
              margin: ${thermal ? '0' : '1cm'}; 
            }
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center;
              font-family: Arial, sans-serif;
            }
            .container { 
              display: flex; 
              flex-wrap: wrap; 
              justify-content: center; 
              gap: 10px; 
              padding: 10px; 
            }
            svg { 
              max-width: 100%; 
              height: auto; 
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .container { break-inside: avoid; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${singleBarcodeRef.current?.outerHTML || bulkBarcodesRef.current?.innerHTML || ''}
          </div>
          <script>
            window.onload = () => {
              try {
                // Make sure JsBarcode is loaded
                if (typeof JsBarcode === 'undefined') {
                  throw new Error('JsBarcode library not loaded');
                }

                // Regenerate barcodes in the print window
                document.querySelectorAll('svg').forEach(svg => {
                  const value = svg.getAttribute('data-value');
                  if (value) {
                    JsBarcode(svg, value, {
                      format: "${barcodeFormat}",
                      width: ${barcodeWidth},
                      height: ${barcodeHeight},
                      displayValue: true,
                      font: "Arial",
                      textAlign: "center",
                      textPosition: "bottom",
                      textMargin: 2,
                      fontSize: 20,
                      background: "#ffffff",
                      lineColor: "#000000",
                      margin: 10
                    });
                  }
                });

                // Short delay to ensure barcodes are rendered
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              } catch (error) {
                console.error('Error generating barcodes:', error);
                alert('حدث خطأ أثناء توليد الباركود. يرجى المحاولة مرة أخرى.');
                window.close();
              }
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const downloadBarcode = () => {
    const svgData = new XMLSerializer().serializeToString(singleBarcodeRef.current!);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `barcode-${barcodeValue}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const { data: storeSettings } = useQuery({
    queryKey: ["/api/store-settings"],
  });

  const storeSettingsMutation = useMutation({
    mutationFn: async (data: { 
      primary?: string;
      appearance?: 'light' | 'dark';
      radius?: number;
      fontSize?: string;
      fontFamily?: string;
    }) => {
      try {
        const themeRes = await apiRequest("POST", "/api/theme", {
          primary: data.primary,
          appearance: data.appearance,
          radius: data.radius,
          fontSize: data.fontSize,
          fontFamily: data.fontFamily,
          variant: "tint",
        });

        if (!themeRes.ok) {
          throw new Error('فشل في تحديث المظهر');
        }

        return { success: true };
      } catch (error) {
        console.error('Error updating theme:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث الإعدادات بنجاح، جاري تحديث الصفحة",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: error.message || "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">توليد الباركود</h1>

        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">باركود واحد</TabsTrigger>
            <TabsTrigger value="bulk">مجموعة باركودات</TabsTrigger>
            <TabsTrigger value="appearance" className="space-x-2">
              <Paintbrush className="h-4 w-4" />
              <span>المظهر</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الباركود</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>قيمة الباركود</Label>
                    <Input
                      value={barcodeValue}
                      onChange={(e) => setBarcodeValue(e.target.value)}
                      placeholder="أدخل النص أو الرقم"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>نوع الباركود</Label>
                    <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CODE128">Code 128</SelectItem>
                        <SelectItem value="EAN13">EAN-13</SelectItem>
                        <SelectItem value="EAN8">EAN-8</SelectItem>
                        <SelectItem value="UPC">UPC</SelectItem>
                        <SelectItem value="CODE39">Code 39</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>عرض الشريط</Label>
                      <Input
                        type="number"
                        value={barcodeWidth}
                        onChange={(e) => setBarcodeWidth(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ارتفاع الشريط</Label>
                      <Input
                        type="number"
                        value={barcodeHeight}
                        onChange={(e) => setBarcodeHeight(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => generateBarcode(barcodeValue, singleBarcodeRef.current!)}>
                      <RefreshCw className="h-4 w-4 ml-2" />
                      تحديث الباركود
                    </Button>
                    <Button variant="outline" onClick={downloadBarcode}>
                      <Download className="h-4 w-4 ml-2" />
                      تحميل
                    </Button>
                    <Button variant="outline" onClick={() => printBarcodes(false)}>
                      <Printer className="h-4 w-4 ml-2" />
                      طباعة عادية
                    </Button>
                    <Button variant="outline" onClick={() => printBarcodes(true)}>
                      <Sheet className="h-4 w-4 ml-2" />
                      طباعة حرارية
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معاينة الباركود</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[300px] bg-white">
                  <svg ref={singleBarcodeRef} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الباركود المتعدد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>قيم الباركود</Label>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        اكتب كل باركود في سطر منفصل. يمكنك لصق البيانات مباشرة من Excel.
                      </p>
                      <div className="bg-muted/50 p-2 rounded-md mb-2">
                        <code className="text-xs text-muted-foreground block">
                          # مثال على التنسيق:<br />
                          123456789 # منتج 1<br />
                          987654321 # منتج 2<br />
                          456789123 # منتج 3
                        </code>
                      </div>
                      <Textarea
                        value={bulkBarcodes}
                        onChange={(e) => setBulkBarcodes(e.target.value)}
                        placeholder="ضع قيم الباركود هنا..."
                        className="h-48 font-mono text-base leading-relaxed"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>خيارات الطباعة</Label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>عدد النسخ لكل باركود</Label>
                        <Input
                          type="number"
                          value={copies}
                          onChange={(e) => setCopies(e.target.value)}
                          min="1"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>نوع الباركود</Label>
                        <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CODE128">Code 128</SelectItem>
                            <SelectItem value="EAN13">EAN-13</SelectItem>
                            <SelectItem value="EAN8">EAN-8</SelectItem>
                            <SelectItem value="UPC">UPC</SelectItem>
                            <SelectItem value="CODE39">Code 39</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={generateBulkBarcodes}>
                      <RefreshCw className="h-4 w-4 ml-2" />
                      توليد الباركودات
                    </Button>
                    <Button variant="outline" onClick={() => printBarcodes(false)}>
                      <Printer className="h-4 w-4 ml-2" />
                      طباعة عادية
                    </Button>
                    <Button variant="outline" onClick={() => printBarcodes(true)}>
                      <Sheet className="h-4 w-4 ml-2" />
                      طباعة حرارية
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>معاينة الباركودات</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[300px] bg-white overflow-auto">
                  <div ref={bulkBarcodesRef} className="space-y-4" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Paintbrush className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>مظهر التطبيق</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Color */}
                <div className="space-y-4">
                  <Label>لون النظام الأساسي</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { color: "#0ea5e9", name: "أزرق" },
                      { color: "#10b981", name: "أخضر" },
                      { color: "#8b5cf6", name: "بنفسجي" },
                      { color: "#ef4444", name: "أحمر" },
                      { color: "#f59e0b", name: "برتقالي" }
                    ].map(({ color, name }) => (
                      <Button
                        key={color}
                        variant="outline"
                        className={cn(
                          "w-full h-12 rounded-md",
                          color === storeSettings?.primary && "ring-2 ring-primary"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          storeSettingsMutation.mutate({
                            primary: color
                          });
                        }}
                      >
                        <span className="sr-only">{name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الوضع الداكن</Label>
                    <div className="text-sm text-muted-foreground">
                      تبديل بين الوضع الفاتح والداكن
                    </div>
                  </div>
                  <Switch
                    checked={storeSettings?.appearance === 'dark'}
                    onCheckedChange={(checked) => {
                      storeSettingsMutation.mutate({
                        appearance: checked ? 'dark' : 'light'
                      });
                    }}
                  />
                </div>

                {/* Border Radius */}
                <div className="space-y-4">
                  <Label>نصف قطر الحواف</Label>
                  <Slider
                    defaultValue={[storeSettings?.radius || 0.5]}
                    max={1.5}
                    step={0.1}
                    onValueChange={([value]) => {
                      storeSettingsMutation.mutate({
                        radius: value
                      });
                    }}
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-4">
                  <Label>حجم الخط</Label>
                  <Select
                    value={storeSettings?.fontSize || 'medium'}
                    onValueChange={(value) => {
                      storeSettingsMutation.mutate({
                        fontSize: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حجم الخط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">صغير</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">كبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Family */}
                <div className="space-y-4">
                  <Label>نوع الخط</Label>
                  <Select
                    value={storeSettings?.fontFamily || 'tajawal'}
                    onValueChange={(value) => {
                      storeSettingsMutation.mutate({
                        fontFamily: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الخط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tajawal">Tajawal</SelectItem>
                      <SelectItem value="cairo">Cairo</SelectItem>
                      <SelectItem value="almarai">Almarai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}