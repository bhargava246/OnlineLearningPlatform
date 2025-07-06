import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, Users, DollarSign, TrendingUp, Package, 
  Eye, MessageSquare, Calendar, BarChart3,
  Star, MapPin, Phone, Mail, Wifi, WifiOff
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useWebSocket, type WebSocketMessage } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import type { Car as CarType, Dealer } from "@shared/schema";

export default function DealerDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: cars } = useQuery({
    queryKey: ["/api/cars"],
  });

  const { data: dealers } = useQuery({
    queryKey: ["/api/dealers"],
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews"],
  });

  // For demo purposes, we'll assume the first dealer is the current user's dealer
  const currentDealer = Array.isArray(dealers) ? dealers[0] as Dealer : undefined;
  const dealerCars = Array.isArray(cars) ? cars.filter((car: CarType) => car.dealerId === currentDealer?._id) : [];
  const dealerReviews = Array.isArray(reviews) ? reviews.filter((review: any) => review.dealerId === currentDealer?._id) : [];

  // Handle real-time WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Dashboard received real-time update:', message);
    
    // Add to recent updates
    const update = {
      id: Date.now(),
      type: message.type,
      data: message.data,
      timestamp: new Date(),
    };
    setRealtimeUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates

    // Show toast notifications for relevant updates
    switch (message.type) {
      case 'CAR_ADDED':
        if (message.dealerId === currentDealer?._id) {
          toast({
            title: "New Car Added",
            description: `${message.data.make} ${message.data.model} added to inventory`,
          });
        }
        break;
      case 'CAR_UPDATED':
        if (message.dealerId === currentDealer?._id) {
          toast({
            title: "Car Updated",
            description: `${message.data.make} ${message.data.model} information updated`,
          });
        }
        break;
      case 'REVIEW_ADDED':
        if (message.dealerId === currentDealer?._id) {
          toast({
            title: "New Review",
            description: `You received a ${message.data.rating}-star review`,
          });
        }
        break;
    }
  }, [currentDealer?._id, toast]);

  // Setup WebSocket connection
  const { isConnected, connectionStatus } = useWebSocket({
    dealerId: currentDealer?._id,
    onMessage: handleWebSocketMessage
  });

  // Calculate metrics
  const metrics = {
    totalCars: dealerCars.length,
    availableCars: dealerCars.filter((car: CarType) => car.available).length,
    soldCars: dealerCars.filter((car: CarType) => !car.available).length,
    totalValue: dealerCars.reduce((sum: number, car: CarType) => sum + parseFloat(car.price.toString()), 0),
    averageRating: currentDealer?.rating || 0,
    totalReviews: dealerReviews.length,
    monthlyViews: 1250, // Mock data
    inquiries: 45, // Mock data
  };

  const recentActivity = [
    { type: "sale", message: "Sold 2023 BMW 3 Series", time: "2 hours ago", amount: "$45,000" },
    { type: "inquiry", message: "New inquiry for Honda Accord", time: "4 hours ago" },
    { type: "review", message: "Received 5-star review", time: "6 hours ago" },
    { type: "listing", message: "Added new Toyota Camry", time: "1 day ago", amount: "$28,500" },
    { type: "inquiry", message: "Test drive scheduled", time: "2 days ago" },
  ];

  const monthlyData = [
    { month: "Jan", sales: 12, revenue: 540000 },
    { month: "Feb", sales: 15, revenue: 675000 },
    { month: "Mar", sales: 18, revenue: 810000 },
    { month: "Apr", sales: 22, revenue: 990000 },
    { month: "May", sales: 19, revenue: 855000 },
    { month: "Jun", sales: 25, revenue: 1125000 },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale": return <DollarSign className="h-4 w-4 text-green-600" />;
      case "inquiry": return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case "review": return <Star className="h-4 w-4 text-yellow-600" />;
      case "listing": return <Package className="h-4 w-4 text-purple-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!currentDealer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dealer Dashboard</h1>
          <p className="text-muted-foreground">Loading dealer information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{currentDealer.name}</h1>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <Wifi className="h-4 w-4" />
                  <span>Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <WifiOff className="h-4 w-4" />
                  <span>Offline</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{currentDealer.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{typeof currentDealer.rating === 'string' ? parseFloat(currentDealer.rating).toFixed(1) : currentDealer.rating?.toFixed(1)} ({currentDealer.reviewCount} reviews)</span>
            </div>
            {currentDealer.verified && (
              <Badge variant="default">Verified Dealer</Badge>
            )}
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{currentDealer.phone || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{currentDealer.email || "Not provided"}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              try {
                const response = await fetch('/api/test/car-update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ dealerId: currentDealer._id })
                });
                if (response.ok) {
                  toast({
                    title: "Test Update Sent",
                    description: "Check the Live Updates section for real-time activity",
                  });
                }
              } catch (error) {
                console.error('Error sending test update:', error);
              }
            }}
            className="text-xs"
          >
            Test Real-time Update
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCars}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.availableCars} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.soldCars}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(metrics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthlyViews}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.amount && (
                        <span className="text-sm font-medium text-green-600">
                          {activity.amount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Updates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Live Updates</CardTitle>
                  <CardDescription>Real-time activity feed</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Offline</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {realtimeUpdates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No recent updates. Add or update a car to see real-time notifications.
                    </p>
                  ) : (
                    realtimeUpdates.map((update) => (
                      <div key={update.id} className="flex items-start gap-3 p-2 bg-muted/50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {update.type === 'CAR_ADDED' && <Package className="h-4 w-4 text-green-600" />}
                          {update.type === 'CAR_UPDATED' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                          {update.type === 'REVIEW_ADDED' && <Star className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {update.type === 'CAR_ADDED' && 'New car added to inventory'}
                            {update.type === 'CAR_UPDATED' && 'Car information updated'}
                            {update.type === 'REVIEW_ADDED' && 'New review received'}
                          </p>
                          {update.data && (
                            <p className="text-xs text-muted-foreground truncate">
                              {update.data.make} {update.data.model} {update.data.year}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {update.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Customer Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{metrics.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Reviews</span>
                  <span className="font-medium">{metrics.totalReviews}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Inquiries</span>
                  <span className="font-medium">{metrics.inquiries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Response Rate</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Monthly sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{data.sales} cars</span>
                      <span className="font-medium">{formatPrice(data.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealerCars.map((car: CarType) => (
              <Card key={car._id}>
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  {car.imageUrls && car.imageUrls.length > 0 ? (
                    <img 
                      src={car.imageUrls[0]} 
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">No Image</div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{car.year} {car.make} {car.model}</CardTitle>
                      <CardDescription>{formatPrice(car.price)}</CardDescription>
                    </div>
                    <Badge variant={car.available ? "default" : "destructive"}>
                      {car.available ? "Available" : "Sold"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mileage:</span>
                      <span>{car.mileage.toLocaleString()} miles</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Condition:</span>
                      <span className="capitalize">{car.condition}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trends</CardTitle>
                <CardDescription>Track your sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium text-green-600">+15% increase</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Sale Price</span>
                    <span className="font-medium">{formatPrice(45000)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-medium">12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Models</CardTitle>
                <CardDescription>Most viewed cars in your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">BMW 3 Series</span>
                    <span className="text-sm text-muted-foreground">234 views</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mercedes C-Class</span>
                    <span className="text-sm text-muted-foreground">189 views</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Audi A4</span>
                    <span className="text-sm text-muted-foreground">156 views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="space-y-4">
            {dealerReviews.length > 0 ? (
              dealerReviews.map((review: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <CardDescription className="mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{review.comment || "No comment provided"}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No reviews yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}