import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import type { Testimonial } from "@shared/schema";

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.coerce.number().min(1).max(5),
});

type TestimonialFormData = z.infer<typeof testimonialSchema>;

export default function TestimonialsAdmin() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      content: "",
      rating: 5,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      const response = await apiRequest("POST", "/api/testimonials", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({ title: "Testimonial created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TestimonialFormData }) => {
      const response = await apiRequest("PUT", `/api/testimonials/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({ title: "Testimonial updated successfully" });
      setIsDialogOpen(false);
      setEditingTestimonial(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/testimonials/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({ title: "Testimonial deleted successfully" });
    },
  });

  const onSubmit = (data: TestimonialFormData) => {
    if (editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.reset({
      name: testimonial.name,
      content: testimonial.content,
      rating: testimonial.rating,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTestimonial(null);
      form.reset();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Testimonials</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage customer testimonials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-testimonial">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial ? "Update the testimonial details" : "Create a new testimonial"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" data-testid="input-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Testimonial content" data-testid="input-content" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="5" data-testid="input-rating" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-testimonial">
                  {editingTestimonial ? "Update" : "Create"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Testimonials</CardTitle>
          <CardDescription>Total: {testimonials?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="min-w-[250px]">Content</TableHead>
                <TableHead className="min-w-[100px]">Rating</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials?.map((testimonial) => (
                <TableRow key={testimonial.id} data-testid={`row-testimonial-${testimonial.id}`}>
                  <TableCell>{testimonial.name}</TableCell>
                  <TableCell className="max-w-md truncate">{testimonial.content}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(testimonial)}
                        data-testid={`button-edit-${testimonial.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(testimonial.id)}
                        data-testid={`button-delete-${testimonial.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
