import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MarketingCampaign } from "@shared/schema";
import { formatCurrency } from "@/lib/storage";

interface CampaignStatsProps {
  campaigns: MarketingCampaign[];
}

export function CampaignStats({ campaigns }: CampaignStatsProps) {
  // تحليل البيانات للمخططات
  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];
  const totalBudget = activeCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalMessages = campaigns.reduce((sum, c) => sum + (c.messageCount || 0), 0);

  // تحليل توزيع الميزانية على المنصات
  const platformData = activeCampaigns.reduce((acc, campaign) => {
    campaign.platforms?.forEach(platform => {
      const budget = (campaign.budget || 0) / (campaign.platforms?.length || 1);
      acc[platform] = (acc[platform] || 0) + budget;
    });
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(platformData).map(([name, value]) => ({
    name: name === 'facebook' ? 'فيسبوك' :
          name === 'instagram' ? 'انستغرام' :
          name === 'snapchat' ? 'سناب شات' :
          name === 'whatsapp' ? 'واتساب' :
          name === 'sms' ? 'رسائل SMS' : name,
    value: value / 100 // تحويل من السنتات إلى الدولار
  }));

  const COLORS = ['#1877F2', '#E4405F', '#FFFC00', '#25D366', '#6B7280'];

  // بيانات أداء الحملات
  const campaignPerformanceData = activeCampaigns.map(campaign => ({
    name: campaign.name,
    نقرات: campaign.campaignMetrics?.clicks || 0,
    مشاهدات: campaign.campaignMetrics?.impressions || 0,
    تفاعلات: campaign.campaignMetrics?.engagement || 0,
  }));

  // تحليل التفاعل حسب المنصة
  const platformEngagement = activeCampaigns.reduce((acc, campaign) => {
    campaign.platforms?.forEach(platform => {
      const engagement = campaign.campaignMetrics?.engagement || 0;
      const engagementPerPlatform = engagement / (campaign.platforms?.length || 1);
      acc[platform] = (acc[platform] || 0) + engagementPerPlatform;
    });
    return acc;
  }, {} as Record<string, number>);

  const engagementData = Object.entries(platformEngagement).map(([platform, value]) => ({
    platform: platform === 'facebook' ? 'فيسبوك' :
              platform === 'instagram' ? 'انستغرام' :
              platform === 'snapchat' ? 'سناب شات' :
              platform === 'whatsapp' ? 'واتساب' :
              platform === 'sms' ? 'رسائل SMS' : platform,
    تفاعلات: value
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* إجمالي الميزانية النشطة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إجمالي الميزانية النشطة</CardTitle>
          <CardDescription>إجمالي ميزانية الحملات النشطة حالياً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalBudget / 100, true)}</div>
        </CardContent>
      </Card>

      {/* إجمالي التفاعلات */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">إجمالي التفاعلات</CardTitle>
          <CardDescription>عدد التفاعلات من جميع الحملات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalMessages.toLocaleString()}</div>
        </CardContent>
      </Card>

      {/* عدد الحملات النشطة */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الحملات النشطة</CardTitle>
          <CardDescription>عدد الحملات الجارية حالياً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeCampaigns.length}</div>
        </CardContent>
      </Card>

      {/* توزيع الميزانية على المنصات */}
      <Card className="col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>توزيع الميزانية على المنصات</CardTitle>
          <CardDescription>نسبة توزيع الميزانية على منصات التواصل الاجتماعي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, value, percent }) => 
                      `${name}: ${formatCurrency(value, true)} (${(percent * 100).toFixed(1)}%)`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, true)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                لا توجد حملات نشطة حالياً
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* أداء الحملات عبر الزمن */}
      <Card className="col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>أداء الحملات</CardTitle>
          <CardDescription>مقارنة مؤشرات الأداء للحملات النشطة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {campaignPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={campaignPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="نقرات" stroke="#1877F2" />
                  <Line type="monotone" dataKey="مشاهدات" stroke="#10B981" />
                  <Line type="monotone" dataKey="تفاعلات" stroke="#6366F1" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                لا توجد بيانات متاحة
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* التفاعل حسب المنصة */}
      <Card className="col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>التفاعل حسب المنصة</CardTitle>
          <CardDescription>مقارنة مستوى التفاعل عبر المنصات المختلفة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {engagementData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="platform" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="تفاعلات" fill="#6366F1" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                لا توجد بيانات متاحة
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}