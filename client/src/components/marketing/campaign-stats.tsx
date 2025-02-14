import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MarketingCampaign } from "@shared/schema";

interface CampaignStatsProps {
  campaigns: MarketingCampaign[];
}

export function CampaignStats({ campaigns }: CampaignStatsProps) {
  // تحليل البيانات للمخططات
  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];
  const totalBudget = activeCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

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
          name === 'snapchat' ? 'سناب شات' : name,
    value: value / 100 // تحويل من هللات إلى ريال
  }));

  const COLORS = ['#1877F2', '#E4405F', '#FFFC00'];

  const campaignPerformance = activeCampaigns.map(campaign => ({
    name: campaign.name,
    budget: (campaign.budget || 0) / 100,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* إجمالي الميزانية النشطة */}
      <Card>
        <CardHeader>
          <CardTitle>إجمالي الميزانية النشطة</CardTitle>
          <CardDescription>إجمالي ميزانية الحملات النشطة حالياً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{(totalBudget / 100).toLocaleString()} ريال</div>
        </CardContent>
      </Card>

      {/* عدد الحملات النشطة */}
      <Card>
        <CardHeader>
          <CardTitle>الحملات النشطة</CardTitle>
          <CardDescription>عدد الحملات الإعلانية النشطة حالياً</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeCampaigns.length}</div>
        </CardContent>
      </Card>

      {/* توزيع الميزانية على المنصات */}
      <Card className="col-span-2">
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
                    label={({ name, value }) => `${name}: ${value.toLocaleString()} ريال`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
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

      {/* ميزانيات الحملات */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>ميزانيات الحملات النشطة</CardTitle>
          <CardDescription>مقارنة ميزانيات الحملات الإعلانية النشطة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {campaignPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} ريال`} />
                  <Bar dataKey="budget" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                لا توجد حملات نشطة حالياً
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}