import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car as CarIcon, 
  Users, 
  Eye,
  Calendar,
  Download,
  BarChart3,
  PieChart
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import type { Car as CarType, Dealer } from "@shared/schema";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("sales");

  // Mock current dealer (in real app, get from auth context)
  const currentDealer = { id: 1, name: "Premium Auto Group" };

  const { data: cars = [] } = useQuery<CarType[]>({
    queryKey: ['/api/cars'],
  });

  const { data: dealers = [] } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers'],
  });

  // Filter cars for current dealer
  const dealerCars = cars.filter(car => car.dealerId === currentDealer.id);

  // Generate mock analytics data based on actual car inventory
  const generateAnalyticsData = () => {
    const salesData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: Math.floor(Math.random() * 5) + 1,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      views: Math.floor(Math.random() * 100) + 50,
      inquiries: Math.floor(Math.random() * 20) + 5
    }));

    const makeData = dealerCars.reduce((acc, car) => {
      acc[car.make] = (acc[car.make] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(makeData).map(([make, count]) => ({
      name: make,
      value: count,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    }));

    return { salesData, pieData };
  };

  const { salesData, pieData } = generateAnalyticsData();

  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalViews = salesData.reduce((sum, day) => sum + day.views, 0);
  const totalInquiries = salesData.reduce((sum, day) => sum + day.inquiries, 0);

  const avgDailyRevenue = Math.floor(totalRevenue / 30);
  const conversionRate = ((totalSales / totalViews) * 100).toFixed(2);

  const stats = [
    {
      title: "Total Sales",
      value: totalSales.toString(),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign
    },
    {
      title: "Revenue",
      value: `$${(totalRevenue / 1000).toFixed(0)}k`,
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Inventory",
      value: dealerCars.length.toString(),
      change: "-2.1%",
      trend: "down",
      icon: CarIcon
    },
    {
      title: "Avg Daily Views",
      value: Math.floor(totalViews / 30).toString(),
      change: "+15.3%",
      trend: "up",
      icon: Eye
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">{currentDealer.name} • Performance Insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <stat.icon className={`h-6 w-6 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Sales & Revenue Trend
                </CardTitle>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inventory Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Inventory by Make
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Cars */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Cars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dealerCars.slice(0, 5).map((car, index) => (
                  <div key={car.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-carstore-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{car.year} {car.make} {car.model}</p>
                        <p className="text-sm text-gray-600">{Math.floor(Math.random() * 50) + 10} views</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${car.price}</p>
                      <Badge variant="secondary">{Math.floor(Math.random() * 5) + 1} inquiries</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <p className="font-medium text-green-900">Strong Performance</p>
                  <p className="text-sm text-green-700">
                    Your conversion rate of {conversionRate}% is above industry average
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <p className="font-medium text-blue-900">Revenue Growth</p>
                  <p className="text-sm text-blue-700">
                    Average daily revenue of ${avgDailyRevenue.toLocaleString()} shows steady growth
                  </p>
                </div>
                <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                  <p className="font-medium text-orange-900">Inventory Optimization</p>
                  <p className="text-sm text-orange-700">
                    Consider expanding popular makes with high demand
                  </p>
                </div>
                <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                  <p className="font-medium text-purple-900">Market Trend</p>
                  <p className="text-sm text-purple-700">
                    SUVs and electric vehicles showing increased interest
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}