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
import { DatePicker } from "@/components/ui/date-picker";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const campaignFormSchema = insertMarketingCampaignSchema.extend({
  startDate: z.date(),
  endDate: z.date(),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  platform: 'facebook' | 'instagram' | 'snapchat';
  onSuccess?: () => void;
}

export function CampaignForm({ platform, onSuccess }: CampaignFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [budget, setBudget] = useState(1000);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      type: platform,
      platforms: [platform],
      status: 'draft',
      budget: 1000,
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const res = await apiRequest("POST", "/api/campaigns", data);
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

  const onSubmit = (data: CampaignFormData) => {
    createCampaign.mutate({
      ...data,
      budget: budget * 100, // Convert to cents
    });
  };

  const platformLabels = {
    facebook: "فيسبوك",
    instagram: "انستغرام",
    snapchat: "سناب شات",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الحملة</FormLabel>
              <FormControl>
                <Input {...field} placeholder={`حملة ${platformLabels[platform]} الجديدة`} />
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
                  placeholder="اكتب وصفاً مختصراً للحملة"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاريخ البدء</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    onChange={field.onChange}
                  />
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
                  <DatePicker
                    date={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="budget"
          render={() => (
            <FormItem>
              <FormLabel>الميزانية (ريال)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    value={[budget]}
                    onValueChange={([value]) => setBudget(value)}
                    min={100}
                    max={10000}
                    step={100}
                  />
                  <div className="text-muted-foreground text-sm text-center">
                    {budget.toLocaleString()} ريال
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محتوى الإعلان</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="اكتب نص الإعلان هنا"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createCampaign.isPending} className="w-full">
          {createCampaign.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
        </Button>
      </form>
    </Form>
  );
}
