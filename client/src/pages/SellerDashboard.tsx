import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function SellerDashboard() {
  const { user, isLoading, isAuthenticated, isSeller, logout } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isSeller)) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, isSeller, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isSeller) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Seller Dashboard - Manage your car listings and sales
            </p>
          </div>
          <Button onClick={() => logout()} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Listings</CardTitle>
              <CardDescription>Active car listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">No listings yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
              <CardDescription>Cars sold this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">No sales yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Total earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$0</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">No revenue yet</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your car inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => navigate("/list-car")}>
                Add New Car Listing
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/my-listings")}>
                View My Listings
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/sales-analytics")}>
                View Sales Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates on your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent activity
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}