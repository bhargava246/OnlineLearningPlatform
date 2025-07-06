import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Car as CarIcon,
  Shield,
  Clock,
  MessageSquare,
  Heart
} from "lucide-react";
import { formatPrice, formatMileage, capitalizeFirst } from "@/lib/utils";
import type { Car as CarType, Dealer, Review } from "@shared/schema";

export default function DealerProfile() {
  const [, params] = useRoute("/dealers/:id");
  const dealerId = params?.id || null;

  const { data: dealer, isLoading: dealerLoading } = useQuery<Dealer>({
    queryKey: [`/api/dealers/${dealerId}`],
    enabled: !!dealerId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: dealerCars = [], isLoading: carsLoading } = useQuery<CarType[]>({
    queryKey: [`/api/dealers/${dealerId}/cars`],
    enabled: !!dealerId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: dealerReviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/reviews/dealer/${dealerId}`],
    enabled: !!dealerId,
    refetchInterval: 15000, // Refresh every 15 seconds for reviews
  });

  if (dealerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-200 h-48 rounded-lg mb-4" />
              </div>
              <div className="bg-gray-200 h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dealer Not Found</h2>
          <p className="text-gray-600">The dealer profile you're looking for doesn't exist.</p>
          <Link href="/dealers">
            <Button className="mt-4">Back to Dealers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = dealerReviews.length > 0 
    ? dealerReviews.reduce((sum, review) => sum + review.rating, 0) / dealerReviews.length 
    : parseFloat(dealer.rating);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-carstore-orange rounded-lg flex items-center justify-center">
                  <CarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{dealer.name}</h1>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-gray-600">{dealer.location}</span>
                    </div>
                    {dealer.verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-900">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="ml-1 text-sm text-gray-600">
                        ({dealerReviews.length} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {dealer.phone && (
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`tel:${dealer.phone}`, '_self')}
                    className="hover:bg-gray-50"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {dealer.phone}
                  </Button>
                )}
                {dealer.email && (
                  <Button 
                    className="bg-carstore-orange hover:bg-carstore-orange-dark"
                    onClick={() => window.open(`mailto:${dealer.email}`, '_self')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {dealer.email}
                  </Button>
                )}
              </div>
            </div>
            
            {dealer.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-600">{dealer.description}</p>
              </div>
            )}
            
            {/* Contact Information */}
            {(dealer.phone || dealer.email || dealer.address) && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {dealer.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">{dealer.phone}</span>
                    </div>
                  )}
                  {dealer.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{dealer.email}</span>
                    </div>
                  )}
                  {dealer.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{dealer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CarIcon className="h-8 w-8 text-carstore-orange" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Cars</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dealerCars.filter(car => car.available).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{dealerReviews.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {dealerCars.length === 0 ? (
              <div className="text-center py-12">
                <CarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles available</h3>
                <p className="text-gray-600">This dealer currently has no cars in their inventory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dealerCars.slice(0, 6).map((car) => (
                  <div key={car._id} className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <CarIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {car.mileage.toLocaleString()} miles
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-carstore-orange">
                        ${parseFloat(car.price).toLocaleString()}
                      </span>
                      <Badge variant={car.available ? "default" : "secondary"}>
                        {car.available ? "Available" : "Sold"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {dealerReviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">Be the first to leave a review for this dealer.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {dealerReviews.slice(0, 5).map((review) => (
                  <div key={review._id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={`${review._id}-star-${i}`}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          Customer Review
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}