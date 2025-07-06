import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Car, 
  TrendingUp, 
  Users, 
  Star, 
  Heart,
  Package,
  DollarSign,
  Eye,
  MessageSquare,
  BarChart3,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import type { User, Car as CarType, FavoriteCar } from "@shared/schema";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const { data: cars } = useQuery<CarType[]>({
    queryKey: ["/api/cars"],
  });

  const { data: favorites } = useQuery<FavoriteCar[]>({
    queryKey: [`/api/favorites/${user._id}`],
  });

  const { data: userCars } = useQuery<CarType[]>({
    queryKey: [`/api/cars/dealer/${user._id}`],
    enabled: user.role === "seller",
  });

  if (user.role === "buyer") {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.username}!</h1>
          <p className="text-blue-100">Ready to find your perfect car?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Cars</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cars in your favorites
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Cars</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cars?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cars available for purchase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Cars viewed this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with these popular actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/search">
                <Button className="w-full justify-start h-auto py-4">
                  <Car className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Search Cars</div>
                    <div className="text-sm text-muted-foreground">Find your perfect vehicle</div>
                  </div>
                </Button>
              </Link>
              <Link href="/favorites">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Heart className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">View Favorites</div>
                    <div className="text-sm text-muted-foreground">Check your saved cars</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Favorites */}
        {favorites && favorites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Favorites</CardTitle>
              <CardDescription>Cars you've saved for later</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favorites.slice(0, 3).map((favorite) => (
                  <div key={favorite._id} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Car className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Car #{favorite.carId}</p>
                      <p className="text-sm text-muted-foreground">Added to favorites</p>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (user.role === "seller") {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-green-100">Manage your inventory and grow your business</p>
        </div>

        {/* Seller Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCars?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cars in your inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                Total car views this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                New inquiries
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your dealership efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/add-car">
                <Button className="w-full justify-start h-auto py-4">
                  <Plus className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Add New Car</div>
                    <div className="text-sm text-muted-foreground">List a new vehicle</div>
                  </div>
                </Button>
              </Link>
              <Link href="/inventory">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <Package className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">View Inventory</div>
                    <div className="text-sm text-muted-foreground">Manage your cars</div>
                  </div>
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start h-auto py-4">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">View Analytics</div>
                    <div className="text-sm text-muted-foreground">Track performance</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Inventory */}
        {userCars && userCars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Inventory</CardTitle>
              <CardDescription>Your latest car listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userCars.slice(0, 3).map((car) => (
                  <div key={car._id} className="flex items-center space-x-4 p-3 rounded-lg border">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Car className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{car.year} {car.make} {car.model}</p>
                      <p className="text-sm text-muted-foreground">${parseFloat(car.price).toLocaleString()}</p>
                    </div>
                    <Badge variant={car.available ? "default" : "secondary"}>
                      {car.available ? "Available" : "Sold"}
                    </Badge>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Default Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to CarStore</h1>
        <p className="text-blue-100">Your automotive marketplace</p>
      </div>
    </div>
  );
}