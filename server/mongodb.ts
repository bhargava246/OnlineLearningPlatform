import { MongoClient, Db, Collection, ObjectId, Document } from 'mongodb';
import { 
  User, InsertUser, Dealer, InsertDealer, Car, InsertCar, 
  Review, InsertReview, FavoriteCar, InsertFavoriteCar,
  InventoryLog, InsertInventoryLog, Sale, InsertSale,
  DealerAnalytics, InsertDealerAnalytics
} from '@shared/schema';

// MongoDB document types with ObjectId
type MongoUser = Omit<User, '_id'> & { _id?: ObjectId };
type MongoDealer = Omit<Dealer, '_id'> & { _id?: ObjectId };
type MongoCar = Omit<Car, '_id'> & { _id?: ObjectId };
type MongoReview = Omit<Review, '_id'> & { _id?: ObjectId };
type MongoFavoriteCar = Omit<FavoriteCar, '_id'> & { _id?: ObjectId };
type MongoInventoryLog = Omit<InventoryLog, '_id'> & { _id?: ObjectId };
type MongoSale = Omit<Sale, '_id'> & { _id?: ObjectId };
type MongoDealerAnalytics = Omit<DealerAnalytics, '_id'> & { _id?: ObjectId };

export class MongoDBStorage {
  private client: MongoClient;
  private db!: Db;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.performConnection();
    return this.connectionPromise;
  }

  private async performConnection(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db('CarStore');
      this.isConnected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.connectionPromise = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    }
  }

  private collection<T extends Document>(name: string): Collection<T> {
    return this.db.collection<T>(name);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    await this.connect();
    const user = await this.collection<MongoUser>('users').findOne({ _id: new ObjectId(id) });
    return user ? { ...user, _id: user._id?.toString() } : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.connect();
    const user = await this.collection<User>('users').findOne({ username });
    return user ? { ...user, _id: user._id?.toString() } : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.connect();
    const user = await this.collection<User>('users').findOne({ email });
    return user ? { ...user, _id: user._id?.toString() } : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    await this.connect();
    const result = await this.collection<User>('users').insertOne({
      ...userData,
      createdAt: new Date(),
    } as User);
    
    const user = await this.getUser(result.insertedId.toString());
    if (!user) throw new Error('Failed to create user');
    return user;
  }

  // Dealer operations
  async getDealer(id: string): Promise<Dealer | undefined> {
    await this.connect();
    const dealer = await this.collection<Dealer>('dealers').findOne({ _id: new ObjectId(id) });
    return dealer ? { ...dealer, _id: dealer._id?.toString() } : undefined;
  }

  async getAllDealers(): Promise<Dealer[]> {
    await this.connect();
    const dealers = await this.collection<Dealer>('dealers').find({}).toArray();
    return dealers.map(dealer => ({ ...dealer, _id: dealer._id?.toString() }));
  }

  async getDealersByLocation(location: string): Promise<Dealer[]> {
    await this.connect();
    const dealers = await this.collection<Dealer>('dealers').find({ 
      location: { $regex: location, $options: 'i' } 
    }).toArray();
    return dealers.map(dealer => ({ ...dealer, _id: dealer._id?.toString() }));
  }

  async createDealer(dealerData: InsertDealer): Promise<Dealer> {
    await this.connect();
    const result = await this.collection<Dealer>('dealers').insertOne({
      ...dealerData,
      createdAt: new Date(),
    } as Dealer);
    
    const dealer = await this.getDealer(result.insertedId.toString());
    if (!dealer) throw new Error('Failed to create dealer');
    return dealer;
  }

  async updateDealerRating(id: string, rating: number, reviewCount: number): Promise<void> {
    await this.connect();
    await this.collection<Dealer>('dealers').updateOne(
      { _id: new ObjectId(id) },
      { $set: { rating, reviewCount } }
    );
  }

  // Car operations
  async getCar(id: string): Promise<Car | undefined> {
    await this.connect();
    const car = await this.collection<Car>('cars').findOne({ _id: new ObjectId(id) });
    return car ? { ...car, _id: car._id?.toString() } : undefined;
  }

  async getAllCars(): Promise<Car[]> {
    await this.connect();
    const cars = await this.collection<Car>('cars').find({}).toArray();
    
    // Remove duplicates based on _id
    const uniqueCars = cars.reduce((acc: Car[], car) => {
      if (!acc.some(existingCar => existingCar._id?.toString() === car._id?.toString())) {
        acc.push(car);
      }
      return acc;
    }, []);
    
    return uniqueCars.map(car => ({ ...car, _id: car._id?.toString() }));
  }

  async getCarsByDealer(dealerId: string): Promise<Car[]> {
    await this.connect();
    const cars = await this.collection<Car>('cars').find({ dealerId }).toArray();
    return cars.map(car => ({ ...car, _id: car._id?.toString() }));
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
    await this.connect();
    const query: any = { available: true };

    if (filters.make) query.make = { $regex: filters.make, $options: 'i' };
    if (filters.model) query.model = { $regex: filters.model, $options: 'i' };
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = filters.minPrice;
      if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }
    if (filters.minYear || filters.maxYear) {
      query.year = {};
      if (filters.minYear) query.year.$gte = filters.minYear;
      if (filters.maxYear) query.year.$lte = filters.maxYear;
    }
    if (filters.fuelType) query.fuelType = filters.fuelType;
    if (filters.transmission) query.transmission = filters.transmission;
    if (filters.bodyType) query.bodyType = filters.bodyType;
    if (filters.maxMileage) query.mileage = { $lte: filters.maxMileage };

    const cars = await this.collection<Car>('cars').find(query).toArray();
    
    // Remove duplicates based on _id
    const uniqueCars = cars.reduce((acc: Car[], car) => {
      if (!acc.some(existingCar => existingCar._id?.toString() === car._id?.toString())) {
        acc.push(car);
      }
      return acc;
    }, []);
    
    return uniqueCars.map(car => ({ ...car, _id: car._id?.toString() }));
  }

  async getFeaturedCars(): Promise<Car[]> {
    await this.connect();
    const cars = await this.collection<Car>('cars')
      .find({ available: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
    return cars.map(car => ({ ...car, _id: car._id?.toString() }));
  }

  async createCar(carData: InsertCar): Promise<Car> {
    await this.connect();
    const result = await this.collection<Car>('cars').insertOne({
      ...carData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Car);
    
    const car = await this.getCar(result.insertedId.toString());
    if (!car) throw new Error('Failed to create car');
    return car;
  }

  async updateCar(id: string, updates: Partial<InsertCar>): Promise<Car | undefined> {
    await this.connect();
    await this.collection<Car>('cars').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return this.getCar(id);
  }

  // Review operations
  async getReview(id: string): Promise<Review | undefined> {
    await this.connect();
    const review = await this.collection<Review>('reviews').findOne({ _id: new ObjectId(id) });
    return review ? { ...review, _id: review._id?.toString() } : undefined;
  }

  async getReviewsByDealer(dealerId: string): Promise<Review[]> {
    await this.connect();
    const reviews = await this.collection<Review>('reviews').find({ dealerId }).toArray();
    return reviews.map(review => ({ ...review, _id: review._id?.toString() }));
  }

  async getReviewsByCar(carId: string): Promise<Review[]> {
    await this.connect();
    const reviews = await this.collection<Review>('reviews').find({ carId }).toArray();
    return reviews.map(review => ({ ...review, _id: review._id?.toString() }));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    await this.connect();
    const result = await this.collection<Review>('reviews').insertOne({
      ...reviewData,
      createdAt: new Date(),
    } as Review);
    
    const review = await this.getReview(result.insertedId.toString());
    if (!review) throw new Error('Failed to create review');
    return review;
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<FavoriteCar[]> {
    await this.connect();
    const favorites = await this.collection<FavoriteCar>('favorites').find({ userId }).toArray();
    return favorites.map(fav => ({ ...fav, _id: fav._id?.toString() }));
  }

  async addToFavorites(favoriteData: InsertFavoriteCar): Promise<FavoriteCar> {
    await this.connect();
    const result = await this.collection<FavoriteCar>('favorites').insertOne({
      ...favoriteData,
      createdAt: new Date(),
    } as FavoriteCar);
    
    const favorite = await this.collection<FavoriteCar>('favorites').findOne({ _id: result.insertedId });
    if (!favorite) throw new Error('Failed to add to favorites');
    return { ...favorite, _id: favorite._id?.toString() };
  }

  async removeFromFavorites(userId: string, carId: string): Promise<void> {
    await this.connect();
    await this.collection<FavoriteCar>('favorites').deleteOne({ userId, carId });
  }

  // Inventory Management operations
  async createInventoryLog(logData: InsertInventoryLog): Promise<InventoryLog> {
    await this.connect();
    const result = await this.collection<InventoryLog>('inventory_logs').insertOne({
      ...logData,
      createdAt: new Date(),
    } as InventoryLog);
    
    const log = await this.collection<InventoryLog>('inventory_logs').findOne({ _id: result.insertedId });
    if (!log) throw new Error('Failed to create inventory log');
    return { ...log, _id: log._id?.toString() };
  }

  async getInventoryLogs(dealerId: string): Promise<InventoryLog[]> {
    await this.connect();
    const logs = await this.collection<InventoryLog>('inventory_logs')
      .find({ dealerId })
      .sort({ createdAt: -1 })
      .toArray();
    return logs.map(log => ({ ...log, _id: log._id?.toString() }));
  }

  // Sales operations
  async createSale(saleData: InsertSale): Promise<Sale> {
    await this.connect();
    const result = await this.collection<Sale>('sales').insertOne({
      ...saleData,
      createdAt: new Date(),
    } as Sale);
    
    const sale = await this.collection<Sale>('sales').findOne({ _id: result.insertedId });
    if (!sale) throw new Error('Failed to create sale');
    return { ...sale, _id: sale._id?.toString() };
  }

  async getSalesByDealer(dealerId: string): Promise<Sale[]> {
    await this.connect();
    const sales = await this.collection<Sale>('sales').find({ dealerId }).toArray();
    return sales.map(sale => ({ ...sale, _id: sale._id?.toString() }));
  }

  async updateSale(id: string, updates: Partial<InsertSale>): Promise<Sale | undefined> {
    await this.connect();
    await this.collection<Sale>('sales').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    const sale = await this.collection<Sale>('sales').findOne({ _id: new ObjectId(id) });
    return sale ? { ...sale, _id: sale._id?.toString() } : undefined;
  }

  // Analytics operations
  async createDealerAnalytics(analyticsData: InsertDealerAnalytics): Promise<DealerAnalytics> {
    await this.connect();
    const result = await this.collection<DealerAnalytics>('dealer_analytics').insertOne({
      ...analyticsData,
      createdAt: new Date(),
    } as DealerAnalytics);
    
    const analytics = await this.collection<DealerAnalytics>('dealer_analytics').findOne({ _id: result.insertedId });
    if (!analytics) throw new Error('Failed to create dealer analytics');
    return { ...analytics, _id: analytics._id?.toString() };
  }

  async getDealerAnalytics(dealerId: string, period: string): Promise<DealerAnalytics[]> {
    await this.connect();
    const analytics = await this.collection<DealerAnalytics>('dealer_analytics')
      .find({ dealerId, period })
      .sort({ periodDate: -1 })
      .toArray();
    return analytics.map(item => ({ ...item, _id: item._id?.toString() }));
  }

  async searchCarsByText(query: string): Promise<Car[]> {
    await this.connect();
    const searchTerm = query.toLowerCase().trim();
    
    const cars = await this.collection<Car>('cars').find({
      $and: [
        { available: true },
        {
          $or: [
            { make: { $regex: searchTerm, $options: 'i' } },
            { model: { $regex: searchTerm, $options: 'i' } },
            { bodyType: { $regex: searchTerm, $options: 'i' } },
            { fuelType: { $regex: searchTerm, $options: 'i' } },
            { transmission: { $regex: searchTerm, $options: 'i' } }
          ]
        }
      ]
    }).toArray();
    
    return cars.map(car => ({ ...car, _id: car._id?.toString() }));
  }
}