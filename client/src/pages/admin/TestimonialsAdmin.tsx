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
import { Plus, Pencil, Trash2, Star, Upload, RefreshCw } from "lucide-react";
import type { Testimonial } from "@shared/schema";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ObjectUploader } from "@/components/ObjectUploader";

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
  rating: z.coerce.number().min(1).max(5),
  imageUrl: z.string().optional(),
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
      imageUrl: "",
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

  const seedPhotosMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/seed-testimonial-photos", {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      
      if (data.errors && data.errors.length > 0) {
        toast({ 
          title: "Partial success",
          description: `Updated ${data.updatedCount} testimonials. ${data.errors.length} errors occurred.`,
          variant: "destructive"
        });
        console.error("Seed errors:", data.errors);
      } else {
        toast({ 
          title: "Profile photos backfilled successfully",
          description: `Updated ${data.updatedCount} testimonials with profile photos`
        });
      }
    },
    onError: () => {
      toast({ 
        title: "Failed to backfill profile photos",
        description: "Please try again",
        variant: "destructive"
      });
    },
  });

  const handleSeedPhotos = () => {
    if (confirm("This will add profile photos to testimonials that don't have images yet. Continue?")) {
      seedPhotosMutation.mutate();
    }
  };

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
      imageUrl: testimonial.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload", {});
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: { successful: Array<{ uploadURL: string }> }) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      
      const response = await apiRequest("POST", "/api/objects/upload", {
        imageURL: uploadURL,
      });
      const data = await response.json();
      
      form.setValue("imageUrl", data.objectPath);
      toast({ 
        title: "Image uploaded successfully",
        description: "Profile picture has been set"
      });
    }
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
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden" data-testid="button-mobile-menu-testimonials" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Testimonials</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage customer testimonials</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSeedPhotos}
            disabled={seedPhotosMutation.isPending}
            data-testid="button-seed-photos"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${seedPhotosMutation.isPending ? 'animate-spin' : ''}`} />
            Backfill Photos
          </Button>
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
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-semibold">Profile Picture (Optional)</FormLabel>
                    {form.watch("imageUrl") && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => form.setValue("imageUrl", "")}
                        data-testid="button-clear-image"
                      >
                        Clear Image
                      </Button>
                    )}
                  </div>
                  
                  {form.watch("imageUrl") && (
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border border-border mx-auto">
                      <img 
                        src={form.watch("imageUrl")} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-normal">Enter Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" data-testid="input-imageurl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-sm font-medium text-muted-foreground">OR</span>
                    <div className="h-px bg-border flex-1"></div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      buttonVariant="secondary"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Profile Picture
                    </ObjectUploader>
                    <p className="text-xs text-muted-foreground text-center">
                      Max file size: 10 MB. Recommended: Square image for best results
                    </p>
                  </div>
                </div>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-testimonial">
                  {editingTestimonial ? "Update" : "Create"}
                </Button>
              </form>
            </Form>
          </DialogContent>
          </Dialog>
        </div>
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
