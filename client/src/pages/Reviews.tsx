import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Filter, User } from "lucide-react";
import type { Review, Dealer } from "@shared/schema";

export default function Reviews() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dealers } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  const filteredDealers = dealers?.filter(dealer =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.location.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dealer Reviews</h1>
          <p className="text-xl text-gray-600">
            Read authentic reviews from customers about their dealer experiences.
          </p>
        </div>

        {/* Search */}
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
            </div>
          </CardContent>
        </Card>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDealers.map((dealer) => (
            <Card key={dealer._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dealer.name}</CardTitle>
                  {dealer.verified && (
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{dealer.location}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Rating */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-1">
                        {renderStars(parseFloat(dealer.rating || "0"))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {dealer.rating} out of 5 ({dealer.reviewCount} reviews)
                      </p>
                    </div>
                  </div>

                  {/* Sample Reviews */}
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">Sarah M.</span>
                        <div className="flex">{renderStars(5)}</div>
                      </div>
                      <p className="text-sm text-gray-700">
                        "Excellent service and very transparent about pricing. 
                        Highly recommend for anyone looking for a quality vehicle."
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">Mike R.</span>
                        <div className="flex">{renderStars(4)}</div>
                      </div>
                      <p className="text-sm text-gray-700">
                        "Great selection of cars and helpful staff. 
                        The buying process was smooth and efficient."
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View All Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDealers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No dealers found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}