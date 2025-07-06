import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Hero from "@/components/Hero";
import CarCard from "@/components/CarCard";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, TrendingUp, Scale, ArrowRight, Star, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Car, Dealer } from "@shared/schema";

export default function Home() {
  const { data: featuredCars, isLoading: carsLoading } = useQuery<Car[]>({
    queryKey: ["/api/cars/featured"],
  });

  const { data: dealers, isLoading: dealersLoading } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  const handleAdvancedSearch = (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && value !== false) {
        if (Array.isArray(value)) {
          if (key === "priceRange") {
            params.set("minPrice", value[0].toString());
            params.set("maxPrice", value[1].toString());
          } else if (key === "mileageRange") {
            params.set("maxMileage", value[1].toString());
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });
    
    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <div>
      <Hero />
      {/* Featured Cars Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Cars</h2>
            <p className="text-gray-600 text-lg">Handpicked premium vehicles from our trusted dealers</p>
          </div>

          {carsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredCars?.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/search">
              <Button variant="outline" className="border-2 border-carstore-orange text-carstore-orange hover:bg-carstore-orange hover:text-white px-8 py-3">
                View All Cars <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Advanced Search & Filters */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Search</h2>
            <p className="text-gray-600 text-lg">Find exactly what you're looking for with our powerful filters</p>
          </div>

          <SearchFilters onSearch={handleAdvancedSearch} />
        </div>
      </section>
      {/* Tools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Helpful Tools</h2>
            <p className="text-gray-600 text-lg">Everything you need to make the right car buying decision</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-carstore-orange to-orange-600 text-white">
              <CardContent className="p-8 text-center bg-[orange]">
                <Calculator className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Car Price Calculator</h3>
                <p className="text-orange-100 mb-6">Get an instant estimate of your car's value based on market data</p>
                <Button variant="secondary" className="bg-white text-carstore-orange hover:bg-gray-100">
                  Calculate Value
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="p-8 text-center">
                <TrendingUp className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Loan Calculator</h3>
                <p className="text-blue-100 mb-6">Calculate monthly payments and find the best financing options</p>
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Calculate EMI
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
              <CardContent className="p-8 text-center">
                <Scale className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-xl font-semibold mb-4">Compare Cars</h3>
                <p className="text-green-100 mb-6">Side-by-side comparison of features, specs, and pricing</p>
                <Link href="/compare">
                  <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                    Start Comparison
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Trusted Dealers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Dealers</h2>
            <p className="text-gray-600 text-lg">Verified dealers with excellent customer service records</p>
          </div>

          {dealersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {dealers?.slice(0, 4).map((dealer) => (
                <Link key={dealer._id} href={`/dealers/${dealer._id}`}>
                  <Card className="text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                    <CardContent className="p-6">
                      <img 
                        src={dealer.imageUrl || "/placeholder-dealer.jpg"} 
                        alt={dealer.name}
                        className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" 
                      />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{dealer.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{dealer.location}</p>
                      <div className="flex items-center justify-center mb-3">
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
                        <span className="text-gray-600 text-sm ml-2">
                          {dealer.rating} ({dealer.reviewCount})
                        </span>
                      </div>
                      <Badge className="bg-carstore-orange text-white mb-4">
                        {dealer.verified ? "Verified" : "Pending"}
                      </Badge>
                      <p className="text-sm text-gray-600 mb-4">
                        Inventory Available
                      </p>
                      <Button className="w-full bg-carstore-orange text-white hover:bg-carstore-orange-dark">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Car Comparison Tool Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Cars Side by Side</h2>
            <p className="text-gray-600 text-lg">Make informed decisions with our detailed comparison tool</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredCars?.slice(0, 2).map((car, index) => (
                <Card key={car._id} className="shadow-lg">
                  <CardContent className="p-6">
                    <img 
                      src={car.imageUrls?.[0] || "/placeholder-car.jpg"} 
                      alt={`${car.year} ${car.make} ${car.model}`}
                      className="w-full h-40 object-cover rounded-lg mb-4" 
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {car.year} {car.make} {car.model}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price</span>
                        <span className="font-semibold text-carstore-orange">${parseFloat(car.price).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engine</span>
                        <span className="font-medium">{car.engine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">MPG</span>
                        <span className="font-medium">{car.mpgCity}/{car.mpgHighway}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Horsepower</span>
                        <span className="font-medium">{car.horsepower} hp</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Safety Rating</span>
                        <span className="font-medium">{car.safetyRating} Stars</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* VS */}
              <div className="flex items-center justify-center">
                <div className="bg-carstore-orange text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
                  VS
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/compare">
                <Button className="bg-carstore-orange text-white px-8 py-3 hover:bg-carstore-orange-dark">
                  <Scale className="mr-2 h-4 w-4" />
                  Add Another Car to Compare
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="bg-carstore-orange text-white rounded-full w-14 h-14 shadow-lg hover:bg-carstore-orange-dark"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
