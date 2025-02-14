import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import JsBarcode from "jsbarcode";
import { Printer, Download, RefreshCw, Sheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

    bulkBarcodesRef.current.innerHTML = '';
    const values = bulkBarcodes.split('\n').filter(v => v.trim());

    values.forEach((value) => {
      const container = document.createElement('div');
      container.className = 'mb-4';

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
                if (typeof JsBarcode === 'undefined') {
                  throw new Error('JsBarcode library not loaded');
                }

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">توليد الباركود</h1>

        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">باركود واحد</TabsTrigger>
            <TabsTrigger value="bulk">مجموعة باركودات</TabsTrigger>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
}