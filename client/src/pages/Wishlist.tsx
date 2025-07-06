import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Heart, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { formatPrice, formatMileage, capitalizeFirst } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Car, FavoriteCar } from "@shared/schema";

export default function Wishlist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please login to view your wishlist</h2>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userId = user._id;

  const { data: favorites, isLoading } = useQuery<FavoriteCar[]>({
    queryKey: [`/api/favorites/${userId}`],
  });

  const { data: cars } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (carId: string) => {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      return await fetch(`/api/favorites/${userId}/${carId}`, {
        method: "DELETE",
        headers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${userId}`] });
      toast({
        title: "Success",
        description: "Car removed from wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove car from wishlist",
        variant: "destructive",
      });
    },
  });

  const wishlistCars = favorites
    ?.map(fav => cars?.find(car => car._id === fav.carId))
    .filter((car): car is Car => car !== undefined) || [];

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistCars.length} car{wishlistCars.length !== 1 ? 's' : ''} saved
          </p>
        </div>

        {wishlistCars.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding cars you love to keep track of them!</p>
            <Link href="/search">
              <Button className="bg-carstore-orange text-white hover:bg-carstore-orange-dark">
                Browse Cars
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistCars.map((car) => (
              <Card key={car._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={car.imageUrls?.[0] || "/placeholder-car.jpg"} 
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-48 object-cover" 
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => car._id && removeFromWishlistMutation.mutate(car._id)}
                    disabled={removeFromWishlistMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {car.year} {car.make} {car.model}
                    </h3>
                    <Badge className={
                      car.condition === "new" ? "bg-purple-100 text-purple-800" :
                      car.condition === "certified" ? "bg-green-100 text-green-800" :
                      "bg-blue-100 text-blue-800"
                    }>
                      {capitalizeFirst(car.condition)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {capitalizeFirst(car.bodyType)} • {formatMileage(car.mileage)} miles • {capitalizeFirst(car.transmission)} • {car.drivetrain.toUpperCase()}
                  </p>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (car.safetyRating || 0) ? "fill-current" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm ml-2">
                      {car.safetyRating || 0} (Safety Rating)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-carstore-orange">
                      {formatPrice(car.price)}
                    </span>
                    <Link href={`/cars/${car._id}`}>
                      <Button className="bg-carstore-orange text-white hover:bg-carstore-orange-dark transition-colors">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}