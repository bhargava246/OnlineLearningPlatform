import {
  users,
  dealers,
  cars,
  reviews,
  favorites,
  type User,
  type UpsertUser,
  type Dealer,
  type InsertDealer,
  type Car,
  type InsertCar,
  type Review,
  type InsertReview,
  type FavoriteCar,
  type InsertFavoriteCar,
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, gte, lte, ilike, or, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Dealer operations
  async getDealer(id: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, parseInt(id)));
    return dealer;
  }

  async getAllDealers(): Promise<Dealer[]> {
    return await db.select().from(dealers).orderBy(desc(dealers.createdAt));
  }

  async getDealersByLocation(location: string): Promise<Dealer[]> {
    return await db.select().from(dealers).where(ilike(dealers.location, `%${location}%`));
  }

  async createDealer(dealerData: InsertDealer): Promise<Dealer> {
    const [dealer] = await db
      .insert(dealers)
      .values(dealerData)
      .returning();
    return dealer;
  }

  async updateDealerRating(id: string, rating: number, reviewCount: number): Promise<void> {
    await db
      .update(dealers)
      .set({ rating: rating.toString(), reviewCount })
      .where(eq(dealers.id, parseInt(id)));
  }

  // Car operations
  async getCar(id: string): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, parseInt(id)));
    return car;
  }

  async getAllCars(): Promise<Car[]> {
    return await db.select().from(cars).orderBy(desc(cars.createdAt));
  }

  async getCarsByDealer(dealerId: string): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.dealerId, parseInt(dealerId)));
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
    const conditions = [eq(cars.available, true)];

    if (filters.make) {
      conditions.push(ilike(cars.make, `%${filters.make}%`));
    }
    if (filters.model) {
      conditions.push(ilike(cars.model, `%${filters.model}%`));
    }
    if (filters.minPrice) {
      conditions.push(gte(cars.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice) {
      conditions.push(lte(cars.price, filters.maxPrice.toString()));
    }
    if (filters.minYear) {
      conditions.push(gte(cars.year, filters.minYear));
    }
    if (filters.maxYear) {
      conditions.push(lte(cars.year, filters.maxYear));
    }
    if (filters.fuelType) {
      conditions.push(eq(cars.fuelType, filters.fuelType as any));
    }
    if (filters.transmission) {
      conditions.push(eq(cars.transmission, filters.transmission as any));
    }
    if (filters.bodyType) {
      conditions.push(eq(cars.bodyType, filters.bodyType as any));
    }
    if (filters.maxMileage) {
      conditions.push(lte(cars.mileage, filters.maxMileage));
    }

    return await db.select().from(cars).where(and(...conditions));
  }

  async searchCarsByText(query: string): Promise<Car[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    return await db.select().from(cars).where(
      and(
        eq(cars.available, true),
        or(
          ilike(cars.make, searchTerm),
          ilike(cars.model, searchTerm),
          ilike(cars.bodyType, searchTerm),
          ilike(cars.fuelType, searchTerm),
          ilike(cars.transmission, searchTerm)
        )
      )
    );
  }

  async getFeaturedCars(): Promise<Car[]> {
    return await db
      .select()
      .from(cars)
      .where(eq(cars.available, true))
      .orderBy(desc(cars.createdAt))
      .limit(6);
  }

  async createCar(carData: InsertCar): Promise<Car> {
    const [car] = await db
      .insert(cars)
      .values(carData)
      .returning();
    return car;
  }

  async updateCar(id: string, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const [car] = await db
      .update(cars)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cars.id, parseInt(id)))
      .returning();
    return car;
  }

  // Review operations
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, parseInt(id)));
    return review;
  }

  async getReviewsByDealer(dealerId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.dealerId, parseInt(dealerId)));
  }

  async getReviewsByCar(carId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.carId, parseInt(carId)));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    return review;
  }

  // Favorite operations
  async getUserFavorites(userId: string): Promise<FavoriteCar[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addToFavorites(favoriteData: InsertFavoriteCar): Promise<FavoriteCar> {
    const [favorite] = await db
      .insert(favorites)
      .values(favoriteData)
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: string, carId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, parseInt(carId))));
  }
}

export const storage = new DatabaseStorage();