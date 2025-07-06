import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Eye, Calculator, Image, ExternalLink } from "lucide-react";
import type { Car, Dealer } from "@shared/schema";

interface InventoryStats {
  available: number;
  sold: number;
  reserved: number;
  value: number;
}

interface PriceCalculationResult {
  adjustedPrice: number;
  factors: Array<{
    factor: string;
    adjustment: number;
    description: string;
  }>;
}

export default function InventoryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDealer, setSelectedDealer] = useState<string>("");
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [isPriceCalculatorOpen, setIsPriceCalculatorOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch dealers
  const { data: dealers = [] } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers'],
    queryFn: () => apiRequest('/api/dealers'),
  });

  // Fetch cars for selected dealer
  const { data: cars = [], isLoading } = useQuery<Car[]>({
    queryKey: ['/api/dealers', selectedDealer, 'cars'],
    queryFn: () => apiRequest(`/api/dealers/${selectedDealer}/cars`),
    enabled: !!selectedDealer,
  });

  // Calculate inventory stats
  const stats: InventoryStats = {
    available: cars.filter(car => car.available && car.inventoryStatus === 'in_stock').length,
    sold: cars.filter(car => car.inventoryStatus === 'sold').length,
    reserved: cars.filter(car => car.inventoryStatus === 'reserved').length,
    value: cars.reduce((sum, car) => sum + (typeof car.price === 'string' ? parseFloat(car.price) : car.price), 0),
  };

  // Filter cars based on search and status
  const filteredCars = cars.filter(car => {
    const matchesSearch = searchTerm === "" || 
      `${car.make} ${car.model} ${car.year}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || car.inventoryStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Create car mutation
  const createCarMutation = useMutation({
    mutationFn: (carData: any) => apiRequest('/api/cars', {
      method: 'POST',
      body: JSON.stringify(carData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dealers', selectedDealer, 'cars'] });
      setIsAddCarOpen(false);
      toast({
        title: "Success",
        description: "Car added to inventory successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add car to inventory",
        variant: "destructive",
      });
    },
  });

  // Update car mutation
  const updateCarMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      apiRequest(`/api/cars/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dealers', selectedDealer, 'cars'] });
      setIsEditCarOpen(false);
      setEditingCar(null);
      toast({
        title: "Success",
        description: "Car updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update car",
        variant: "destructive",
      });
    },
  });

  // Price calculator mutation
  const calculatePriceMutation = useMutation({
    mutationFn: (priceData: any) => apiRequest('/api/cars/calculate-price', {
      method: 'POST',
      body: JSON.stringify(priceData),
    }),
  });

  const handleAddCar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const carData = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      price: parseFloat(formData.get('price') as string),
      mileage: parseInt(formData.get('mileage') as string),
      fuelType: formData.get('fuelType') as string,
      transmission: formData.get('transmission') as string,
      bodyType: formData.get('bodyType') as string,
      drivetrain: formData.get('drivetrain') as string,
      engine: formData.get('engine') as string,
      horsepower: formData.get('horsepower') ? parseInt(formData.get('horsepower') as string) : undefined,
      mpgCity: formData.get('mpgCity') ? parseInt(formData.get('mpgCity') as string) : undefined,
      mpgHighway: formData.get('mpgHighway') ? parseInt(formData.get('mpgHighway') as string) : undefined,
      safetyRating: formData.get('safetyRating') ? parseInt(formData.get('safetyRating') as string) : undefined,
      color: formData.get('color') as string,
      vin: formData.get('vin') as string,
      condition: formData.get('condition') as string,
      description: formData.get('description') as string,
      dealerId: selectedDealer,
      features: (formData.get('features') as string).split(',').map(f => f.trim()).filter(f => f),
      imageUrls: (formData.get('imageUrls') as string).split(',').map(url => url.trim()).filter(url => url),
      googleDriveImages: (formData.get('googleDriveImages') as string).split(',').map(url => url.trim()).filter(url => url),
      stockQuantity: parseInt(formData.get('stockQuantity') as string) || 1,
      inventoryStatus: formData.get('inventoryStatus') as string,
    };

    createCarMutation.mutate(carData);
  };

  const handleEditCar = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!editingCar) return;
    
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const updates = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: parseInt(formData.get('year') as string),
      price: parseFloat(formData.get('price') as string),
      mileage: parseInt(formData.get('mileage') as string),
      fuelType: formData.get('fuelType') as string,
      transmission: formData.get('transmission') as string,
      bodyType: formData.get('bodyType') as string,
      drivetrain: formData.get('drivetrain') as string,
      engine: formData.get('engine') as string,
      horsepower: formData.get('horsepower') ? parseInt(formData.get('horsepower') as string) : undefined,
      mpgCity: formData.get('mpgCity') ? parseInt(formData.get('mpgCity') as string) : undefined,
      mpgHighway: formData.get('mpgHighway') ? parseInt(formData.get('mpgHighway') as string) : undefined,
      safetyRating: formData.get('safetyRating') ? parseInt(formData.get('safetyRating') as string) : undefined,
      color: formData.get('color') as string,
      vin: formData.get('vin') as string,
      condition: formData.get('condition') as string,
      description: formData.get('description') as string,
      features: (formData.get('features') as string).split(',').map(f => f.trim()).filter(f => f),
      imageUrls: (formData.get('imageUrls') as string).split(',').map(url => url.trim()).filter(url => url),
      googleDriveImages: (formData.get('googleDriveImages') as string).split(',').map(url => url.trim()).filter(url => url),
      stockQuantity: parseInt(formData.get('stockQuantity') as string) || 1,
      inventoryStatus: formData.get('inventoryStatus') as string,
    };

    updateCarMutation.mutate({ id: editingCar._id!, updates });
  };

  const calculatePrice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const priceData = {
      basePrice: parseFloat(formData.get('basePrice') as string),
      mileage: parseInt(formData.get('mileage') as string),
      year: parseInt(formData.get('year') as string),
      condition: formData.get('condition') as string,
      features: (formData.get('features') as string).split(',').map(f => f.trim()).filter(f => f),
      make: formData.get('make') as string,
      model: formData.get('model') as string,
    };

    calculatePriceMutation.mutate(priceData);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { variant: "default" as const, label: "In Stock" },
      low_stock: { variant: "secondary" as const, label: "Low Stock" },
      out_of_stock: { variant: "destructive" as const, label: "Out of Stock" },
      reserved: { variant: "outline" as const, label: "Reserved" },
      sold: { variant: "secondary" as const, label: "Sold" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.in_stock;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const CarForm = ({ car, onSubmit, isLoading }: { car?: Car; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isLoading: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input id="make" name="make" defaultValue={car?.make} required />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" name="model" defaultValue={car?.model} required />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" min="1900" max="2030" defaultValue={car?.year} required />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={car?.price} required />
            </div>
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" name="mileage" type="number" defaultValue={car?.mileage} required />
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input id="color" name="color" defaultValue={car?.color} />
            </div>
            <div>
              <Label htmlFor="vin">VIN</Label>
              <Input id="vin" name="vin" defaultValue={car?.vin} />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select name="condition" defaultValue={car?.condition || "used"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="certified">Certified Pre-Owned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={car?.description} rows={3} />
          </div>
        </TabsContent>
        
        <TabsContent value="specs" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select name="fuelType" defaultValue={car?.fuelType || "gasoline"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select name="transmission" defaultValue={car?.transmission || "automatic"}>
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
              <Label htmlFor="bodyType">Body Type</Label>
              <Select name="bodyType" defaultValue={car?.bodyType || "sedan"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="convertible">Convertible</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                  <SelectItem value="wagon">Wagon</SelectItem>
                  <SelectItem value="minivan">Minivan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="drivetrain">Drivetrain</Label>
              <Select name="drivetrain" defaultValue={car?.drivetrain || "fwd"}>
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
              <Label htmlFor="engine">Engine</Label>
              <Input id="engine" name="engine" defaultValue={car?.engine} placeholder="e.g., 2.0L Turbo I4" />
            </div>
            <div>
              <Label htmlFor="horsepower">Horsepower</Label>
              <Input id="horsepower" name="horsepower" type="number" defaultValue={car?.horsepower} />
            </div>
            <div>
              <Label htmlFor="mpgCity">MPG City</Label>
              <Input id="mpgCity" name="mpgCity" type="number" defaultValue={car?.mpgCity} />
            </div>
            <div>
              <Label htmlFor="mpgHighway">MPG Highway</Label>
              <Input id="mpgHighway" name="mpgHighway" type="number" defaultValue={car?.mpgHighway} />
            </div>
            <div>
              <Label htmlFor="safetyRating">Safety Rating (1-5)</Label>
              <Input id="safetyRating" name="safetyRating" type="number" min="1" max="5" defaultValue={car?.safetyRating} />
            </div>
          </div>
          <div>
            <Label htmlFor="features">Features (comma-separated)</Label>
            <Textarea 
              id="features" 
              name="features" 
              defaultValue={car?.features?.join(', ')} 
              placeholder="Navigation System, Heated Seats, Sunroof, Premium Audio"
              rows={2}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-4">
          <div>
            <Label htmlFor="imageUrls">Image URLs (comma-separated)</Label>
            <Textarea 
              id="imageUrls" 
              name="imageUrls" 
              defaultValue={car?.imageUrls?.join(', ')} 
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="googleDriveImages" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Google Drive Image Links (comma-separated)
            </Label>
            <Textarea 
              id="googleDriveImages" 
              name="googleDriveImages" 
              defaultValue={car?.googleDriveImages?.join(', ')} 
              placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
              rows={3}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Paste Google Drive share links here. They'll be automatically converted to direct image links.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input id="stockQuantity" name="stockQuantity" type="number" min="0" defaultValue={car?.stockQuantity || 1} />
            </div>
            <div>
              <Label htmlFor="inventoryStatus">Inventory Status</Label>
              <Select name="inventoryStatus" defaultValue={car?.inventoryStatus || "in_stock"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : car ? "Update Car" : "Add Car"}
        </Button>
      </div>
    </form>
  );

  if (!selectedDealer) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Select Dealer</CardTitle>
              <CardDescription>Choose a dealer to manage their inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedDealer} onValueChange={setSelectedDealer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dealer" />
                </SelectTrigger>
                <SelectContent>
                  {dealers.map((dealer) => (
                    <SelectItem key={dealer._id} value={dealer._id!}>
                      {dealer.name} - {dealer.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedDealerInfo = dealers.find(d => d._id === selectedDealer);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Managing inventory for {selectedDealerInfo?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPriceCalculatorOpen} onOpenChange={setIsPriceCalculatorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Price Calculator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Price Calculator</DialogTitle>
                <DialogDescription>
                  Calculate fair market value for a vehicle
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={calculatePrice} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calc-make">Make</Label>
                    <Input id="calc-make" name="make" required />
                  </div>
                  <div>
                    <Label htmlFor="calc-model">Model</Label>
                    <Input id="calc-model" name="model" required />
                  </div>
                  <div>
                    <Label htmlFor="calc-year">Year</Label>
                    <Input id="calc-year" name="year" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="calc-basePrice">Base Price</Label>
                    <Input id="calc-basePrice" name="basePrice" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="calc-mileage">Mileage</Label>
                    <Input id="calc-mileage" name="mileage" type="number" required />
                  </div>
                  <div>
                    <Label htmlFor="calc-condition">Condition</Label>
                    <Select name="condition" defaultValue="used">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                        <SelectItem value="certified">Certified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="calc-features">Features (comma-separated)</Label>
                  <Input id="calc-features" name="features" placeholder="Navigation, Leather Seats, Sunroof" />
                </div>
                <Button type="submit" className="w-full" disabled={calculatePriceMutation.isPending}>
                  {calculatePriceMutation.isPending ? "Calculating..." : "Calculate Price"}
                </Button>
              </form>
              
              {calculatePriceMutation.data && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-lg">
                    Estimated Value: {formatPrice((calculatePriceMutation.data as PriceCalculationResult).adjustedPrice)}
                  </h4>
                  <div className="mt-2 space-y-1">
                    {(calculatePriceMutation.data as PriceCalculationResult).factors.map((factor, index) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{factor.factor}</span>
                        <span className={factor.adjustment >= 0 ? "text-green-600" : "text-red-600"}>
                          {factor.adjustment >= 0 ? "+" : ""}{formatPrice(factor.adjustment)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Car
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Car</DialogTitle>
                <DialogDescription>
                  Add a new car to the inventory
                </DialogDescription>
              </DialogHeader>
              <CarForm onSubmit={handleAddCar} isLoading={createCarMutation.isPending} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => setSelectedDealer("")}>
            Change Dealer
          </Button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cars Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reserved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.value)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search by make, model, year, or VIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cars List */}
      {isLoading ? (
        <div className="text-center py-8">Loading inventory...</div>
      ) : filteredCars.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No cars found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCars.map((car) => (
            <Card key={car._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold">
                        {car.year} {car.make} {car.model}
                      </h3>
                      {getStatusBadge(car.inventoryStatus)}
                      {car.calculatedPrice && car.calculatedPrice !== car.price && (
                        <Badge variant="outline">
                          Fair Value: {formatPrice(car.calculatedPrice)}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Price:</span> {formatPrice(car.price)}
                      </div>
                      <div>
                        <span className="font-medium">Mileage:</span> {car.mileage.toLocaleString()} miles
                      </div>
                      <div>
                        <span className="font-medium">Stock:</span> {car.stockQuantity} available
                      </div>
                      <div>
                        <span className="font-medium">Fuel:</span> {car.fuelType}
                      </div>
                      <div>
                        <span className="font-medium">Transmission:</span> {car.transmission}
                      </div>
                      <div>
                        <span className="font-medium">Body:</span> {car.bodyType}
                      </div>
                      {car.vin && (
                        <div className="md:col-span-3">
                          <span className="font-medium">VIN:</span> {car.vin}
                        </div>
                      )}
                    </div>
                    {car.googleDriveImages && car.googleDriveImages.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Image className="h-4 w-4" />
                        <span>{car.googleDriveImages.length} Google Drive image(s)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCar(car);
                        setIsEditCarOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Car Dialog */}
      <Dialog open={isEditCarOpen} onOpenChange={setIsEditCarOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Car</DialogTitle>
            <DialogDescription>
              Update car information and inventory status
            </DialogDescription>
          </DialogHeader>
          {editingCar && (
            <CarForm car={editingCar} onSubmit={handleEditCar} isLoading={updateCarMutation.isPending} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}