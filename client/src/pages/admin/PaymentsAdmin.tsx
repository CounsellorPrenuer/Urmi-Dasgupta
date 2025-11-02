import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentTracking } from "@shared/schema";
import { format } from "date-fns";

export default function PaymentsAdmin() {
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const { data: payments, isLoading } = useQuery<PaymentTracking[]>({
    queryKey: ["/api/payments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const payment = payments?.find(p => p.id === id);
      if (!payment) throw new Error("Payment not found");
      
      const response = await apiRequest("PUT", `/api/payments/${id}`, {
        ...payment,
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment status updated successfully" });
      setUpdatingStatus(null);
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Payment Tracking</h1>
        <p className="text-sm md:text-base text-muted-foreground">Monitor payment information before checkout</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Payment Records</CardTitle>
          <CardDescription>Total: {payments?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[150px]">Package</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Date</TableHead>
                <TableHead className="min-w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!payments || payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No payment records found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                    <TableCell data-testid={`text-name-${payment.id}`}>{payment.name}</TableCell>
                    <TableCell data-testid={`text-email-${payment.id}`} className="max-w-[200px] truncate">{payment.email}</TableCell>
                    <TableCell data-testid={`text-phone-${payment.id}`}>{payment.phone}</TableCell>
                    <TableCell data-testid={`text-package-${payment.id}`}>{payment.packageName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === "completed" ? "default" : "outline"}
                        data-testid={`badge-status-${payment.id}`}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell data-testid={`text-date-${payment.id}`}>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Select
                        value={payment.status}
                        onValueChange={(value) => {
                          setUpdatingStatus(payment.id);
                          handleStatusChange(payment.id, value);
                        }}
                        disabled={updatingStatus === payment.id}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-status-${payment.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
