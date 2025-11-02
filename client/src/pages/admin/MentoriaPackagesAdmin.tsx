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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";
import type { MentoriaPackage } from "@shared/schema";

const mentoriaPackageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  features: z.string().min(1, "Features are required"),
  isPopular: z.boolean(),
  isActive: z.boolean(),
});

type MentoriaPackageFormData = z.infer<typeof mentoriaPackageSchema>;

const categories = [
  "8-9 Students",
  "10-12 Students",
  "College Graduates",
  "Working Professionals",
];

export default function MentoriaPackagesAdmin() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MentoriaPackage | null>(null);

  const { data: packages, isLoading } = useQuery<MentoriaPackage[]>({
    queryKey: ["/api/mentoria-packages"],
  });

  const form = useForm<MentoriaPackageFormData>({
    resolver: zodResolver(mentoriaPackageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      features: "",
      isPopular: false,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MentoriaPackageFormData) => {
      const features = data.features.split('\n').map(f => f.trim()).filter(Boolean);
      const response = await apiRequest("POST", "/api/mentoria-packages", { ...data, features });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentoria-packages"] });
      toast({ title: "Mentoria package created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MentoriaPackageFormData }) => {
      const features = data.features.split('\n').map(f => f.trim()).filter(Boolean);
      const response = await apiRequest("PUT", `/api/mentoria-packages/${id}`, { ...data, features });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentoria-packages"] });
      toast({ title: "Mentoria package updated successfully" });
      setIsDialogOpen(false);
      setEditingPackage(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/mentoria-packages/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentoria-packages"] });
      toast({ title: "Mentoria package deleted successfully" });
    },
  });

  const onSubmit = (data: MentoriaPackageFormData) => {
    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (pkg: MentoriaPackage) => {
    setEditingPackage(pkg);
    form.reset({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      category: pkg.category,
      features: pkg.features.join('\n'),
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this Mentoria package?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingPackage(null);
      form.reset();
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mentoria Packages</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage Mentoria career guidance packages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-mentoria-package">
              <Plus className="w-4 h-4 mr-2" />
              Add Mentoria Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "Edit Mentoria Package" : "Add Mentoria Package"}
              </DialogTitle>
              <DialogDescription>
                {editingPackage ? "Update the Mentoria package details" : "Create a new Mentoria package"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Discover Plus+" {...field} data-testid="input-package-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Short overview of the package" 
                          {...field} 
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="15000" 
                          {...field} 
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter each feature on a new line"
                          className="min-h-[150px]"
                          {...field} 
                          data-testid="textarea-features"
                        />
                      </FormControl>
                      <FormDescription>Enter one feature per line</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPopular"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mark as Popular</FormLabel>
                        <FormDescription>
                          Display a "Popular" badge on this package
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-popular"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active (Visible on Website)</FormLabel>
                        <FormDescription>
                          Turn off to hide this package from the website
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleDialogChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-package"
                  >
                    {editingPackage ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[100px]">Price</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Features</TableHead>
                <TableHead className="text-right min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages?.map((pkg) => (
                <TableRow key={pkg.id} data-testid={`row-package-${pkg.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {pkg.name}
                      {pkg.isPopular && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{pkg.category}</TableCell>
                  <TableCell>₹{pkg.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {pkg.isActive ? (
                        <>
                          <Eye className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Hidden</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {pkg.features.length} features
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(pkg)}
                        data-testid={`button-edit-${pkg.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(pkg.id)}
                        data-testid={`button-delete-${pkg.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {packages?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No Mentoria packages found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
