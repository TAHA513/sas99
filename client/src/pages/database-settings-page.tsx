import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Plus, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import type { DatabaseConnection } from "@shared/schema";
import { DatabaseConnectionForm } from "@/components/settings/database-connection-form";
import { Badge } from "@/components/ui/badge";

export default function DatabaseSettingsPage() {
  // جلب قائمة الاتصالات
  const { data: connections = [] } = useQuery<DatabaseConnection[]>({
    queryKey: ["/api/database-connections"],
  });

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">إدارة قواعد البيانات</h1>
            <p className="text-muted-foreground">إدارة اتصالات قواعد البيانات في النظام</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="transition-transform hover:scale-105">
                <Plus className="h-4 w-4 ml-2" />
                إضافة اتصال جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة اتصال قاعدة بيانات جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الاتصال بقاعدة البيانات
                </DialogDescription>
              </DialogHeader>
              <DatabaseConnectionForm />
            </DialogContent>
          </Dialog>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border rounded-lg"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الاتصال</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المضيف</TableHead>
                <TableHead>قاعدة البيانات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">{connection.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Database className="h-4 w-4 ml-2" />
                      {connection.type}
                    </div>
                  </TableCell>
                  <TableCell>{connection.host || '-'}</TableCell>
                  <TableCell>{connection.database || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={connection.isActive ? "default" : "secondary"}>
                      {connection.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(connection.createdAt).toLocaleDateString('ar-IQ')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        تحرير
                      </Button>
                      <Button variant="destructive" size="sm">
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {connections.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد اتصالات حالياً
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}