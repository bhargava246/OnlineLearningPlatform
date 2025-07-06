import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Heart, Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/search", label: "Collection", active: location.startsWith("/search") || location.startsWith("/cars") },
    { href: "/dealers", label: "Contact", active: location.startsWith("/dealers") },
  ];

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-white">Luxury.cars</h1>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors ${
                  item.active
                    ? "text-orange-400"
                    : "text-white hover:text-orange-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="text-white hover:text-orange-400">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:text-orange-400">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="font-medium">{user?.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user?.role === "seller" && (
                    <DropdownMenuItem asChild>
                      <Link href="/seller-dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:text-orange-400">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`font-medium text-lg transition-colors ${
                        item.active
                          ? "text-carstore-orange"
                          : "text-gray-700 hover:text-carstore-orange"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button className="bg-carstore-orange text-white hover:bg-carstore-orange-dark mt-4">
                    Sign In
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
