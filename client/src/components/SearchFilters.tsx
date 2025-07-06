import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
  initialFilters?: any;
}

export default function SearchFilters({ onSearch, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    bodyType: initialFilters.bodyType || "all",
    fuelType: initialFilters.fuelType || "all",
    minYear: initialFilters.minYear || 2018,
    maxYear: initialFilters.maxYear || 2024,
    transmission: initialFilters.transmission || "all",
    priceRange: initialFilters.priceRange || [5000, 100000],
    mileageRange: initialFilters.mileageRange || [0, 100000],
    certifiedOnly: initialFilters.certifiedOnly || false,
    singleOwner: initialFilters.singleOwner || false,
    noAccidents: initialFilters.noAccidents || false,
    warrantyIncluded: initialFilters.warrantyIncluded || false,
  });

  const handleSearch = () => {
    const searchParams = {
      ...filters,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      maxMileage: filters.mileageRange[1],
    };
    onSearch(searchParams);
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Body Type</Label>
            <Select value={filters.bodyType} onValueChange={(value) => updateFilter("bodyType", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="convertible">Convertible</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="coupe">Coupe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</Label>
            <Select value={filters.fuelType} onValueChange={(value) => updateFilter("fuelType", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Fuels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuels</SelectItem>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Year Range</Label>
            <div className="flex space-x-2">
              <Select value={filters.minYear.toString()} onValueChange={(value) => updateFilter("minYear", parseInt(value))}>
                <SelectTrigger className="w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => 2018 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.maxYear.toString()} onValueChange={(value) => updateFilter("maxYear", parseInt(value))}>
                <SelectTrigger className="w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => 2018 + i).reverse().map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">Transmission</Label>
            <Select value={filters.transmission} onValueChange={(value) => updateFilter("transmission", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="cvt">CVT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              min={5000}
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>$5,000</span>
              <span>$100,000</span>
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Mileage Range: 0 - {filters.mileageRange[1].toLocaleString()} miles
            </Label>
            <Slider
              value={filters.mileageRange}
              onValueChange={(value) => updateFilter("mileageRange", value)}
              min={0}
              max={100000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>0 miles</span>
              <span>100,000+ miles</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="certified"
              checked={filters.certifiedOnly}
              onCheckedChange={(checked) => updateFilter("certifiedOnly", checked)}
            />
            <Label htmlFor="certified" className="text-sm text-gray-700">Certified Pre-Owned</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="singleOwner"
              checked={filters.singleOwner}
              onCheckedChange={(checked) => updateFilter("singleOwner", checked)}
            />
            <Label htmlFor="singleOwner" className="text-sm text-gray-700">Single Owner</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="noAccidents"
              checked={filters.noAccidents}
              onCheckedChange={(checked) => updateFilter("noAccidents", checked)}
            />
            <Label htmlFor="noAccidents" className="text-sm text-gray-700">No Accidents</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="warranty"
              checked={filters.warrantyIncluded}
              onCheckedChange={(checked) => updateFilter("warrantyIncluded", checked)}
            />
            <Label htmlFor="warranty" className="text-sm text-gray-700">Warranty Included</Label>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSearch}
            className="bg-carstore-orange text-white px-8 py-3 rounded-lg hover:bg-carstore-orange-dark transition-colors font-medium"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Cars
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
