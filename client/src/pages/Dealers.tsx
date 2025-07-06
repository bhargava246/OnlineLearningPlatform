import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Phone, Mail, Car, Search, Filter } from "lucide-react";
import { initiatePhoneCall, initiateEmail, formatPhoneNumber } from "@/lib/contact";
import type { Dealer } from "@shared/schema";

export default function Dealers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating-desc");
  const [showFilters, setShowFilters] = useState(false);

  const { data: dealers, isLoading } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  // Filter dealers based on search term and location
  const filteredDealers = dealers?.filter(dealer => {
    const matchesSearch = dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dealer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || locationFilter === "all" || dealer.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  }) || [];

  // Sort dealers
  const sortedDealers = [...filteredDealers].sort((a, b) => {
    switch (sortBy) {
      case "rating-desc":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case "rating-asc":
        return parseFloat(a.rating || "0") - parseFloat(b.rating || "0");
      case "reviews-desc":
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Get unique locations for filter
  const uniqueLocations = [...new Set(dealers?.map(dealer => dealer.location.split(",")[1]?.trim() || dealer.location) || [])];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trusted Dealers</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified dealers across the country. All our dealers are thoroughly vetted 
            and have excellent customer service records.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search dealers by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                
                <div className={`${showFilters ? "flex" : "hidden"} lg:flex items-center space-x-4`}>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating-desc">Highest Rated</SelectItem>
                      <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                      <SelectItem value="reviews-desc">Most Reviews</SelectItem>
                      <SelectItem value="name-asc">Name A-Z</SelectItem>
                      <SelectItem value="name-desc">Name Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {isLoading ? "Loading dealers..." : `${sortedDealers.length} dealers found`}
          </p>
        </div>

        {/* Dealers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : sortedDealers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No dealers found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all dealers.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedDealers.map((dealer) => (
              <Card key={dealer.id} className="hover:shadow-xl transition-shadow duration-300 group">
                <CardContent className="p-6">
                  {/* Dealer Image */}
                  <div className="relative mb-4">
                    <img 
                      src={dealer.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
                      alt={dealer.name}
                      className="w-full h-32 object-cover rounded-lg" 
                    />
                    {dealer.verified && (
                      <Badge className="absolute top-2 right-2 bg-carstore-orange text-white">
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Dealer Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-carstore-orange transition-colors">
                      {dealer.name}
                    </h3>
                    <div className="flex items-center justify-center text-gray-600 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {dealer.location}
                    </div>
                    
                    {/* Rating */}
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
                        {dealer.rating} ({dealer.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Description */}
                    {dealer.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {dealer.description}
                      </p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    {dealer.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-carstore-orange" />
                        <span>{formatPhoneNumber(dealer.phone)}</span>
                      </div>
                    )}
                    {dealer.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-carstore-orange" />
                        <span className="truncate">{dealer.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link href={`/dealers/${dealer.id}/inventory`} className="block">
                      <Button className="w-full bg-carstore-orange text-white hover:bg-carstore-orange-dark transition-colors">
                        <Car className="mr-2 h-4 w-4" />
                        View Inventory
                      </Button>
                    </Link>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {dealer.phone && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => initiatePhoneCall(dealer.phone!)}
                        >
                          <Phone className="mr-1 h-3 w-3" />
                          Call
                        </Button>
                      )}
                      {dealer.email && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => initiateEmail(
                            dealer.email!, 
                            `Inquiry about ${dealer.name}`,
                            `Hi ${dealer.name},\n\nI'm interested in learning more about your vehicle inventory.\n\nPlease contact me at your earliest convenience.\n\nThank you!`
                          )}
                        >
                          <Mail className="mr-1 h-3 w-3" />
                          Email
                        </Button>
                      )}
                      {(!dealer.phone && !dealer.email) && (
                        <Button variant="outline" size="sm" className="text-xs col-span-2">
                          Contact Info Not Available
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {sortedDealers.length > 0 && sortedDealers.length >= 12 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="px-8">
              Load More Dealers
            </Button>
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-carstore-orange mb-2">
                {dealers?.length || 0}
              </div>
              <p className="text-gray-600">Verified Dealers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-carstore-orange mb-2">
                {dealers?.reduce((sum, dealer) => sum + (dealer.reviewCount || 0), 0) || 0}
              </div>
              <p className="text-gray-600">Customer Reviews</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-carstore-orange mb-2">
                {uniqueLocations.length}
              </div>
              <p className="text-gray-600">Cities Covered</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-carstore-orange to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Become a Verified Dealer</h3>
            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
              Join our network of trusted dealers and reach thousands of potential customers. 
              Get verified today and start selling your inventory on CarStore.
            </p>
            <Button variant="secondary" className="bg-white text-carstore-orange hover:bg-gray-100">
              Apply to Become a Dealer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
