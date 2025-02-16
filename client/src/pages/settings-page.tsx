import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2, Settings as SettingsIcon, Paintbrush, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatabaseSettingsPage from "./database-settings-page";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إعدادات النظام</h1>
            <p className="text-muted-foreground mt-2">إدارة إعدادات المتجر والتكاملات</p>
          </div>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4">
            <TabsTrigger value="store" className="space-x-2">
              <Building2 className="h-4 w-4" />
              <span>المتجر</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="space-x-2">
              <SettingsIcon className="h-4 w-4" />
              <span>التكاملات</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="space-x-2">
              <Paintbrush className="h-4 w-4" />
              <span>المظهر</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="space-x-2">
              <Database className="h-4 w-4" />
              <span>قواعد البيانات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المتجر</CardTitle>
                <CardDescription>
                  قريباً
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>التكاملات</CardTitle>
                <CardDescription>
                  قريباً
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>المظهر</CardTitle>
                <CardDescription>
                  قريباً
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <DatabaseSettingsPage />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}