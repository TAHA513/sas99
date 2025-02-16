import { Card, CardContent } from "@/components/ui/card";
import { SiFacebook, SiInstagram, SiSnapchat, SiWhatsapp } from "react-icons/si";
import { MessageSquare } from "lucide-react";

interface CampaignPreviewProps {
  platform: 'facebook' | 'instagram' | 'snapchat' | 'sms';
  content: string;
  name?: string;
}

export function CampaignPreview({ platform, content, name }: CampaignPreviewProps) {
  const getPreviewContent = () => {
    switch (platform) {
      case 'facebook':
        return (
          <div className="bg-[#f0f2f5] rounded-lg p-3 max-w-sm mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <SiFacebook className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{name || "اسم الصفحة"}</div>
                  <div className="text-[10px] text-muted-foreground">إعلان ممول</div>
                </div>
              </div>
              <p className="text-sm mb-3 whitespace-pre-wrap">{content || "محتوى الإعلان"}</p>
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-3 max-w-sm mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <SiInstagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{name || "اسم الحساب"}</div>
                  <div className="text-[10px] text-muted-foreground">إعلان ممول</div>
                </div>
              </div>
              <p className="text-sm mb-3 whitespace-pre-wrap">{content || "محتوى الإعلان"}</p>
            </div>
          </div>
        );

      case 'snapchat':
        return (
          <div className="bg-[#fffc00] rounded-lg p-3 max-w-sm mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <SiSnapchat className="w-6 h-6 text-[#fffc00]" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{name || "اسم الحساب"}</div>
                  <div className="text-[10px] text-muted-foreground">إعلان ممول</div>
                </div>
              </div>
              <p className="text-sm mb-3 whitespace-pre-wrap">{content || "محتوى الإعلان"}</p>
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="bg-gray-100 rounded-lg p-3 max-w-sm mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">رسالة SMS</div>
                  <div className="text-[10px] text-muted-foreground">
                    {name || "اسم المرسل"}
                  </div>
                </div>
              </div>
              <p className="text-sm mb-3 whitespace-pre-wrap">{content || "محتوى الرسالة"}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <div className="text-xs font-medium mb-2 text-center text-muted-foreground">
          معاينة الإعلان
        </div>
        {getPreviewContent()}
      </CardContent>
    </Card>
  );
}
