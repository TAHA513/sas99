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
import { MarketingCampaign, SocialMediaAccount } from "@shared/schema";
import { Megaphone, AlertCircle, Check } from "lucide-react";
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
import { CampaignStats } from "@/components/marketing/campaign-stats";
import { formatCurrency } from "@/lib/storage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MarketingPage() {
  const { data: campaigns } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: socialAccounts } = useQuery<SocialMediaAccount[]>({
    queryKey: ["/api/social-media-accounts"],
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

  // Check if social media accounts are configured
  const platformStatus = {
    facebook: socialAccounts?.some(acc => acc.platform === 'facebook' && acc.status === 'active'),
    instagram: socialAccounts?.some(acc => acc.platform === 'instagram' && acc.status === 'active'),
    snapchat: socialAccounts?.some(acc => acc.platform === 'snapchat' && acc.status === 'active'),
    whatsapp: socialAccounts?.some(acc => acc.platform === 'whatsapp' && acc.status === 'active'),
  };

  const getPlatformIcons = (platforms?: string[]) => {
    if (!platforms) return null;

    return (
      <div className="flex gap-2">
        {platforms.map(platform => {
          const isConfigured = platformStatus[platform as keyof typeof platformStatus];
          const Icon = {
            facebook: SiFacebook,
            instagram: SiInstagram,
            snapchat: SiSnapchat,
            whatsapp: SiWhatsapp,
          }[platform];

          if (!Icon) return null;

          return (
            <div key={platform} className="relative group">
              <Icon className={`h-4 w-4 ${
                platform === 'facebook' ? 'text-blue-600' :
                platform === 'instagram' ? 'text-pink-600' :
                platform === 'snapchat' ? 'text-yellow-500' :
                'text-green-600'
              } ${!isConfigured ? 'opacity-50' : ''}`} />
              {!isConfigured && (
                <span className="absolute -top-2 -right-2">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                </span>
              )}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover p-2 rounded shadow-lg text-xs">
                {isConfigured ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-3 w-3" />
                    متصل
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <AlertCircle className="h-3 w-3" />
                    غير متصل
                  </div>
                )}
              </div>
            </div>
          );
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

  // Check if any social media accounts are not configured
  const unconfiguredPlatforms = Object.entries(platformStatus)
    .filter(([, isConfigured]) => !isConfigured)
    .map(([platform]) => platform);

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
              {unconfiguredPlatforms.length > 0 && (
                <Alert className="mb-4" variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>تنبيه</AlertTitle>
                  <AlertDescription>
                    بعض منصات التواصل الاجتماعي غير مكتملة الإعداد. يرجى إكمال إعداد:
                    {' '}
                    {unconfiguredPlatforms.map(platform => (
                      <Badge key={platform} variant="outline" className="mx-1">
                        {platform === 'facebook' ? 'فيسبوك' :
                         platform === 'instagram' ? 'انستغرام' :
                         platform === 'snapchat' ? 'سناب شات' :
                         'واتساب'}
                      </Badge>
                    ))}
                    {' '}
                    في صفحة الإعدادات.
                  </AlertDescription>
                </Alert>
              )}
              <Tabs defaultValue="facebook" className="mt-4">
                <TabsList className="grid grid-cols-3 gap-4">
                  <TabsTrigger 
                    value="facebook" 
                    className="text-center"
                    disabled={!platformStatus.facebook}
                  >
                    <SiFacebook className="h-6 w-6 text-blue-600 mb-2" />
                    فيسبوك
                    {!platformStatus.facebook && (
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="instagram" 
                    className="text-center"
                    disabled={!platformStatus.instagram}
                  >
                    <SiInstagram className="h-6 w-6 text-pink-600 mb-2" />
                    انستغرام
                    {!platformStatus.instagram && (
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="snapchat" 
                    className="text-center"
                    disabled={!platformStatus.snapchat}
                  >
                    <SiSnapchat className="h-6 w-6 text-yellow-500 mb-2" />
                    سناب شات
                    {!platformStatus.snapchat && (
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
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

        {/* Campaign Stats Component */}
        <CampaignStats campaigns={campaigns || []} />

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
                      {campaign.type === "promotional" ? "ترويجية" :
                       campaign.type === "awareness" ? "توعوية" :
                       campaign.type === "engagement" ? "تفاعلية" :
                       campaign.type === "sales" ? "مبيعات" :
                       campaign.type === "seasonal" ? "موسمية" : campaign.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {campaign.budget ? formatCurrency(campaign.budget, true) : "غير محدد"}
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