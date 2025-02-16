import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertMarketingCampaignSchema } from "@shared/schema";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const campaignFormSchema = insertMarketingCampaignSchema.extend({
  startDate: z.string(),
  endDate: z.string(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  platform: 'facebook' | 'instagram' | 'snapchat' | 'sms';
  onSuccess?: () => void;
}

export function CampaignForm({ platform, onSuccess }: CampaignFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [budget, setBudget] = useState(100);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      type: "promotional",
      platforms: [platform],
      status: 'draft',
      budget: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: "",
      content: "",
      targetAudience: JSON.stringify({
        age: "18-35",
        gender: "all",
        location: "المملكة العربية السعودية",
        interests: []
      }),
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
        budget: budget, // Already in USD
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createCampaign.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الحملة</FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل اسماً مميزاً للحملة" className="h-8" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وصف الحملة</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="اكتب وصفاً مختصراً للحملة"
                  className="h-20 text-sm"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الحملة</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
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
                <FormLabel>الميزانية (دولار)</FormLabel>
                <FormControl>
                  <div className="space-y-1">
                    <Slider
                      value={[budget]}
                      onValueChange={([value]) => setBudget(value)}
                      min={10}
                      max={1000}
                      step={10}
                      className="py-1"
                    />
                    <div className="text-muted-foreground text-xs text-center">
                      ${budget.toLocaleString()}
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ البدء</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-8" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ الانتهاء</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-8" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محتوى الإعلان</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="اكتب نص الإعلان هنا"
                  className="h-24 text-sm"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createCampaign.isPending} className="w-full h-8 mt-2">
          {createCampaign.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
        </Button>
      </form>
    </Form>
  );
}