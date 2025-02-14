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
              {appointments?.map((appointment) => (
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
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
