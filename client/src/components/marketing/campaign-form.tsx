import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { CampaignPreview } from "./campaign-preview";
import { FileUpload } from "@/components/ui/file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignAnalytics } from "./campaign-analytics";
import { CampaignScheduler } from "./campaign-scheduler";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { insertMarketingCampaignSchema } from "@shared/schema";
import { z } from "zod";

const campaignFormSchema = insertMarketingCampaignSchema.extend({
  startDate: z.string(),
  endDate: z.string()
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  platform: 'facebook' | 'instagram' | 'snapchat' | 'whatsapp' | 'email' | 'sms';
  onSuccess?: () => void;
}

// Add country-cities mapping
const countryCities: Record<string, string[]> = {
  'المملكة العربية السعودية': [
    'الرياض',
    'جدة',
    'مكة المكرمة',
    'المدينة المنورة',
    'الدمام',
    'الخبر',
    'تبوك',
    'أبها',
    'القصيم',
    'حائل'
  ],
  'الإمارات': [
    'دبي',
    'أبو ظبي',
    'الشارقة',
    'عجمان',
    'رأس الخيمة',
    'الفجيرة',
    'أم القيوين'
  ],
  'الكويت': [
    'مدينة الكويت',
    'حولي',
    'الفروانية',
    'مبارك الكبير',
    'الأحمدي',
    'الجهراء'
  ],
  'قطر': [
    'الدوحة',
    'الريان',
    'الوكرة',
    'أم صلال',
    'الخور',
    'الشمال'
  ],
  'البحرين': [
    'المنامة',
    'المحرق',
    'الرفاع',
    'مدينة عيسى',
    'مدينة حمد'
  ],
  'عمان': [
    'مسقط',
    'صلالة',
    'صحار',
    'نزوى',
    'صور'
  ]
};

export function CampaignForm({ platform, onSuccess }: CampaignFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [budget, setBudget] = useState(100);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      type: platform === 'sms' ? 'sms' : "promotional",
      platforms: [platform],
      status: 'draft',
      budget: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: "",
      content: "",
      mediaFiles: [],
      targeting: {
        ageRange: ['18-24'],
        gender: 'all',
        locations: [],
        interests: [],
        languages: ['العربية'],
        devices: ['mobile', 'desktop'],
      },
      campaignMetrics: {
        impressions: 0,
        clicks: 0,
        engagement: 0,
        reach: 0,
        conversion: 0,
        roi: 0
      },
      scheduledPosts: []
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const res = await apiRequest("POST", "/api/campaigns", {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budget: budget,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "تم إنشاء الحملة",
        description: "تم إنشاء الحملة الإعلانية بنجاح",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في إنشاء الحملة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const watchContent = form.watch('content');
  const watchName = form.watch('name');
  const watchMediaFiles = form.watch('mediaFiles');
  const watchTargeting = form.watch('targeting');

  // Available languages
  const availableLanguages = ['العربية', 'الإنجليزية'];

  // Available age ranges
  const availableAgeRanges = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  // Available interests
  const availableInterests = [
    'التسوق', 'الرياضة', 'السفر', 'التقنية', 'الطعام',
    'الموضة', 'الصحة', 'التعليم', 'الترفيه', 'الأعمال',
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createCampaign.mutate(data))} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">اسم الحملة</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل اسماً مميزاً للحملة" className="h-7 text-xs" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">وصف الحملة</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="اكتب وصفاً مختصراً للحملة"
                  className="h-16 text-xs resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">نوع الحملة</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="h-7 w-full rounded-md border border-input bg-background px-2 py-0 text-xs"
                  >
                    <option value="promotional">ترويجية</option>
                    <option value="awareness">توعوية</option>
                    <option value="engagement">تفاعلية</option>
                    <option value="sales">مبيعات</option>
                    <option value="seasonal">موسمية</option>
                    <option value="sms">رسائل SMS</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={() => (
              <FormItem>
                <FormLabel className="text-xs font-medium">الميزانية (دولار)</FormLabel>
                <FormControl>
                  <div className="space-y-1">
                    <Slider
                      value={[budget]}
                      onValueChange={([value]) => setBudget(value)}
                      min={10}
                      max={1000}
                      step={10}
                      className="py-0.5"
                    />
                    <div className="text-muted-foreground text-[10px] text-center">
                      ${budget.toLocaleString()}
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">تاريخ البدء</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-7 text-xs" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">تاريخ الانتهاء</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-7 text-xs" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Targeting Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">خيارات الاستهداف</h3>

          {/* Gender */}
          <FormField
            control={form.control}
            name="targeting.gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">الجنس</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">الجميع</SelectItem>
                    <SelectItem value="male">ذكور</SelectItem>
                    <SelectItem value="female">إناث</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {/* Age Ranges */}
          <FormField
            control={form.control}
            name="targeting.ageRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">الفئة العمرية</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  {availableAgeRanges.map((range) => (
                    <label
                      key={range}
                      className="flex items-center space-x-2 space-x-reverse text-xs"
                    >
                      <Checkbox
                        checked={field.value.includes(range)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, range]
                            : field.value.filter((v) => v !== range);
                          field.onChange(newValue);
                        }}
                      />
                      <span>{range}</span>
                    </label>
                  ))}
                </div>
              </FormItem>
            )}
          />

          {/* Locations */}
          <FormField
            control={form.control}
            name="targeting.locations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">المواقع</FormLabel>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(countryCities).map((country) => (
                      <label
                        key={country}
                        className="flex items-center space-x-2 space-x-reverse text-xs"
                      >
                        <Checkbox
                          checked={field.value.some(loc => loc.country === country)}
                          onCheckedChange={(checked) => {
                            const newValue = checked
                              ? [...field.value, { country, cities: [] }]
                              : field.value.filter(loc => loc.country !== country);
                            field.onChange(newValue);
                            if (checked) {
                              setSelectedCountry(country);
                            }
                          }}
                        />
                        <span>{country}</span>
                      </label>
                    ))}
                  </div>

                  {selectedCountry && (
                    <div className="mt-2">
                      <FormLabel className="text-xs font-medium block mb-2">
                        المدن في {selectedCountry}
                      </FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {countryCities[selectedCountry].map((city) => (
                          <label
                            key={city}
                            className="flex items-center space-x-2 space-x-reverse text-xs"
                          >
                            <Checkbox
                              checked={field.value
                                .find(loc => loc.country === selectedCountry)
                                ?.cities.includes(city) || false}
                              onCheckedChange={(checked) => {
                                const newValue = field.value.map(loc => {
                                  if (loc.country === selectedCountry) {
                                    return {
                                      ...loc,
                                      cities: checked
                                        ? [...loc.cities, city]
                                        : loc.cities.filter(c => c !== city)
                                    };
                                  }
                                  return loc;
                                });
                                field.onChange(newValue);
                              }}
                            />
                            <span>{city}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormItem>
            )}
          />

          {/* Interests */}
          <FormField
            control={form.control}
            name="targeting.interests"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">الاهتمامات</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {availableInterests.map((interest) => (
                    <label
                      key={interest}
                      className="flex items-center space-x-2 space-x-reverse text-xs"
                    >
                      <Checkbox
                        checked={field.value.includes(interest)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, interest]
                            : field.value.filter((v) => v !== interest);
                          field.onChange(newValue);
                        }}
                      />
                      <span>{interest}</span>
                    </label>
                  ))}
                </div>
              </FormItem>
            )}
          />

          {/* Languages */}
          <FormField
            control={form.control}
            name="targeting.languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">اللغات</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {availableLanguages.map((language) => (
                    <label
                      key={language}
                      className="flex items-center space-x-2 space-x-reverse text-xs"
                    >
                      <Checkbox
                        checked={field.value.includes(language)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, language]
                            : field.value.filter((v) => v !== language);
                          field.onChange(newValue);
                        }}
                      />
                      <span>{language}</span>
                    </label>
                  ))}
                </div>
              </FormItem>
            )}
          />

          {/* Devices */}
          <FormField
            control={form.control}
            name="targeting.devices"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium">الأجهزة</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'mobile', label: 'الجوال' },
                    { id: 'desktop', label: 'الكمبيوتر' },
                    { id: 'tablet', label: 'الأجهزة اللوحية' },
                  ].map((device) => (
                    <label
                      key={device.id}
                      className="flex items-center space-x-2 space-x-reverse text-xs"
                    >
                      <Checkbox
                        checked={field.value.includes(device.id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...field.value, device.id]
                            : field.value.filter((v) => v !== device.id);
                          field.onChange(newValue);
                        }}
                      />
                      <span>{device.label}</span>
                    </label>
                  ))}
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">محتوى الإعلان</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="اكتب نص الإعلان هنا"
                  className="h-20 text-xs resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mediaFiles"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">صور الإعلان</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/*"
                  maxFiles={4}
                  maxSize={2}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <CampaignPreview
          platform={platform}
          content={watchContent}
          name={watchName}
          mediaFiles={watchMediaFiles}
          targeting={watchTargeting}
        />

        {/* Add Campaign Analytics Section */}
        {form.formState.isDirty && (
          <CampaignAnalytics
            campaign={{
              ...form.getValues(),
              campaignMetrics: {
                impressions: 0,
                clicks: 0,
                engagement: 0,
                reach: 0,
                conversion: 0,
                roi: 0
              }
            }}
          />
        )}

        {showScheduler ? (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>جدولة المنشورات</AlertTitle>
              <AlertDescription>
                يمكنك جدولة منشورات متعددة لهذه الحملة. سيتم نشرها تلقائياً في الأوقات المحددة.
              </AlertDescription>
            </Alert>
            <CampaignScheduler
              campaignId={form.getValues().id}
              platform={platform}
              onSuccess={() => setShowScheduler(false)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScheduler(false)}
              className="w-full h-7 text-xs font-medium"
            >
              إلغاء الجدولة
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowScheduler(true)}
            className="w-full h-7 text-xs font-medium"
          >
            جدولة المنشورات
          </Button>
        )}

        <Button
          type="submit"
          disabled={createCampaign.isPending}
          className="w-full h-7 text-xs font-medium"
        >
          {createCampaign.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
        </Button>
      </form>
    </Form>
  );
}