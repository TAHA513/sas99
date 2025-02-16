import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingCampaign } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatNumber } from "@/lib/utils";

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

  // Calculate engagement rate
  const engagementRate = campaign.campaignMetrics?.engagement && campaign.campaignMetrics?.impressions
    ? ((campaign.campaignMetrics.engagement / campaign.campaignMetrics.impressions) * 100).toFixed(2)
    : 0;

  // Calculate CTR (Click Through Rate)
  const ctr = campaign.campaignMetrics?.clicks && campaign.campaignMetrics?.impressions
    ? ((campaign.campaignMetrics.clicks / campaign.campaignMetrics.impressions) * 100).toFixed(2)
    : 0;

  // Format ROI
  const roi = campaign.campaignMetrics?.roi
    ? `${campaign.campaignMetrics.roi > 0 ? '+' : ''}${campaign.campaignMetrics.roi.toFixed(2)}%`
    : '0%';

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">نسبة التفاعل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              معدل التفاعل مع المحتوى
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معدل النقر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr}%</div>
            <p className="text-xs text-muted-foreground">
              نسبة النقر إلى المشاهدات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الوصول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(campaign.campaignMetrics?.reach || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              عدد الأشخاص الذين شاهدوا الإعلان
            </p>
          </CardContent>
        </Card>

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
      </div>

      {/* Engagement Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">تحليل التفاعل</CardTitle>
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

      {/* Platform Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع المنصات</CardTitle>
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

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">التركيبة السكانية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Age Distribution */}
            <div>
              <h4 className="text-sm font-medium mb-2">توزيع الأعمار</h4>
              <div className="space-y-2">
                {campaign.targetAudience && JSON.parse(campaign.targetAudience).age.split('-').map((age: string, index: number) => (
                  <div key={age} className="flex items-center gap-2">
                    <div className="text-sm">{age} سنة</div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.random() * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.floor(Math.random() * 30)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender Distribution */}
            <div>
              <h4 className="text-sm font-medium mb-2">توزيع الجنس</h4>
              <div className="flex gap-4">
                <div className="flex-1 text-center p-3 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">65%</div>
                  <div className="text-xs text-muted-foreground">ذكور</div>
                </div>
                <div className="flex-1 text-center p-3 rounded-lg bg-muted">
                  <div className="text-2xl font-bold">35%</div>
                  <div className="text-xs text-muted-foreground">إناث</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
