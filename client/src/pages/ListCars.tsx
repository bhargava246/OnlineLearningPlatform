import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCarSchema } from "@shared/schema";
import { ZodError } from "zod";
import { 
  Plus, 
  Car, 
  Upload,
  Save,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";
import type { Car as CarType, InsertCar } from "@shared/schema";

export default function ListCars() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertCar>>({
    dealerId: "1", // Mock current dealer
    available: true
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cars = [] } = useQuery<CarType[]>({
    queryKey: ['/api/cars'],
  });

  const createCarMutation = useMutation({
    mutationFn: async (data: InsertCar) => {
      return apiRequest("POST", "/api/cars", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
      toast({
        title: "Success",
        description: "Car listing created successfully!",
      });
      setIsFormOpen(false);
      setFormData({ dealerId: "1", available: true });
      setValidationErrors({});
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create car listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mock current dealer cars
  const currentDealer = { id: "1", name: "Premium Auto Group" };
  const dealerCars = cars.filter(car => car.dealerId === currentDealer.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    try {
      const validatedData = insertCarSchema.parse(formData);
      createCarMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          const fieldNames: Record<string, string> = {
            make: "Make",
            model: "Model", 
            year: "Year",
            price: "Price",
            mileage: "Mileage",
            vin: "VIN",
            fuelType: "Fuel Type",
            transmission: "Transmission",
            bodyType: "Body Type",
            drivetrain: "Drivetrain",
            condition: "Condition",
            dealerId: "Dealer ID"
          };
          
          errors[field] = `${fieldNames[field] || field} is required`;
        });
        setValidationErrors(errors);
        
        const missingFields = Object.values(errors).join(", ");
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Validation Error",
          description: "Please check all fields and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (field: keyof InsertCar, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">List Your Cars</h1>
              <p className="text-gray-600 mt-2">Add and manage your vehicle inventory</p>
            </div>
            <Button 
              onClick={() => setIsFormOpen(true)}
              className="bg-carstore-orange hover:bg-carstore-orange-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Car
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-carstore-orange" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{dealerCars.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dealerCars.filter(car => car.available).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <X className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sold</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dealerCars.filter(car => !car.available).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${Math.round(dealerCars.reduce((sum, car) => sum + parseFloat(car.price), 0) / dealerCars.length || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Car Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add New Car Listing</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {/* Error Summary */}
                {Object.keys(validationErrors).length > 0 && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      Please fix the following errors:
                      <ul className="mt-2 list-disc list-inside">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic Information */}
                    <div>
                      <Label htmlFor="make" className={validationErrors.make ? "text-red-600" : ""}>
                        Make *
                      </Label>
                      <Input
                        id="make"
                        value={formData.make || ''}
                        onChange={(e) => handleInputChange('make', e.target.value)}
                        placeholder="BMW"
                        required
                        className={validationErrors.make ? "border-red-500 focus:border-red-500" : ""}
                      />
                      {validationErrors.make && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.make}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model || ''}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        placeholder="3 Series"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year || ''}
                        onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                        placeholder="2023"
                        min="1900"
                        max="2025"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="35000"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mileage">Mileage *</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={formData.mileage || ''}
                        onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                        placeholder="25000"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="vin">VIN *</Label>
                      <Input
                        id="vin"
                        value={formData.vin || ''}
                        onChange={(e) => handleInputChange('vin', e.target.value)}
                        placeholder="1HGBH41JXMN109186"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fuelType">Fuel Type *</Label>
                      <Select value={formData.fuelType} onValueChange={(value) => handleInputChange('fuelType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasoline">Gasoline</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="transmission">Transmission *</Label>
                      <Select value={formData.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="cvt">CVT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bodyType">Body Type *</Label>
                      <Select value={formData.bodyType} onValueChange={(value) => handleInputChange('bodyType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="hatchback">Hatchback</SelectItem>
                          <SelectItem value="coupe">Coupe</SelectItem>
                          <SelectItem value="convertible">Convertible</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="wagon">Wagon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="drivetrain">Drivetrain *</Label>
                      <Select value={formData.drivetrain} onValueChange={(value) => handleInputChange('drivetrain', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drivetrain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fwd">Front-Wheel Drive</SelectItem>
                          <SelectItem value="rwd">Rear-Wheel Drive</SelectItem>
                          <SelectItem value="awd">All-Wheel Drive</SelectItem>
                          <SelectItem value="4wd">4-Wheel Drive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Select value={formData.condition || ''} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="certified">Certified Pre-Owned</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color || ''}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        placeholder="Black"
                      />
                    </div>
                  </div>
                  
                  {/* Optional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="engine">Engine</Label>
                      <Input
                        id="engine"
                        value={formData.engine || ''}
                        onChange={(e) => handleInputChange('engine', e.target.value)}
                        placeholder="2.0L Turbo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="horsepower">Horsepower</Label>
                      <Input
                        id="horsepower"
                        type="number"
                        value={formData.horsepower || ''}
                        onChange={(e) => handleInputChange('horsepower', parseInt(e.target.value))}
                        placeholder="255"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mpgCity">MPG City</Label>
                      <Input
                        id="mpgCity"
                        type="number"
                        value={formData.mpgCity || ''}
                        onChange={(e) => handleInputChange('mpgCity', parseInt(e.target.value))}
                        placeholder="25"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the vehicle's features, condition, and any special notes..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-carstore-orange hover:bg-carstore-orange-dark"
                      disabled={createCarMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {createCarMutation.isPending ? 'Saving...' : 'Save Listing'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Current Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {dealerCars.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cars listed yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first vehicle to the inventory</p>
                <Button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-carstore-orange hover:bg-carstore-orange-dark"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Car
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dealerCars.map((car) => (
                  <div key={car.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {car.mileage.toLocaleString()} miles • {car.fuelType} • {car.transmission}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant={car.available ? "default" : "secondary"}>
                          {car.available ? "Available" : "Sold"}
                        </Badge>
                        <Badge variant="outline">{car.condition}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${parseFloat(car.price).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">VIN: {car.vin}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}