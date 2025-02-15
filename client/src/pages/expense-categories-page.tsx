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
import { Plus } from "lucide-react";
import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import type { ExpenseCategory } from "@shared/schema";
import { ExpenseCategoryForm } from "@/components/expenses/expense-category-form";

const tableRowVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 }
};

export default function ExpenseCategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // جلب فئات المصروفات
  const { data: categories = [] } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expense-categories"],
  });

  // فلترة الفئات حسب البحث
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">فئات المصروفات</h1>
            <p className="text-muted-foreground">إدارة وتنظيم فئات المصروفات في النظام</p>
          </div>
          <div className="flex items-center gap-4">
            <SearchInput
              placeholder="بحث في الفئات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button className="transition-transform hover:scale-105">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة فئة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة فئة جديدة</DialogTitle>
                  <DialogDescription>
                    أدخل تفاصيل الفئة الجديدة
                  </DialogDescription>
                </DialogHeader>
                <ExpenseCategoryForm />
              </DialogContent>
            </Dialog>
          </div>
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
                <TableHead>اسم الفئة</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category, index) => (
                <motion.tr
                  key={category.id}
                  initial="initial"
                  animate="animate"
                  variants={tableRowVariants}
                  transition={{ delay: index * 0.1 }}
                  className="transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString('ar-IQ')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="transition-transform hover:scale-105"
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="transition-transform hover:scale-105"
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {filteredCategories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    لا توجد فئات حالياً
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