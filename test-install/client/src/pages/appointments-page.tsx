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
import { Appointment, Customer, Staff } from "@shared/schema";
import { CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

const statusMap = {
  scheduled: { label: "مجدول", color: "bg-blue-100 text-blue-800" },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" },
};

export default function AppointmentsPage() {
  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: staff } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to get customer name
  const getCustomerName = (customerId: number) => {
    return customers?.find(c => c.id === customerId)?.name || 'غير معروف';
  };

  // Helper function to get staff name
  const getStaffName = (staffId: number) => {
    const staffMember = staff?.find(s => s.id === staffId);
    if (!staffMember) return 'غير معروف';
    return staffMember.specialization || 'غير محدد';
  };

  const filteredAppointments = appointments?.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase();
    const customerName = getCustomerName(appointment.customerId).toLowerCase();
    const staffName = getStaffName(appointment.staffId).toLowerCase();
    const date = format(new Date(appointment.startTime), 'dd MMMM yyyy', { locale: ar }).toLowerCase();

    return (
      customerName.includes(searchLower) ||
      staffName.includes(searchLower) ||
      date.includes(searchLower) ||
      appointment.status.toLowerCase().includes(searchLower) ||
      (appointment.notes?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">المواعيد</h1>
          <Button>
            <CalendarPlus className="h-4 w-4 ml-2" />
            موعد جديد
          </Button>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث في المواعيد..."
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>الموظف</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments?.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{getCustomerName(appointment.customerId)}</TableCell>
                  <TableCell>{getStaffName(appointment.staffId)}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.startTime), 'dd MMMM yyyy', { locale: ar })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={statusMap[appointment.status as keyof typeof statusMap].color}
                    >
                      {statusMap[appointment.status as keyof typeof statusMap].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{appointment.notes}</TableCell>
                </TableRow>
              ))}
              {filteredAppointments?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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