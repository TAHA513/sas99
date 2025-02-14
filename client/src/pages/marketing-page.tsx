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
import {
  SiFacebook,
  SiInstagram,
  SiSnapchat,
  SiWhatsapp
} from "react-icons/si";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CampaignForm } from "@/components/marketing/campaign-form";

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

  const getPlatformIcons = (platforms?: string[]) => {
    if (!platforms) return null;

    return (
      <div className="flex gap-2">
        {platforms.map(platform => {
          switch (platform) {
            case 'facebook':
              return <SiFacebook key="facebook" className="text-blue-600 h-4 w-4" />;
            case 'instagram':
              return <SiInstagram key="instagram" className="text-pink-600 h-4 w-4" />;
            case 'snapchat':
              return <SiSnapchat key="snapchat" className="text-yellow-500 h-4 w-4" />;
            case 'whatsapp':
              return <SiWhatsapp key="whatsapp" className="text-green-600 h-4 w-4" />;
            default:
              return null;
          }
        })}
      </div>
    );
  };

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
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="h-4 w-4 ml-2" />
                حملة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>إنشاء حملة جديدة</DialogTitle>
                <DialogDescription>
                  اختر المنصة التي تريد إنشاء الحملة عليها
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="facebook" className="mt-4">
                <TabsList className="grid grid-cols-3 gap-4">
                  <TabsTrigger value="facebook" className="text-center">
                    <SiFacebook className="h-6 w-6 text-blue-600 mb-2" />
                    فيسبوك
                  </TabsTrigger>
                  <TabsTrigger value="instagram" className="text-center">
                    <SiInstagram className="h-6 w-6 text-pink-600 mb-2" />
                    انستغرام
                  </TabsTrigger>
                  <TabsTrigger value="snapchat" className="text-center">
                    <SiSnapchat className="h-6 w-6 text-yellow-500 mb-2" />
                    سناب شات
                  </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                  <TabsContent value="facebook">
                    <Card>
                      <CardHeader>
                        <CardTitle>حملة إعلانية على فيسبوك</CardTitle>
                        <CardDescription>
                          قم بإنشاء حملة إعلانية مستهدفة على فيسبوك
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CampaignForm platform="facebook" />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="instagram">
                    <Card>
                      <CardHeader>
                        <CardTitle>حملة إعلانية على انستغرام</CardTitle>
                        <CardDescription>
                          قم بإنشاء حملة إعلانية مستهدفة على انستغرام
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CampaignForm platform="instagram" />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="snapchat">
                    <Card>
                      <CardHeader>
                        <CardTitle>حملة إعلانية على سناب شات</CardTitle>
                        <CardDescription>
                          قم بإنشاء حملة إعلانية مستهدفة على سناب شات
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CampaignForm platform="snapchat" />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </DialogContent>
          </Dialog>
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
                <TableHead>المنصات</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الميزانية</TableHead>
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
                  <TableCell>{getPlatformIcons(campaign.platforms)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {campaign.type === "whatsapp" ? "واتساب" :
                       campaign.type === "email" ? "بريد إلكتروني" :
                       campaign.type === "sms" ? "رسائل نصية" :
                       campaign.type === "facebook" ? "فيسبوك" :
                       campaign.type === "instagram" ? "انستغرام" :
                       campaign.type === "snapchat" ? "سناب شات" : campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.budget ? `${(campaign.budget / 100).toFixed(2)} ريال` : "غير محدد"}
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
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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