import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingCampaign } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CampaignAnalyticsProps {
  campaign: MarketingCampaign;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function CampaignAnalytics({ campaign }: CampaignAnalyticsProps) {
  // Prepare data for engagement metrics chart
  const engagementData = [
    { name: 'مشاهدات', value: campaign.campaignMetrics?.impressions || 0 },
    { name: 'نقرات', value: campaign.campaignMetrics?.clicks || 0 },
    { name: 'تفاعلات', value: campaign.campaignMetrics?.engagement || 0 },
    { name: 'وصول', value: campaign.campaignMetrics?.reach || 0 },
  ];

  // Calculate ROI and conversion metrics
  const roi = campaign.campaignMetrics?.roi
    ? `${campaign.campaignMetrics.roi > 0 ? '+' : ''}${campaign.campaignMetrics.roi.toFixed(2)}%`
    : '0%';

  const conversionRate = campaign.campaignMetrics?.clicks && campaign.campaignMetrics?.conversion
    ? ((campaign.campaignMetrics.conversion / campaign.campaignMetrics.clicks) * 100).toFixed(2)
    : '0';

  const costPerClick = campaign.budget && campaign.campaignMetrics?.clicks
    ? (campaign.budget / campaign.campaignMetrics.clicks).toFixed(2)
    : '0';

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">العائد على الاستثمار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roi}</div>
            <p className="text-xs text-muted-foreground">
              نسبة العائد على الإنفاق
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              نسبة التحويل من النقرات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">تكلفة النقرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(costPerClick))}
            </div>
            <p className="text-xs text-muted-foreground">
              متوسط تكلفة النقرة الواحدة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">حالة الحملة</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={campaign.status === 'active' ? 'default' : 'secondary'}
              className="text-lg"
            >
              {campaign.status === 'active' ? 'نشطة' : 'متوقفة'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              تنتهي في {new Date(campaign.endDate).toLocaleDateString('ar-IQ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل التفاعل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Audience Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>توزيع الجمهور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>التوزيع الجغرافي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaign.targetAudience && Object.entries(JSON.parse(campaign.targetAudience).regions || {}).map(([region, value]) => {
                const percentage = typeof value === 'number' ? value : 0;
                return (
                  <div key={region} className="flex items-center gap-2">
                    <div className="text-sm">{region}</div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}