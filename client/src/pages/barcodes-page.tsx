import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JsBarcode from "jsbarcode";
import { Printer, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BarcodesPage() {
  const { toast } = useToast();
  const [barcodeValue, setBarcodeValue] = useState("");
  const [barcodeFormat, setBarcodeFormat] = useState("CODE128");
  const [barcodeWidth, setBarcodeWidth] = useState("2");
  const [barcodeHeight, setBarcodeHeight] = useState("100");
  const svgRef = useRef<SVGSVGElement>(null);

  const generateBarcode = () => {
    if (!barcodeValue) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال قيمة للباركود",
        variant: "destructive",
      });
      return;
    }

    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
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
      } catch (error) {
        toast({
          title: "خطأ في توليد الباركود",
          description: "تأكد من صحة القيمة المدخلة",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (barcodeValue) {
      generateBarcode();
    }
  }, [barcodeValue, barcodeFormat, barcodeWidth, barcodeHeight]);

  const downloadBarcode = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
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

  const printBarcode = () => {
    if (!svgRef.current) return;

    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      printWindow.document.write(`
        <html>
          <head>
            <title>طباعة الباركود</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              svg { max-width: 100%; height: auto; }
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${svgData}
            <script>
              window.onload = () => {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">توليد الباركود</h1>

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
                <Button onClick={() => generateBarcode()}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث الباركود
                </Button>
                <Button variant="outline" onClick={downloadBarcode}>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل
                </Button>
                <Button variant="outline" onClick={printBarcode}>
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معاينة الباركود</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px] bg-white">
              <svg ref={svgRef} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
