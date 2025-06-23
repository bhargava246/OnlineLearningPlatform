import { Link, useLocation } from "wouter";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/" },
    { name: "My Courses", href: "/courses" },
    { name: "Test Results", href: "/test-results" },
    { name: "Admin", href: "/admin" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">
                  EduPlatform
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`px-1 pb-4 pt-5 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      isActive(item.href)
                        ? "text-primary border-primary"
                        : "text-gray-500 hover:text-gray-700 border-transparent"
                    }`}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-400" />
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                <AvatarFallback>JS</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">John Smith</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
