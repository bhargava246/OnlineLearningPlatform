import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, Share2, MessageCircle, MapPin, Calendar, Gauge, Fuel, Settings, Shield, Phone, Mail } from "lucide-react";
import { formatPrice, formatMileage, capitalizeFirst } from "@/lib/utils";
import { initiatePhoneCall, initiateEmail, formatPhoneNumber } from "@/lib/contact";
import FinanceCalculator from "@/components/FinanceCalculator";
import type { Car, Dealer } from "@shared/schema";

export default function CarDetail() {
  const [, params] = useRoute("/cars/:id");
  const carId = params?.id || null;

  const { data: car, isLoading: carLoading } = useQuery<Car>({
    queryKey: [`/api/cars/${carId}`],
    enabled: !!carId,
  });

  const { data: dealer } = useQuery<Dealer>({
    queryKey: [`/api/dealers/${car?.dealerId}`],
    enabled: !!car?.dealerId,
  });

  if (carLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-200 h-48 rounded-lg mb-4" />
                <div className="bg-gray-200 h-32 rounded-lg" />
              </div>
              <div className="bg-gray-200 h-64 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Car Not Found</h1>
          <p className="text-gray-600">The car you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-600">
            Home / Cars / {car.year} {car.make} {car.model}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Image Gallery */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="relative">
              <img 
                src={car.imageUrls?.[0] || "/placeholder-car.jpg"} 
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-96 object-cover rounded-t-lg" 
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button variant="secondary" size="icon" className="bg-white/80 hover:bg-white">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="bg-white/80 hover:bg-white">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              {car.imageUrls && car.imageUrls.length > 1 && (
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/50 text-white">
                    1 of {car.imageUrls.length} photos
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Title and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {car.year} {car.make} {car.model}
                    </h1>
                    <p className="text-gray-600">
                      {capitalizeFirst(car.bodyType)} • {formatMileage(car.mileage)} miles • {capitalizeFirst(car.transmission)} • {car.drivetrain.toUpperCase()}
                    </p>
                  </div>
                  <Badge className={
                    car.condition === "new" ? "bg-purple-100 text-purple-800" :
                    car.condition === "certified" ? "bg-green-100 text-green-800" :
                    "bg-blue-100 text-blue-800"
                  }>
                    {capitalizeFirst(car.condition)}
                  </Badge>
                </div>

                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < (car.safetyRating || 0) ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 ml-2">
                    {car.safetyRating}/5 Safety Rating
                  </span>
                </div>

                <div className="text-3xl font-bold text-carstore-orange mb-4">
                  {formatPrice(car.price)}
                </div>

                <div className="flex space-x-4">
                  <Button className="bg-carstore-orange text-white hover:bg-carstore-orange-dark flex-1">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Dealer
                  </Button>
                  <Button variant="outline" className="border-carstore-orange text-carstore-orange hover:bg-carstore-orange hover:text-white">
                    Schedule Test Drive
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-carstore-orange" />
                    <div>
                      <p className="text-sm font-medium">{car.year}</p>
                      <p className="text-xs text-gray-600">Year</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-5 w-5 text-carstore-orange" />
                    <div>
                      <p className="text-sm font-medium">{formatMileage(car.mileage)}</p>
                      <p className="text-xs text-gray-600">Miles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Fuel className="h-5 w-5 text-carstore-orange" />
                    <div>
                      <p className="text-sm font-medium">{capitalizeFirst(car.fuelType)}</p>
                      <p className="text-xs text-gray-600">Fuel Type</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-carstore-orange" />
                    <div>
                      <p className="text-sm font-medium">{capitalizeFirst(car.transmission)}</p>
                      <p className="text-xs text-gray-600">Transmission</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Make</span>
                      <span className="font-medium">{car.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model</span>
                      <span className="font-medium">{car.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year</span>
                      <span className="font-medium">{car.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Body Type</span>
                      <span className="font-medium">{capitalizeFirst(car.bodyType)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine</span>
                      <span className="font-medium">{car.engine}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horsepower</span>
                      <span className="font-medium">{car.horsepower} hp</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Economy</span>
                      <span className="font-medium">{car.mpgCity}/{car.mpgHighway} mpg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Drivetrain</span>
                      <span className="font-medium">{car.drivetrain.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color</span>
                      <span className="font-medium">{car.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIN</span>
                      <span className="font-medium text-sm">{car.vin || "Available upon request"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-carstore-orange rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {car.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{car.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dealer Info */}
            {dealer && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dealer Information</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <img 
                      src={dealer.imageUrl || "/placeholder-dealer.jpg"} 
                      alt={dealer.name}
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    <div>
                      <h4 className="font-medium">{dealer.name}</h4>
                      <p className="text-sm text-gray-600">{dealer.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(parseFloat(dealer.rating || "0")) ? "fill-current" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {dealer.rating} ({dealer.reviewCount} reviews)
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{dealer.address || dealer.location}</span>
                    </div>
                    {dealer.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{formatPhoneNumber(dealer.phone)}</span>
                      </div>
                    )}
                    {dealer.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{dealer.email}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    {dealer.phone && (
                      <Button 
                        className="w-full bg-carstore-orange text-white hover:bg-carstore-orange-dark"
                        onClick={() => initiatePhoneCall(dealer.phone!)}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Call {dealer.name}
                      </Button>
                    )}
                    {dealer.email && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => initiateEmail(
                          dealer.email!, 
                          `Inquiry about ${car.year} ${car.make} ${car.model}`,
                          `Hi ${dealer.name},\n\nI'm interested in learning more about the ${car.year} ${car.make} ${car.model} listed for ${formatPrice(car.price)}.\n\nPlease contact me at your earliest convenience.\n\nThank you!`
                        )}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email Dealer
                      </Button>
                    )}
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      View All Inventory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financing Calculator */}
            <FinanceCalculator carPrice={car.price} />

            {/* Safety Features */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-carstore-orange" />
                  <h3 className="text-lg font-semibold text-gray-900">Safety Rating</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-carstore-orange mb-2">
                    {car.safetyRating}/5
                  </div>
                  <div className="flex justify-center text-yellow-400 mb-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < (car.safetyRating || 0) ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Overall Safety Rating</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
