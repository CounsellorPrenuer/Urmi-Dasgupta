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
import { format } from "date-fns";

export default function ContactSubmissionsAdmin() {
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  
  const { data: submissions, isLoading } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/contact"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Submissions</h1>
        <p className="text-muted-foreground">View all contact form submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>Total: {submissions?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions?.map((submission) => (
                <TableRow key={submission.id} data-testid={`row-contact-${submission.id}`}>
                  <TableCell data-testid={`text-name-${submission.id}`}>{submission.name}</TableCell>
                  <TableCell data-testid={`text-email-${submission.id}`}>{submission.email}</TableCell>
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
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl" data-testid="modal-submission-details">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Name</label>
                  <p className="text-base" data-testid="detail-name">{selectedSubmission.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Email</label>
                  <p className="text-base" data-testid="detail-email">{selectedSubmission.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Phone</label>
                  <p className="text-base" data-testid="detail-phone">{selectedSubmission.phone}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Purpose</label>
                  <div className="mt-1">
                    <Badge variant="outline" data-testid="detail-purpose">{selectedSubmission.purpose}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Date</label>
                  <p className="text-base" data-testid="detail-date">
                    {format(new Date(selectedSubmission.createdAt), 'MMMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Message</label>
                <p className="text-base mt-1 p-3 bg-muted rounded-md" data-testid="detail-message">
                  {selectedSubmission.message}
                </p>
              </div>
              
              {selectedSubmission.briefMessage && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Brief Message / Description</label>
                  <p className="text-base mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap" data-testid="detail-brief-message">
                    {selectedSubmission.briefMessage}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
