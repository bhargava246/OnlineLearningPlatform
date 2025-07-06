import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Car, 
  Search, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Home,
  Plus,
  BarChart3,
  Users,
  MessageSquare,
  FileText,
  Star,
  Package
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

interface SidebarProps {
  user: UserType;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "See you again soon!",
      });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const buyerNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Search, label: "Search Cars", href: "/search" },
    { icon: Users, label: "Sellers", href: "/sellers" },
    { icon: Heart, label: "Favorites", href: "/favorites" },
    { icon: FileText, label: "My Orders", href: "/orders" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Star, label: "Reviews", href: "/reviews" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const sellerNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "My Inventory", href: "/inventory" },
    { icon: Plus, label: "Add Car", href: "/add-car" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: MessageSquare, label: "Messages", href: "/messages" },
    { icon: Star, label: "Reviews", href: "/dealer-reviews" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const adminNavItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Manage Users", href: "/admin/users" },
    { icon: Car, label: "Manage Cars", href: "/admin/cars" },
    { icon: Package, label: "Manage Dealers", href: "/admin/dealers" },
    { icon: BarChart3, label: "System Analytics", href: "/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  const getNavItems = () => {
    if (user.role === "admin") return adminNavItems;
    if (user.role === "seller") return sellerNavItems;
    return buyerNavItems;
  };

  const navItems = getNavItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center p-6 border-b">
        <Car className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">CarStore</span>
      </div>

      {/* User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.username}</p>
            <Badge variant="secondary" className="text-xs">
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Settings & Logout */}
      <div className="p-3 border-t space-y-2">
        <Link href="/settings">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMobileOpen(false)}
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-3 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="fixed top-4 left-4 z-50 md:hidden"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
}