import { type User, type Dealer, type Car, type Review, type FavoriteCar, type InsertUser, type InsertDealer, type InsertCar, type InsertReview, type InsertFavoriteCar } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dealer operations
  getDealer(id: string): Promise<Dealer | undefined>;
  getAllDealers(): Promise<Dealer[]>;
  getDealersByLocation(location: string): Promise<Dealer[]>;
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  updateDealerRating(id: string, rating: number, reviewCount: number): Promise<void>;
  
  // Car operations
  getCar(id: string): Promise<Car | undefined>;
  getAllCars(): Promise<Car[]>;
  getCarsByDealer(dealerId: string): Promise<Car[]>;
  searchCars(filters: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    maxMileage?: number;
  }): Promise<Car[]>;
  searchCarsByText(query: string): Promise<Car[]>;
  getFeaturedCars(): Promise<Car[]>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: string, updates: Partial<InsertCar>): Promise<Car | undefined>;
  
  // Review operations
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByDealer(dealerId: string): Promise<Review[]>;
  getReviewsByCar(carId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Favorite operations
  getUserFavorites(userId: string): Promise<FavoriteCar[]>;
  addToFavorites(favorite: InsertFavoriteCar): Promise<FavoriteCar>;
  removeFromFavorites(userId: string, carId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private dealers: Map<string, Dealer> = new Map();
  private cars: Map<string, Car> = new Map();
  private reviews: Map<string, Review> = new Map();
  private favorites: Map<string, FavoriteCar> = new Map();
  private currentUserId = 1;
  private currentDealerId = 1;
  private currentCarId = 1;
  private currentReviewId = 1;
  private currentFavoriteId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample dealers
    const dealers = [
      {
        name: "Premium Auto Group",
        location: "Downtown, NYC",
        description: "Luxury and premium vehicles",
        imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        phone: "(555) 123-4567",
        email: "contact@premiumauto.com",
        address: "123 Auto Street, NYC, NY 10001",
        rating: "4.9",
        reviewCount: 156,
        verified: true,
        userId: null,
      },
      {
        name: "Elite Motors",
        location: "Beverly Hills, CA",
        description: "Elite luxury vehicle dealer",
        imageUrl: "https://images.unsplash.com/photo-1562911791-c7a97b729ec5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        phone: "(555) 234-5678",
        email: "info@elitemotors.com",
        address: "456 Luxury Ave, Beverly Hills, CA 90210",
        rating: "4.7",
        reviewCount: 89,
        verified: true,
        userId: null,
      },
      {
        name: "Family Auto Center",
        location: "Austin, TX",
        description: "Family-owned dealership serving Austin",
        imageUrl: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        phone: "(555) 345-6789",
        email: "sales@familyauto.com",
        address: "789 Family Blvd, Austin, TX 78701",
        rating: "4.8",
        reviewCount: 203,
        verified: true,
        userId: null,
      },
      {
        name: "Green Drive Motors",
        location: "Seattle, WA",
        description: "Eco-friendly and electric vehicles",
        imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        phone: "(555) 456-7890",
        email: "hello@greendrive.com",
        address: "321 Green St, Seattle, WA 98101",
        rating: "4.6",
        reviewCount: 124,
        verified: true,
        userId: null,
      },
    ];

    dealers.forEach(dealer => {
      const id = this.currentDealerId++;
      this.dealers.set(id, { ...dealer, id, createdAt: new Date() });
    });

    // Create sample cars
    const cars = [
      {
        make: "BMW",
        model: "3 Series",
        year: 2023,
        price: "45900",
        mileage: 25000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "sedan",
        drivetrain: "rwd",
        engine: "2.0L Turbo",
        horsepower: 255,
        mpgCity: 26,
        mpgHighway: 36,
        safetyRating: 5,
        color: "Red",
        condition: "certified",
        features: ["Navigation", "Leather Seats", "Sunroof", "Backup Camera"],
        imageUrls: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        description: "Luxury sedan with premium features",
        dealerId: 1,
        available: true,
      },
      {
        make: "Toyota",
        model: "RAV4",
        year: 2022,
        price: "32500",
        mileage: 18500,
        fuelType: "hybrid",
        transmission: "automatic",
        bodyType: "suv",
        drivetrain: "awd",
        engine: "2.5L Hybrid",
        horsepower: 219,
        mpgCity: 41,
        mpgHighway: 38,
        safetyRating: 5,
        color: "White",
        condition: "used",
        features: ["All-Wheel Drive", "Hybrid Engine", "Safety Sense 2.0"],
        imageUrls: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        description: "Reliable hybrid SUV with excellent fuel economy",
        dealerId: 3,
        available: true,
      },
      {
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        price: "48900",
        mileage: 12000,
        fuelType: "electric",
        transmission: "automatic",
        bodyType: "sedan",
        drivetrain: "rwd",
        engine: "Electric Motor",
        horsepower: 283,
        mpgCity: 0,
        mpgHighway: 0,
        safetyRating: 5,
        color: "Silver",
        condition: "used",
        features: ["Autopilot", "Supercharging", "Premium Interior"],
        imageUrls: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        description: "Electric sedan with cutting-edge technology",
        dealerId: 4,
        available: true,
      },
      {
        make: "Honda",
        model: "Civic",
        year: 2023,
        price: "24900",
        mileage: 8200,
        fuelType: "gasoline",
        transmission: "manual",
        bodyType: "sedan",
        drivetrain: "fwd",
        engine: "2.0L VTEC",
        horsepower: 158,
        mpgCity: 28,
        mpgHighway: 37,
        safetyRating: 5,
        color: "Blue",
        condition: "new",
        features: ["Honda Sensing", "Manual Transmission", "Sport Mode"],
        imageUrls: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        description: "Sporty compact sedan with manual transmission",
        dealerId: 3,
        available: true,
      },
      {
        make: "Ford",
        model: "F-150",
        year: 2022,
        price: "42700",
        mileage: 35000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "pickup",
        drivetrain: "4wd",
        engine: "3.5L V6",
        horsepower: 400,
        mpgCity: 20,
        mpgHighway: 24,
        safetyRating: 4,
        color: "Black",
        condition: "used",
        features: ["4WD", "Towing Package", "Bed Liner"],
        imageUrls: ["https://images.unsplash.com/photo-1615906344345-10c5bbca7b65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        description: "Powerful pickup truck for work and play",
        dealerId: 1,
        available: true,
      },
      {
        make: "Audi",
        model: "A5 Convertible",
        year: 2023,
        price: "54200",
        mileage: 15600,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "convertible",
        drivetrain: "awd",
        engine: "2.0L TFSI",
        horsepower: 261,
        mpgCity: 24,
        mpgHighway: 34,
        safetyRating: 5,
        color: "White",
        condition: "certified",
        features: ["Quattro AWD", "Virtual Cockpit", "Bang & Olufsen Audio"],
        imageUrls: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
        description: "Luxury convertible with premium amenities",
        dealerId: 2,
        available: true,
      },
    ];

    cars.forEach(car => {
      const id = this.currentCarId++;
      this.cars.set(id, { ...car, id, createdAt: new Date() });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Dealer operations
  async getDealer(id: number): Promise<Dealer | undefined> {
    return this.dealers.get(id);
  }

  async getAllDealers(): Promise<Dealer[]> {
    return Array.from(this.dealers.values());
  }

  async getDealersByLocation(location: string): Promise<Dealer[]> {
    return Array.from(this.dealers.values()).filter(dealer => 
      dealer.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  async createDealer(insertDealer: InsertDealer): Promise<Dealer> {
    const id = this.currentDealerId++;
    const dealer: Dealer = { ...insertDealer, id, createdAt: new Date() };
    this.dealers.set(id, dealer);
    return dealer;
  }

  async updateDealerRating(id: number, rating: number, reviewCount: number): Promise<void> {
    const dealer = this.dealers.get(id);
    if (dealer) {
      dealer.rating = rating.toString();
      dealer.reviewCount = reviewCount;
    }
  }

  // Car operations
  async getCar(id: number): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async getAllCars(): Promise<Car[]> {
    return Array.from(this.cars.values()).filter(car => car.available);
  }

  async getCarsByDealer(dealerId: number): Promise<Car[]> {
    return Array.from(this.cars.values()).filter(car => car.dealerId === dealerId && car.available);
  }

  async searchCars(filters: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuelType?: string;
    transmission?: string;
    bodyType?: string;
    maxMileage?: number;
  }): Promise<Car[]> {
    return Array.from(this.cars.values()).filter(car => {
      if (!car.available) return false;
      
      if (filters.make && car.make.toLowerCase() !== filters.make.toLowerCase()) return false;
      if (filters.model && car.model.toLowerCase() !== filters.model.toLowerCase()) return false;
      if (filters.minPrice && parseFloat(car.price) < filters.minPrice) return false;
      if (filters.maxPrice && parseFloat(car.price) > filters.maxPrice) return false;
      if (filters.minYear && car.year < filters.minYear) return false;
      if (filters.maxYear && car.year > filters.maxYear) return false;
      if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
      if (filters.maxMileage && car.mileage > filters.maxMileage) return false;
      
      return true;
    });
  }

  async searchCarsByText(query: string): Promise<Car[]> {
    const searchTerm = query.toLowerCase().trim();
    
    return Array.from(this.cars.values()).filter(car => {
      if (!car.available) return false;
      
      // Search in make, model, and combined make+model
      const fullName = `${car.make} ${car.model}`.toLowerCase();
      const makeMatch = car.make.toLowerCase().includes(searchTerm);
      const modelMatch = car.model.toLowerCase().includes(searchTerm);
      const fullNameMatch = fullName.includes(searchTerm);
      
      // Search in year (exact match or part of full name)
      const yearMatch = car.year.toString() === searchTerm || fullName.includes(searchTerm);
      
      // Search in body type and fuel type
      const bodyTypeMatch = car.bodyType.toLowerCase().includes(searchTerm);
      const fuelTypeMatch = car.fuelType.toLowerCase().includes(searchTerm);
      
      // Search in transmission
      const transmissionMatch = car.transmission.toLowerCase().includes(searchTerm);
      
      return makeMatch || modelMatch || fullNameMatch || yearMatch || bodyTypeMatch || fuelTypeMatch || transmissionMatch;
    });
  }

  async getFeaturedCars(): Promise<Car[]> {
    return Array.from(this.cars.values())
      .filter(car => car.available)
      .slice(0, 6);
  }

  async createCar(insertCar: InsertCar): Promise<Car> {
    const id = this.currentCarId++;
    const car: Car = { ...insertCar, id, createdAt: new Date() };
    this.cars.set(id, car);
    return car;
  }

  async updateCar(id: number, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const car = this.cars.get(id);
    if (car) {
      Object.assign(car, updates);
      return car;
    }
    return undefined;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByDealer(dealerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.dealerId === dealerId);
  }

  async getReviewsByCar(carId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.carId === carId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = { ...insertReview, id, createdAt: new Date() };
    this.reviews.set(id, review);
    
    // Update dealer rating and review count
    if (insertReview.dealerId) {
      const dealerReviews = Array.from(this.reviews.values()).filter(r => r.dealerId === insertReview.dealerId);
      const averageRating = dealerReviews.reduce((sum, r) => sum + r.rating, 0) / dealerReviews.length;
      await this.updateDealerRating(insertReview.dealerId, averageRating, dealerReviews.length);
    }
    
    return review;
  }

  // Favorite operations
  async getUserFavorites(userId: number): Promise<FavoriteCar[]> {
    return Array.from(this.favorites.values()).filter(favorite => favorite.userId === userId);
  }

  async addToFavorites(insertFavorite: InsertFavoriteCar): Promise<FavoriteCar> {
    const id = this.currentFavoriteId++;
    const favorite: FavoriteCar = { ...insertFavorite, id, createdAt: new Date() };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFromFavorites(userId: number, carId: number): Promise<void> {
    const favorite = Array.from(this.favorites.entries()).find(
      ([_, fav]) => fav.userId === userId && fav.carId === carId
    );
    if (favorite) {
      this.favorites.delete(favorite[0]);
    }
  }
}

export const storage = new MemStorage();
