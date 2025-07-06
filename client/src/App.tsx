import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import CarDetail from "@/pages/CarDetail";
import SearchResults from "@/pages/SearchResults";
import Compare from "@/pages/Compare";
import Dealers from "@/pages/Dealers";
import DealerProfile from "@/pages/DealerProfile";
import ListCars from "@/pages/ListCars";
import Wishlist from "@/pages/Wishlist";
import Sellers from "@/pages/Sellers";
import Profile from "@/pages/Profile";
import Calculator from "@/pages/Calculator";
import Reviews from "@/pages/Reviews";
import Contact from "@/pages/Contact";
import Help from "@/pages/Help";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";

function AuthenticatedRouter({ user }: { user: any }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Switch>
              <Route path="/dashboard" component={() => <Dashboard user={user} />} />
              <Route path="/search" component={SearchResults} />
              <Route path="/cars/:id" component={CarDetail} />
              <Route path="/compare" component={Compare} />
              <Route path="/dealers" component={Dealers} />
              <Route path="/dealers/:id" component={DealerProfile} />
              <Route path="/sellers" component={Sellers} />
              <Route path="/favorites" component={Wishlist} />
              <Route path="/wishlist" component={Wishlist} />
              <Route path="/profile" component={Profile} />
              <Route path="/calculator" component={Calculator} />
              <Route path="/reviews" component={Reviews} />
              <Route path="/contact" component={Contact} />
              <Route path="/help" component={Help} />
              
              {/* Seller/Dealer specific routes */}
              {user.role === "seller" && (
                <>
                  <Route path="/inventory" component={ListCars} />
                  <Route path="/add-car" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Add Car Page</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
                  <Route path="/analytics" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Analytics Page</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
                  <Route path="/customers" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Customers Page</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
                </>
              )}
              
              {/* Buyer specific routes */}
              {user.role === "buyer" && (
                <>
                  <Route path="/orders" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">My Orders</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
                </>
              )}
              
              {/* Common authenticated routes */}
              <Route path="/messages" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Messages</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
              <Route path="/dealer-reviews" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Dealer Reviews</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
              <Route path="/profile" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Profile</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
              <Route path="/settings" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Settings</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
              
              {/* Admin routes */}
              {user.role === "admin" && (
                <>
                  <Route path="/admin/*" component={() => <div className="text-center py-8"><h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2><p className="text-gray-600 mt-2">Coming Soon</p></div>} />
                </>
              )}
              
              <Route path="/" component={() => <Dashboard user={user} />} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedRouter user={user} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
