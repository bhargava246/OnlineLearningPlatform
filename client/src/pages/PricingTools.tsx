import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import type { Car } from "@shared/schema";

export default function PricingTools() {
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [mileage, setMileage] = useState([50000]);
  const [condition, setCondition] = useState("good");
  const [marketPosition, setMarketPosition] = useState("competitive");

  // Mock current dealer
  const currentDealer = { id: 1, name: "Premium Auto Group" };

  const { data: cars = [] } = useQuery<Car[]>({
    queryKey: ['/api/cars'],
  });

  // Filter cars for current dealer
  const dealerCars = cars.filter(car => car.dealerId === currentDealer.id);

  const selectedCarData = dealerCars.find(car => car.id.toString() === selectedCar);

  // Calculate suggested pricing based on various factors
  const calculatePricing = () => {
    if (!selectedCarData) return null;

    const basePrice = parseFloat(selectedCarData.price);
    let adjustedPrice = basePrice;

    // Mileage adjustment
    const avgMileageForYear = (2024 - selectedCarData.year) * 12000;
    const mileageDiff = mileage[0] - avgMileageForYear;
    const mileageAdjustment = (mileageDiff / 1000) * -50; // -$50 per 1000 miles over average

    // Condition adjustment
    const conditionMultipliers = {
      excellent: 1.1,
      good: 1.0,
      fair: 0.9,
      poor: 0.8
    };
    
    // Market position adjustment
    const positionMultipliers = {
      premium: 1.15,
      competitive: 1.0,
      value: 0.9
    };

    adjustedPrice = basePrice * conditionMultipliers[condition as keyof typeof conditionMultipliers];
    adjustedPrice += mileageAdjustment;
    adjustedPrice *= positionMultipliers[marketPosition as keyof typeof positionMultipliers];

    const marketRange = {
      low: adjustedPrice * 0.95,
      suggested: adjustedPrice,
      high: adjustedPrice * 1.1
    };

    return {
      current: basePrice,
      suggested: Math.round(adjustedPrice),
      range: {
        low: Math.round(marketRange.low),
        high: Math.round(marketRange.high)
      },
      adjustments: {
        mileage: Math.round(mileageAdjustment),
        condition: Math.round(basePrice * (conditionMultipliers[condition as keyof typeof conditionMultipliers] - 1)),
        position: Math.round(basePrice * (positionMultipliers[marketPosition as keyof typeof positionMultipliers] - 1))
      }
    };
  };

  const pricingData = calculatePricing();

  // Mock market comparison data
  const marketComparison = selectedCarData ? [
    {
      source: "Local Market Average",
      price: Math.round(parseFloat(selectedCarData.price) * (0.95 + Math.random() * 0.1)),
      difference: 0,
      trend: "stable"
    },
    {
      source: "Regional Average",
      price: Math.round(parseFloat(selectedCarData.price) * (0.93 + Math.random() * 0.14)),
      difference: 0,
      trend: "up"
    },
    {
      source: "National Average",
      price: Math.round(parseFloat(selectedCarData.price) * (0.92 + Math.random() * 0.16)),
      difference: 0,
      trend: "down"
    }
  ].map(item => ({
    ...item,
    difference: item.price - parseFloat(selectedCarData.price)
  })) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Tools</h1>
          <p className="text-gray-600 mt-2">Optimize your pricing strategy with market intelligence</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pricing Calculator */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Pricing Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Car Selection */}
                <div>
                  <Label htmlFor="car-select">Select Vehicle</Label>
                  <Select value={selectedCar} onValueChange={setSelectedCar}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a car from your inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealerCars.map((car) => (
                        <SelectItem key={car.id} value={car.id.toString()}>
                          {car.year} {car.make} {car.model} - ${car.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCarData && (
                  <>
                    {/* Mileage */}
                    <div>
                      <Label>Mileage: {mileage[0].toLocaleString()} miles</Label>
                      <div className="mt-2">
                        <Slider
                          value={mileage}
                          onValueChange={setMileage}
                          max={200000}
                          min={0}
                          step={1000}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <Label>Vehicle Condition</Label>
                      <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Market Position */}
                    <div>
                      <Label>Pricing Strategy</Label>
                      <Select value={marketPosition} onValueChange={setMarketPosition}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium">Premium Pricing (+15%)</SelectItem>
                          <SelectItem value="competitive">Competitive Pricing</SelectItem>
                          <SelectItem value="value">Value Pricing (-10%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pricing Results */}
            {pricingData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Pricing Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Minimum</p>
                      <p className="text-2xl font-bold text-red-900">${pricingData.range.low.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <p className="text-sm text-green-600 font-medium">Recommended</p>
                      <p className="text-3xl font-bold text-green-900">${pricingData.suggested.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Maximum</p>
                      <p className="text-2xl font-bold text-blue-900">${pricingData.range.high.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Price Adjustments */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Price Adjustments</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Base Price</span>
                        <span className="font-medium">${pricingData.current.toLocaleString()}</span>
                      </div>
                      {pricingData.adjustments.mileage !== 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Mileage Adjustment</span>
                          <span className={`font-medium ${pricingData.adjustments.mileage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {pricingData.adjustments.mileage > 0 ? '+' : ''}${pricingData.adjustments.mileage.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {pricingData.adjustments.condition !== 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Condition Adjustment</span>
                          <span className={`font-medium ${pricingData.adjustments.condition > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {pricingData.adjustments.condition > 0 ? '+' : ''}${pricingData.adjustments.condition.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {pricingData.adjustments.position !== 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Strategy Adjustment</span>
                          <span className={`font-medium ${pricingData.adjustments.position > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {pricingData.adjustments.position > 0 ? '+' : ''}${pricingData.adjustments.position.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button className="w-full bg-carstore-orange hover:bg-carstore-orange-dark">
                      Apply Recommended Price
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Market Analysis */}
          <div className="space-y-6">
            {/* Market Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Market Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCarData ? (
                  <div className="space-y-4">
                    {marketComparison.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.source}</p>
                          <p className="text-lg font-bold">${item.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={item.difference > 0 ? "default" : item.difference < 0 ? "destructive" : "secondary"}
                          >
                            {item.difference > 0 ? '+' : ''}${item.difference.toLocaleString()}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{item.trend}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Select a vehicle to see market comparison</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Bulk Price Update
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Market Trend Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Competitive Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Pricing Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p className="text-sm text-gray-600">Price competitively within 5% of market average</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-600">Consider seasonal demand patterns</p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                  <p className="text-sm text-gray-600">Update prices weekly for optimal performance</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}