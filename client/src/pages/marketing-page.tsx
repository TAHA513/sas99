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
import { useQuery } from "@tanstack/react-query";
import { MarketingCampaign } from "@shared/schema";
import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";

export default function MarketingPage() {
  const { data: campaigns } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCampaigns = campaigns?.filter((campaign) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      campaign.name.toLowerCase().includes(searchLower) ||
      (campaign.description?.toLowerCase().includes(searchLower) ?? false) ||
      campaign.type.toLowerCase().includes(searchLower) ||
      campaign.status.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: "مسودة", color: "bg-gray-100 text-gray-800" },
      active: { label: "نشط", color: "bg-green-100 text-green-800" },
      completed: { label: "مكتمل", color: "bg-blue-100 text-blue-800" },
      cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" },
    };

    return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">الحملات التسويقية</h1>
          <Button>
            <Megaphone className="h-4 w-4 ml-2" />
            حملة جديدة
          </Button>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في الحملات..."
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الحملة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>تاريخ البدء</TableHead>
                <TableHead>تاريخ الانتهاء</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns?.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    {campaign.name}
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.type === "whatsapp" ? "واتساب" :
                       campaign.type === "email" ? "بريد إلكتروني" :
                       campaign.type === "sms" ? "رسائل نصية" : campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(campaign.startDate), 'dd MMMM yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(campaign.endDate), 'dd MMMM yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(campaign.status).color}>
                      {getStatusBadge(campaign.status).label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCampaigns?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
