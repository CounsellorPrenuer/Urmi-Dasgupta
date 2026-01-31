import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import type { ContactSubmission } from "@shared/schema";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { format } from "date-fns";

import { config } from "@/lib/config";

// ... (imports)

export default function ContactSubmissionsAdmin() {
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  const { data: submissions, isLoading } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact"],
    queryFn: async () => {
      const res = await fetch(`${config.api.baseUrl}/api/contact`);
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return res.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" data-testid="button-mobile-menu-contacts" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contact Submissions</h1>
          <p className="text-sm md:text-base text-muted-foreground">View all contact form submissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Submissions</CardTitle>
          <CardDescription>Total: {submissions?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Phone</TableHead>
                <TableHead className="min-w-[140px]">Purpose</TableHead>
                <TableHead className="min-w-[100px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((submission) => (
                <TableRow key={submission.id} data-testid={`row-contact-${submission.id}`}>
                  <TableCell data-testid={`text-name-${submission.id}`}>{submission.name}</TableCell>
                  <TableCell data-testid={`text-email-${submission.id}`} className="max-w-[200px] truncate">{submission.email}</TableCell>

                  <TableCell data-testid={`text-phone-${submission.id}`}>{submission.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" data-testid={`badge-purpose-${submission.id}`}>{submission.purpose}</Badge>
                  </TableCell>
                  <TableCell data-testid={`text-date-${submission.id}`}>{format(new Date(submission.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSubmission(submission)}
                      data-testid={`button-view-${submission.id}`}
                      className="whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-submission-details">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Name</label>
                  <p className="text-base break-words" data-testid="detail-name">{selectedSubmission.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Email</label>
                  <p className="text-base break-all" data-testid="detail-email">{selectedSubmission.email}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                  <p className="text-base break-words" data-testid="detail-phone">{selectedSubmission.phone}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Purpose</label>
                  <div className="mt-1">
                    <Badge variant="outline" data-testid="detail-purpose">{selectedSubmission.purpose}</Badge>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-muted-foreground">Date</label>
                  <p className="text-base" data-testid="detail-date">
                    {format(new Date(selectedSubmission.createdAt), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted-foreground">Message</label>
                <p className="text-base mt-1 p-3 bg-muted rounded-md break-words whitespace-pre-wrap" data-testid="detail-message">
                  {selectedSubmission.message}
                </p>
              </div>

              {selectedSubmission.briefMessage && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Brief Message / Description</label>
                  <div className="mt-1 p-3 bg-muted rounded-md max-h-60 overflow-y-auto">
                    <p className="text-base break-words whitespace-pre-wrap" data-testid="detail-brief-message">
                      {selectedSubmission.briefMessage}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
