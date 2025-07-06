import { z } from "zod";

// MongoDB schema definitions using Zod
export const userSchema = z.object({
  _id: z.string().optional(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["buyer", "seller", "admin"]).default("buyer"),
  createdAt: z.date().optional(),
});

export const dealerSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  location: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  rating: z.string().default("0.00"),
  reviewCount: z.number().default(0),
  verified: z.boolean().default(false),
  userId: z.string().optional(),
  createdAt: z.date().optional(),
});

export const carSchema = z.object({
  _id: z.string().optional(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  price: z.string(),
  mileage: z.number(),
  fuelType: z.enum(["gasoline", "electric", "hybrid", "diesel"]),
  transmission: z.enum(["automatic", "manual", "cvt"]),
  bodyType: z.enum(["sedan", "suv", "hatchback", "convertible", "pickup", "coupe"]),
  drivetrain: z.enum(["fwd", "rwd", "awd", "4wd"]),
  engine: z.string().optional(),
  horsepower: z.number().optional(),
  mpgCity: z.number().optional(),
  mpgHighway: z.number().optional(),
  safetyRating: z.number().min(1).max(5).optional(),
  color: z.string().optional(),
  vin: z.string().optional(),
  condition: z.enum(["new", "used", "certified"]).default("used"),
  features: z.array(z.string()).default([]),
  imageUrls: z.array(z.string()).default([]),
  description: z.string().optional(),
  dealerId: z.string(),
  available: z.boolean().default(true),
  createdAt: z.date().optional(),
});

export const reviewSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  dealerId: z.string().optional(),
  carId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.date().optional(),
});

export const favoriteCarSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  carId: z.string(),
  createdAt: z.date().optional(),
});

export const inventoryLogSchema = z.object({
  _id: z.string().optional(),
  dealerId: z.string(),
  carId: z.string(),
  action: z.enum(["added", "updated", "sold", "removed"]),
  oldData: z.record(z.any()).optional(),
  newData: z.record(z.any()).optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
});

export const saleSchema = z.object({
  _id: z.string().optional(),
  carId: z.string(),
  dealerId: z.string(),
  buyerName: z.string(),
  buyerEmail: z.string(),
  buyerPhone: z.string().optional(),
  salePrice: z.string(),
  financeType: z.enum(["cash", "finance", "lease"]).optional(),
  paymentMethod: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
});

export const dealerAnalyticsSchema = z.object({
  _id: z.string().optional(),
  dealerId: z.string(),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  date: z.date(),
  totalViews: z.number().default(0),
  totalInquiries: z.number().default(0),
  totalSales: z.number().default(0),
  totalRevenue: z.string().default("0"),
  carsListed: z.number().default(0),
  carsSold: z.number().default(0),
  averageTimeToSale: z.number().default(0),
  topPerformingCars: z.array(z.string()).default([]),
  createdAt: z.date().optional(),
});

// Insert schemas (omit _id and createdAt for new documents)
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export const insertDealerSchema = dealerSchema.omit({ _id: true, createdAt: true });
export const insertCarSchema = carSchema.omit({ _id: true, createdAt: true });
export const insertReviewSchema = reviewSchema.omit({ _id: true, createdAt: true });
export const insertFavoriteCarSchema = favoriteCarSchema.omit({ _id: true, createdAt: true });
export const insertInventoryLogSchema = inventoryLogSchema.omit({ _id: true, createdAt: true });
export const insertSaleSchema = saleSchema.omit({ _id: true, createdAt: true });
export const insertDealerAnalyticsSchema = dealerAnalyticsSchema.omit({ _id: true, createdAt: true });

// Type definitions
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Dealer = z.infer<typeof dealerSchema>;
export type InsertDealer = z.infer<typeof insertDealerSchema>;
export type Car = z.infer<typeof carSchema>;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type FavoriteCar = z.infer<typeof favoriteCarSchema>;
export type InsertFavoriteCar = z.infer<typeof insertFavoriteCarSchema>;
export type InventoryLog = z.infer<typeof inventoryLogSchema>;
export type InsertInventoryLog = z.infer<typeof insertInventoryLogSchema>;
export type Sale = z.infer<typeof saleSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type DealerAnalytics = z.infer<typeof dealerAnalyticsSchema>;
export type InsertDealerAnalytics = z.infer<typeof insertDealerAnalyticsSchema>;

// Additional auth-related schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["buyer", "seller"]).default("buyer"),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
