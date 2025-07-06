import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { formatPrice, capitalizeFirst } from "@/lib/utils";
import type { Car } from "@shared/schema";

export default function Compare() {
  const [selectedCars, setSelectedCars] = useState<number[]>([]);
  
  const { data: allCars } = useQuery<Car[]>({
    queryKey: ["/api/cars"],
  });

  const { data: car1 } = useQuery<Car>({
    queryKey: [`/api/cars/${selectedCars[0]}`],
    enabled: !!selectedCars[0],
  });

  const { data: car2 } = useQuery<Car>({
    queryKey: [`/api/cars/${selectedCars[1]}`],
    enabled: !!selectedCars[1],
  });

  const { data: car3 } = useQuery<Car>({
    queryKey: [`/api/cars/${selectedCars[2]}`],
    enabled: !!selectedCars[2],
  });

  const comparisonCars = [car1, car2, car3].filter(Boolean);

  const addCarToComparison = (carId: number) => {
    if (selectedCars.length < 3 && !selectedCars.includes(carId)) {
      setSelectedCars([...selectedCars, carId]);
    }
  };

  const removeCarFromComparison = (index: number) => {
    const newSelectedCars = [...selectedCars];
    newSelectedCars.splice(index, 1);
    setSelectedCars(newSelectedCars);
  };

  const comparisonRows = [
    { label: "Price", getValue: (car: Car) => formatPrice(car.price) },
    { label: "Year", getValue: (car: Car) => car.year.toString() },
    { label: "Make", getValue: (car: Car) => car.make },
    { label: "Model", getValue: (car: Car) => car.model },
    { label: "Body Type", getValue: (car: Car) => capitalizeFirst(car.bodyType) },
    { label: "Engine", getValue: (car: Car) => car.engine || "N/A" },
    { label: "Horsepower", getValue: (car: Car) => car.horsepower ? `${car.horsepower} hp` : "N/A" },
    { label: "Fuel Type", getValue: (car: Car) => capitalizeFirst(car.fuelType) },
    { label: "Transmission", getValue: (car: Car) => capitalizeFirst(car.transmission) },
    { label: "Drivetrain", getValue: (car: Car) => car.drivetrain.toUpperCase() },
    { label: "MPG City", getValue: (car: Car) => car.mpgCity ? `${car.mpgCity} mpg` : "N/A" },
    { label: "MPG Highway", getValue: (car: Car) => car.mpgHighway ? `${car.mpgHighway} mpg` : "N/A" },
    { label: "Mileage", getValue: (car: Car) => `${car.mileage.toLocaleString()} miles` },
    { label: "Safety Rating", getValue: (car: Car) => car.safetyRating ? `${car.safetyRating}/5 stars` : "N/A" },
    { label: "Color", getValue: (car: Car) => car.color || "N/A" },
    { label: "Condition", getValue: (car: Car) => capitalizeFirst(car.condition) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Cars Side by Side</h1>
          <p className="text-gray-600 text-lg">Make informed decisions with our detailed comparison tool</p>
        </div>

        {/* Car Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Cars to Compare</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index}>
                  {selectedCars[index] ? (
                    <div className="relative">
                      <Select
                        value={selectedCars[index]?.toString() || ""}
                        onValueChange={(value) => {
                          const newSelectedCars = [...selectedCars];
                          newSelectedCars[index] = parseInt(value);
                          setSelectedCars(newSelectedCars);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select Car ${index + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {allCars?.filter(car => !selectedCars.includes(car.id) || car.id === selectedCars[index]).map((car) => (
                            <SelectItem key={car.id} value={car.id.toString()}>
                              {car.year} {car.make} {car.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600"
                        onClick={() => removeCarFromComparison(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(value) => addCarToComparison(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select Car ${index + 1}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {allCars?.filter(car => !selectedCars.includes(car.id)).map((car) => (
                          <SelectItem key={car.id} value={car.id.toString()}>
                            {car.year} {car.make} {car.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {comparisonCars.length > 0 && (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 bg-gray-50 font-medium text-gray-900">Feature</th>
                    {comparisonCars.map((car, index) => (
                      <th key={index} className="p-4 bg-gray-50">
                        <div className="text-center">
                          <img
                            src={car.imageUrls?.[0] || "/placeholder-car.jpg"}
                            alt={`${car.year} ${car.make} ${car.model}`}
                            className="w-24 h-16 object-cover rounded-lg mx-auto mb-2"
                          />
                          <div className="font-semibold text-gray-900">
                            {car.year} {car.make} {car.model}
                          </div>
                          <div className="text-carstore-orange font-bold">
                            {formatPrice(car.price)}
                          </div>
                        </div>
                      </th>
                    ))}
                    {comparisonCars.length < 3 && (
                      <th className="p-4 bg-gray-50">
                        <div className="text-center">
                          <div className="w-24 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                            <Plus className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500">Add Another Car</div>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{row.label}</td>
                      {comparisonCars.map((car, carIndex) => (
                        <td key={carIndex} className="p-4 text-center">
                          {row.getValue(car)}
                        </td>
                      ))}
                      {comparisonCars.length < 3 && (
                        <td className="p-4 text-center text-gray-400">-</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {comparisonCars.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cars Selected</h3>
              <p className="text-gray-600 mb-4">
                Select cars from the dropdown above to start comparing their features and specifications.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {comparisonCars.length > 0 && (
          <div className="mt-8 text-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setSelectedCars([])}
            >
              Clear All
            </Button>
            <Button className="bg-carstore-orange text-white hover:bg-carstore-orange-dark">
              Save Comparison
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
