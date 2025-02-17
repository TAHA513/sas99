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
import { Customer } from "@shared/schema";
import { UserPlus } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

export default function CustomersPage() {
  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers?.filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      (customer.email?.toLowerCase().includes(searchLower) ?? false) ||
      (customer.notes?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">العملاء</h1>
          <Button>
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة عميل
          </Button>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن عميل..."
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.notes}</TableCell>
                </TableRow>
              ))}
              {filteredCustomers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    لا توجد نتائج للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}