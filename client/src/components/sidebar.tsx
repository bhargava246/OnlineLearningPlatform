import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Award,
  LogOut
} from "lucide-react";

const getSidebarItems = (userRole: string) => {
  const baseItems = [
    { icon: LayoutDashboard, label: "Dashboard", route: "/dashboard" },
    { icon: BookOpen, label: "My Courses", route: "/courses" },
    { icon: Award, label: "Test Results", route: "/test-results" },
  ];

  if (userRole === 'admin') {
    baseItems.push({ icon: Settings, label: "Admin Panel", route: "/admin" });
  }

  return baseItems;
};

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const sidebarItems = getSidebarItems(user?.role || 'student');

  const isActive = (route: string) => {
    if (route === "/dashboard" && (location === "/" || location === "/dashboard")) return true;
    if (route !== "/dashboard" && location.startsWith(route)) return true;
    return false;
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token");
      window.location.href = '/';
    } else {
      window.location.href = '/api/logout';
    }
  };

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setLocation('/dashboard')}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-900" />
          </div>
          <span className="font-bold text-lg">EduPlatform</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2 mb-8">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <button 
                onClick={() => setLocation(item.route)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive(item.route)
                    ? 'bg-blue-800 text-white' 
                    : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}