import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Route, Switch, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Package, 
  CreditCard, 
  Mail,
  LogOut 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

import TestimonialsAdmin from "./admin/TestimonialsAdmin";
import BlogsAdmin from "./admin/BlogsAdmin";
import PackagesAdmin from "./admin/PackagesAdmin";
import MentoriaPackagesAdmin from "./admin/MentoriaPackagesAdmin";
import ContactSubmissionsAdmin from "./admin/ContactSubmissionsAdmin";
import PaymentsAdmin from "./admin/PaymentsAdmin";
import MentoriaPaymentsAdmin from "./admin/MentoriaPaymentsAdmin";

const menuItems = [
  {
    title: "Testimonials",
    url: "/admin/dashboard/testimonials",
    icon: MessageSquare,
  },
  {
    title: "Blogs",
    url: "/admin/dashboard/blogs",
    icon: FileText,
  },
  {
    title: "Packages",
    url: "/admin/dashboard/packages",
    icon: Package,
  },
  {
    title: "Mentoria Packages",
    url: "/admin/dashboard/mentoria-packages",
    icon: Package,
  },
  {
    title: "Contact Submissions",
    url: "/admin/dashboard/contacts",
    icon: Mail,
  },
  {
    title: "Payment Tracking",
    url: "/admin/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Mentoria Payments",
    url: "/admin/dashboard/mentoria-payments",
    icon: CreditCard,
  },
];

function AdminSidebar() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/admin/login");
    },
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            <LayoutDashboard className="w-5 h-5 mr-2 inline" />
            Admin Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    data-active={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const { data: session, isLoading } = useQuery<{ success: boolean; user?: { id: string; username: string } }>({
    queryKey: ["/api/auth/session"],
  });

  useEffect(() => {
    if (!isLoading && !session?.success) {
      setLocation("/admin/login");
    }
  }, [session, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session?.success) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Switch>
            <Route path="/admin/dashboard/testimonials" component={TestimonialsAdmin} />
            <Route path="/admin/dashboard/blogs" component={BlogsAdmin} />
            <Route path="/admin/dashboard/packages" component={PackagesAdmin} />
            <Route path="/admin/dashboard/mentoria-packages" component={MentoriaPackagesAdmin} />
            <Route path="/admin/dashboard/contacts" component={ContactSubmissionsAdmin} />
            <Route path="/admin/dashboard/payments" component={PaymentsAdmin} />
            <Route path="/admin/dashboard/mentoria-payments" component={MentoriaPaymentsAdmin} />
            <Route>
              <div className="text-center px-4">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">Welcome to Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Select an option from the sidebar to get started
                </p>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </SidebarProvider>
  );
}
