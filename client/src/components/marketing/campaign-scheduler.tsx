import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { insertScheduledPostSchema } from "@shared/schema";
import { z } from "zod";

const scheduledPostFormSchema = insertScheduledPostSchema.extend({
  scheduledTime: z.string(),
});

type ScheduledPostFormData = z.infer<typeof scheduledPostFormSchema>;

interface CampaignSchedulerProps {
  campaignId: number;
  platform: string;
  onSuccess?: () => void;
}

export function CampaignScheduler({ campaignId, platform, onSuccess }: CampaignSchedulerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ScheduledPostFormData>({
    resolver: zodResolver(scheduledPostFormSchema),
    defaultValues: {
      campaignId,
      platform,
      content: "",
      mediaUrls: [],
      status: "pending",
      scheduledTime: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    },
  });

  const schedulePost = useMutation({
    mutationFn: async (data: ScheduledPostFormData) => {
      const res = await apiRequest("POST", "/api/scheduled-posts", {
        ...data,
        scheduledTime: new Date(data.scheduledTime),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-posts", campaignId] });
      toast({
        title: "تم جدولة المنشور",
        description: "تم جدولة المنشور بنجاح",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في جدولة المنشور",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => schedulePost.mutate(data))} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">محتوى المنشور</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="اكتب محتوى المنشور هنا"
                  className="h-20 text-xs resize-none"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">موعد النشر</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  className="h-7 text-xs"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mediaUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium">الوسائط</FormLabel>
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

        <Button
          type="submit"
          disabled={schedulePost.isPending}
          className="w-full h-7 text-xs font-medium"
        >
          {schedulePost.isPending ? "جاري الجدولة..." : "جدولة المنشور"}
        </Button>
      </form>
    </Form>
  );
}
