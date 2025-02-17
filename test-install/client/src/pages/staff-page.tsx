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
import { Staff, User } from "@shared/schema";
import { UserPlus2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

export default function StaffPage() {
  const { data: staff } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to get user details
  const getUserDetails = (userId: number) => {
    return users?.find(u => u.id === userId);
  };

  // Function to format work days array into readable string
  const formatWorkDays = (days: string[]) => {
    const arabicDays = {
      sunday: "الأحد",
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت"
    };
    return days.map(day => arabicDays[day as keyof typeof arabicDays]).join("، ");
  };

  // Function to format work hours array into readable string
  const formatWorkHours = (hours: string[]) => {
    return hours.join("، ");
  };

  const filteredStaff = staff?.filter((staffMember) => {
    const searchLower = searchTerm.toLowerCase();
    const user = getUserDetails(staffMember.userId);
    const userName = user?.name.toLowerCase() || '';
    const specialization = (staffMember.specialization || '').toLowerCase();
    const workDays = staffMember.workDays ? formatWorkDays(staffMember.workDays).toLowerCase() : '';

    return (
      userName.includes(searchLower) ||
      specialization.includes(searchLower) ||
      workDays.includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">الموظفين</h1>
          <Button>
            <UserPlus2 className="h-4 w-4 ml-2" />
            إضافة موظف
          </Button>
        </div>

        <div className="max-w-sm">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن موظف..."
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>التخصص</TableHead>
                <TableHead>أيام العمل</TableHead>
                <TableHead>ساعات العمل</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff?.map((staffMember) => {
                const user = getUserDetails(staffMember.userId);
                return (
                  <TableRow key={staffMember.id}>
                    <TableCell className="font-medium">{user?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {staffMember.specialization || "غير محدد"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staffMember.workDays ? formatWorkDays(staffMember.workDays) : "غير محدد"}
                    </TableCell>
                    <TableCell>
                      {staffMember.workHours ? formatWorkHours(staffMember.workHours) : "غير محدد"}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        نشط
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredStaff?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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