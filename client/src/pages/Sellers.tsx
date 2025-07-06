import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Mail, MessageCircle, Car } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { Dealer } from "@shared/schema";

export default function Sellers() {
  const { user } = useAuth();
  
  const { data: dealers, isLoading } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view sellers</h2>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-48 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = (dealerId: string, dealerName: string) => {
    // For now, we'll show an alert. Later, we can implement a proper messaging system
    alert(`Messaging feature coming soon! You can contact ${dealerName} directly.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Car Dealers & Sellers</h1>
          <p className="text-gray-600">
            Browse our verified dealers and connect with sellers
          </p>
        </div>

        {dealers && dealers.length === 0 ? (
          <div className="text-center py-16">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No dealers found</h2>
            <p className="text-gray-600 mb-6">Check back later for available dealers!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealers?.map((dealer) => (
              <Link key={dealer._id} href={`/dealers/${dealer._id}`}>
                <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                          {dealer.name}
                        </CardTitle>
                        {dealer.verified && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Verified Dealer
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-900">
                          {dealer.rating}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">
                          ({dealer.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {dealer.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {dealer.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{dealer.location}</span>
                      </div>
                      
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
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          // Let the Link handle navigation - don't prevent it
                          e.stopPropagation();
                        }}
                      >
                        View Profile
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSendMessage(dealer._id || '', dealer.name);
                        }}
                        className="flex-1 bg-carstore-orange text-white hover:bg-carstore-orange-dark"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}