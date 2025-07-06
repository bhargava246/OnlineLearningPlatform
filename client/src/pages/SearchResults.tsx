import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import CarCard from "@/components/CarCard";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Grid, List } from "lucide-react";
import type { Car } from "@shared/schema";

export default function SearchResults() {
  const [location] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("price-asc");

  // Parse URL parameters
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const initialFilters = {
    make: urlParams.get("make") || "",
    model: urlParams.get("model") || "",
    minPrice: urlParams.get("minPrice") ? parseInt(urlParams.get("minPrice")!) : undefined,
    maxPrice: urlParams.get("maxPrice") ? parseInt(urlParams.get("maxPrice")!) : undefined,
    minYear: urlParams.get("minYear") ? parseInt(urlParams.get("minYear")!) : undefined,
    maxYear: urlParams.get("maxYear") ? parseInt(urlParams.get("maxYear")!) : undefined,
    fuelType: urlParams.get("fuelType") || "",
    transmission: urlParams.get("transmission") || "",
    bodyType: urlParams.get("bodyType") || "",
    maxMileage: urlParams.get("maxMileage") ? parseInt(urlParams.get("maxMileage")!) : undefined,
  };

  // Build query string for API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    Object.entries(initialFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, value.toString());
      }
    });
    return params.toString();
  };

  const { data: cars, isLoading } = useQuery<Car[]>({
    queryKey: [`/api/cars/search?${buildQueryString()}`],
  });

  const handleNewSearch = (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "" && value !== false && value !== "all") {
        if (Array.isArray(value)) {
          if (key === "priceRange") {
            params.set("minPrice", value[0].toString());
            params.set("maxPrice", value[1].toString());
          } else if (key === "mileageRange") {
            params.set("maxMileage", value[1].toString());
          }
        } else {
          if (key !== "priceRange" && key !== "mileageRange") {
            params.set(key, value.toString());
          }
        }
      }
    });
    
    // Use wouter navigation instead of window.location
    window.history.pushState({}, '', `/search?${params.toString()}`);
    window.location.reload();
  };

  const sortedCars = cars ? [...cars].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "year-desc":
        return b.year - a.year;
      case "year-asc":
        return a.year - b.year;
      case "mileage-asc":
        return a.mileage - b.mileage;
      case "mileage-desc":
        return b.mileage - a.mileage;
      default:
        return 0;
    }
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
            <p className="text-gray-600 mt-1">
              {isLoading ? "Searching..." : `${sortedCars.length} cars found`}
            </p>
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
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="year-desc">Year: Newest First</SelectItem>
                <SelectItem value="year-asc">Year: Oldest First</SelectItem>
                <SelectItem value="mileage-asc">Mileage: Low to High</SelectItem>
                <SelectItem value="mileage-desc">Mileage: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} lg:block lg:w-80 flex-shrink-0`}>
            <div className="sticky top-8">
              <SearchFilters 
                onSearch={handleNewSearch} 
                initialFilters={initialFilters}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : sortedCars.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria to find more vehicles.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = "/search"}
                  >
                    Reset Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {sortedCars.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>
            )}

            {/* Pagination placeholder */}
            {sortedCars.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline">
                  Load More Cars
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
