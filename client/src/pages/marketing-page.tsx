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
import { Megaphone, AlertCircle, Check, MessageSquare } from "lucide-react";
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
    sms: socialAccounts?.some(acc => acc.platform === 'sms' && acc.status === 'active'), // Added SMS
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
            sms: () => <MessageSquare className="h-4 w-4" />,
          }[platform];

          if (!Icon) return null;

          return (
            <div key={platform} className="relative group">
              <Icon className={`h-4 w-4 ${
                platform === 'facebook' ? 'text-blue-600' :
                platform === 'instagram' ? 'text-pink-600' :
                platform === 'snapchat' ? 'text-yellow-500' :
                platform === 'sms' ? 'text-gray-600' :
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
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
              <DialogHeader className="space-y-2 sticky top-0 bg-background pt-6 pb-2 mb-2">
                <DialogTitle className="text-xl">إنشاء حملة جديدة</DialogTitle>
                <DialogDescription className="text-sm">
                  اختر المنصة التي تريد إنشاء الحملة عليها
                </DialogDescription>
              </DialogHeader>
              {unconfiguredPlatforms.length > 0 && (
                <Alert variant="default" className="mb-3 sticky top-[105px] bg-background z-10">
                  <AlertCircle className="h-3 w-3" />
                  <AlertTitle className="text-sm">تنبيه</AlertTitle>
                  <AlertDescription className="text-xs">
                    بعض منصات التواصل الاجتماعي غير مكتملة الإعداد. يرجى إكمال إعداد:
                    {' '}
                    {unconfiguredPlatforms.map(platform => (
                      <Badge key={platform} variant="outline" className="mx-1 text-xs">
                        {platform === 'facebook' ? 'فيسبوك' :
                         platform === 'instagram' ? 'انستغرام' :
                         platform === 'snapchat' ? 'سناب شات' :
                         platform === 'sms' ? 'رسائل SMS' :
                         'واتساب'}
                      </Badge>
                    ))}
                    {' '}
                    في صفحة الإعدادات.
                  </AlertDescription>
                </Alert>
              )}
              <div className="px-1">
                <Tabs defaultValue="facebook" className="mt-2">
                  <TabsList className="grid grid-cols-4 gap-2 sticky top-[160px] bg-background z-10">
                    <TabsTrigger
                      value="facebook"
                      className="text-center py-1.5"
                      disabled={!platformStatus.facebook}
                    >
                      <SiFacebook className="h-3 w-3 text-blue-600 mb-1" />
                      <span className="text-xs">فيسبوك</span>
                      {!platformStatus.facebook && (
                        <AlertCircle className="h-2 w-2 text-yellow-500 mr-1" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="instagram"
                      className="text-center py-1.5"
                      disabled={!platformStatus.instagram}
                    >
                      <SiInstagram className="h-3 w-3 text-pink-600 mb-1" />
                      <span className="text-xs">انستغرام</span>
                      {!platformStatus.instagram && (
                        <AlertCircle className="h-2 w-2 text-yellow-500 mr-1" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="snapchat"
                      className="text-center py-1.5"
                      disabled={!platformStatus.snapchat}
                    >
                      <SiSnapchat className="h-3 w-3 text-yellow-500 mb-1" />
                      <span className="text-xs">سناب شات</span>
                      {!platformStatus.snapchat && (
                        <AlertCircle className="h-2 w-2 text-yellow-500 mr-1" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="sms"
                      className="text-center py-1.5"
                    >
                      <MessageSquare className="h-3 w-3 text-gray-600 mb-1" />
                      <span className="text-xs">SMS</span>
                    </TabsTrigger>
                  </TabsList>
                  <div className="mt-3">
                    <TabsContent value="facebook">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">حملة إعلانية على فيسبوك</CardTitle>
                          <CardDescription className="text-xs">
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
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">حملة إعلانية على انستغرام</CardTitle>
                          <CardDescription className="text-xs">
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
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">حملة إعلانية على سناب شات</CardTitle>
                          <CardDescription className="text-xs">
                            قم بإنشاء حملة إعلانية مستهدفة على سناب شات
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <CampaignForm platform="snapchat" />
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="sms">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">حملة رسائل SMS</CardTitle>
                          <CardDescription className="text-xs">
                            قم بإنشاء حملة رسائل نصية قصيرة للوصول إلى عملائك
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <CampaignForm platform="sms" />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
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
                    {campaign.budget ? `$${(campaign.budget).toLocaleString()}` : "غير محدد"}
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