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
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import type { Blog } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  imageUrl: z.string().optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

export default function BlogsAdmin() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);

  const { data: blogs, isLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"],
  });

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      author: "",
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const response = await apiRequest("POST", "/api/blogs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({ title: "Blog created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BlogFormData }) => {
      const response = await apiRequest("PUT", `/api/blogs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({ title: "Blog updated successfully" });
      setIsDialogOpen(false);
      setEditingBlog(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/blogs/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({ title: "Blog deleted successfully" });
    },
  });

  const onSubmit = (data: BlogFormData) => {
    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    form.reset({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      imageUrl: blog.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingBlog(null);
      form.reset();
    }
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
      
      // Set ACL policy for the uploaded image
      const response = await apiRequest("PUT", "/api/blog-images", {
        imageURL: uploadURL,
      });
      const data = await response.json();
      
      // Update the form with the object path
      form.setValue("imageUrl", data.objectPath);
      toast({ title: "Image uploaded successfully" });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Blogs</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage blog posts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-blog">
              <Plus className="w-4 h-4 mr-2" />
              Add Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog ? "Edit Blog" : "Add Blog"}
              </DialogTitle>
              <DialogDescription>
                {editingBlog ? "Update the blog post" : "Create a new blog post"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Blog title" data-testid="input-title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Author name" data-testid="input-author" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief summary" data-testid="input-excerpt" {...field} />
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
                        <Textarea placeholder="Full blog content" rows={10} data-testid="input-content" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-base font-semibold">Blog Image (Optional)</FormLabel>
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
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <img 
                        src={form.watch("imageUrl")} 
                        alt="Blog preview" 
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
                      Upload Image from Your Device
                    </ObjectUploader>
                    <p className="text-xs text-muted-foreground text-center">
                      Max file size: 10 MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-blog">
                  {editingBlog ? "Update" : "Create"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">All Blogs</CardTitle>
          <CardDescription>Total: {blogs?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Title</TableHead>
                <TableHead className="min-w-[120px]">Author</TableHead>
                <TableHead className="min-w-[250px]">Excerpt</TableHead>
                <TableHead className="min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs?.map((blog) => (
                <TableRow key={blog.id} data-testid={`row-blog-${blog.id}`}>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell className="max-w-md truncate">{blog.excerpt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(blog)}
                        data-testid={`button-edit-${blog.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(blog.id)}
                        data-testid={`button-delete-${blog.id}`}
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
