import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Promotion, DiscountCode } from "@shared/schema";
import { Ticket, Tag, Copy, BookTemplate } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PromotionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: promotions } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
  });

  const { data: discountCodes } = useQuery<DiscountCode[]>({
    queryKey: ["/api/discount-codes"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Duplicate promotion mutation
  const duplicatePromotion = useMutation({
    mutationFn: async (promotion: Promotion) => {
      const response = await fetch('/api/promotions/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: promotion.id }),
      });
      if (!response.ok) throw new Error('Failed to duplicate promotion');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/promotions'] });
      toast({
        title: "تم النسخ بنجاح",
        description: "تم نسخ العرض الترويجي بنجاح",
      });
    },
  });

  // Save as template mutation
  const saveAsTemplate = useMutation({
    mutationFn: async (promotion: Promotion) => {
      const response = await fetch('/api/promotion-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promotionId: promotion.id }),
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ كقالب",
        description: "تم حفظ العرض كقالب بنجاح",
      });
    },
  });

  const filteredPromotions = promotions?.filter((promotion) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      promotion.name.toLowerCase().includes(searchLower) ||
      (promotion.description?.toLowerCase().includes(searchLower) ?? false) ||
      promotion.discountType.toLowerCase().includes(searchLower) ||
      promotion.status.toLowerCase().includes(searchLower)
    );
  });

  const filteredDiscountCodes = discountCodes?.filter((code) => {
    const searchLower = searchTerm.toLowerCase();
    return code.code.toLowerCase().includes(searchLower);
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">العروض والخصومات</h1>
          <div className="space-x-4">
            <Button variant="outline">
              <Tag className="h-4 w-4 ml-2" />
              إنشاء كود خصم
            </Button>
            <Button>
              <Ticket className="h-4 w-4 ml-2" />
              عرض جديد
            </Button>
          </div>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في العروض والخصومات..."
          />
        </div>

        <Tabs defaultValue="promotions">
          <TabsList>
            <TabsTrigger value="promotions">العروض الترويجية</TabsTrigger>
            <TabsTrigger value="codes">أكواد الخصم</TabsTrigger>
          </TabsList>

          <TabsContent value="promotions" className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم العرض</TableHead>
                  <TableHead>نوع الخصم</TableHead>
                  <TableHead>قيمة الخصم</TableHead>
                  <TableHead>تاريخ البدء</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions?.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">
                      {promotion.name}
                      {promotion.description && (
                        <p className="text-sm text-muted-foreground">{promotion.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {promotion.discountType === "percentage" ? "نسبة مئوية" : "قيمة ثابتة"}
                    </TableCell>
                    <TableCell>
                      {promotion.discountType === "percentage"
                        ? `${promotion.discountValue}%`
                        : `${promotion.discountValue} ريال`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(promotion.startDate), 'dd MMMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(promotion.endDate), 'dd MMMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={promotion.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'}
                      >
                        {promotion.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            المزيد
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => duplicatePromotion.mutate(promotion)}>
                            <Copy className="h-4 w-4 ml-2" />
                            نسخ العرض
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => saveAsTemplate.mutate(promotion)}>
                            <BookTemplate className="h-4 w-4 ml-2" />
                            حفظ كقالب
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPromotions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      لا توجد نتائج للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="codes" className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>كود الخصم</TableHead>
                  <TableHead>العرض المرتبط</TableHead>
                  <TableHead>حد الاستخدام</TableHead>
                  <TableHead>عدد الاستخدام</TableHead>
                  <TableHead>تاريخ الانتهاء</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscountCodes?.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>{code.promotionId}</TableCell>
                    <TableCell>{code.usageLimit}</TableCell>
                    <TableCell>{code.usageCount}</TableCell>
                    <TableCell>
                      {code.expiresAt
                        ? format(new Date(code.expiresAt), 'dd MMMM yyyy', { locale: ar })
                        : 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        تعديل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDiscountCodes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا توجد نتائج للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}