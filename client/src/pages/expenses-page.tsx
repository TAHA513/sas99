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
import { Plus, DollarSign, FileText, Calendar } from "lucide-react";
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
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@shared/schema";

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // جلب المصروفات
  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // فلترة المصروفات حسب البحث
  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.recipient.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حساب الإحصائيات
  const todayExpenses = expenses.filter(expense => 
    new Date(expense.date).toDateString() === new Date().toDateString()
  );

  const todayTotal = todayExpenses.reduce((sum, expense) => 
    sum + Number(expense.amount), 0
  );

  const monthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    return expenseDate.getMonth() === today.getMonth() &&
           expenseDate.getFullYear() === today.getFullYear();
  });

  const monthTotal = monthExpenses.reduce((sum, expense) => 
    sum + Number(expense.amount), 0
  );

  const totalExpenses = expenses.reduce((sum, expense) => 
    sum + Number(expense.amount), 0
  );

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">المصروفات</h1>
        <div className="flex items-center gap-4">
          <SearchInput
            placeholder="بحث في المصروفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة مصروف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مصروف جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المصروف الجديد
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مصروفات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(todayTotal, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              {todayExpenses.length} مصروف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">مصروفات الشهر</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthTotal, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              {monthExpenses.length} مصروف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} مصروف
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>المستلم</TableHead>
              <TableHead>الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {format(new Date(expense.date), 'dd MMMM yyyy', { locale: ar })}
                </TableCell>
                <TableCell>{expense.categoryId}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{formatCurrency(Number(expense.amount), 'USD')}</TableCell>
                <TableCell>
                  {expense.paymentMethod === 'cash' ? 'نقداً' :
                   expense.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'شيك'}
                </TableCell>
                <TableCell>{expense.recipient}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      expense.status === 'completed' ? 'bg-green-100 text-green-800' :
                      expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {expense.status === 'completed' ? 'مكتمل' :
                     expense.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filteredExpenses.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد مصروفات حالياً
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}