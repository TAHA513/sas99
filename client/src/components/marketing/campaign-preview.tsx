import { Card, CardContent } from "@/components/ui/card";
import { SiFacebook, SiInstagram, SiSnapchat } from "react-icons/si";
import { MessageSquare, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampaignPreviewProps {
  platform: 'facebook' | 'instagram' | 'snapchat' | 'sms';
  content: string;
  name?: string;
  mediaFiles?: string[];
  targeting?: {
    ageRange: string[];
    gender: 'all' | 'male' | 'female';
    locations: string[];
    interests: string[];
    languages: string[];
    devices: string[];
  };
}

export function CampaignPreview({ platform, content, name, mediaFiles, targeting }: CampaignPreviewProps) {
  const getPreviewContent = () => {
    const mediaPreview = mediaFiles && mediaFiles.length > 0 ? (
      <div className={`grid ${mediaFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1 mt-2`}>
        {mediaFiles.map((file, index) => (
          <img
            key={index}
            src={file}
            alt={`Preview ${index + 1}`}
            className="w-full h-32 object-cover rounded"
          />
        ))}
      </div>
    ) : null;

    const targetingPreview = targeting && (
      <div className="mt-2 p-2 bg-muted/50 rounded-md space-y-1">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
          <Target className="h-3 w-3" />
          <span>معلومات الاستهداف</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {/* Age Range */}
          {targeting.ageRange.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              العمر: {targeting.ageRange.join(', ')}
            </Badge>
          )}

          {/* Gender */}
          <Badge variant="secondary" className="text-[10px]">
            الجنس: {
              targeting.gender === 'all' ? 'الجميع' :
              targeting.gender === 'male' ? 'ذكور' : 'إناث'
            }
          </Badge>

          {/* Locations */}
          {targeting.locations.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              المواقع: {targeting.locations.join(', ')}
            </Badge>
          )}

          {/* Languages */}
          {targeting.languages.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              اللغات: {targeting.languages.join(', ')}
            </Badge>
          )}

          {/* Devices */}
          {targeting.devices.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              الأجهزة: {targeting.devices.map(d => 
                d === 'mobile' ? 'الجوال' :
                d === 'desktop' ? 'الكمبيوتر' : 'الأجهزة اللوحية'
              ).join(', ')}
            </Badge>
          )}

          {/* Interests */}
          {targeting.interests.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              الاهتمامات: {targeting.interests.join(', ')}
            </Badge>
          )}
        </div>
      </div>
    );

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
              {mediaPreview}
              {targetingPreview}
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
              {mediaPreview}
              {targetingPreview}
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
              {mediaPreview}
              {targetingPreview}
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
              {targetingPreview}
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