import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { insertCarSchema, insertDealerSchema, insertReviewSchema, loginSchema, registerSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// WebSocket connection management
interface WebSocketConnection extends WebSocket {
  dealerId?: string;
  userId?: string;
}

let wsConnections: Set<WebSocketConnection> = new Set();

// Function to broadcast updates to connected clients
function broadcastUpdate(data: any, filterFn?: (ws: WebSocketConnection) => boolean) {
  const message = JSON.stringify(data);
  wsConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN && (!filterFn || filterFn(ws))) {
      ws.send(message);
    }
  });
}

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT Authentication middleware
const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles: string[]) => (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({ 
        message: "User registered successfully",
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      if ((error as any).issues) {
        return res.status(400).json({ message: "Validation error", errors: (error as any).issues });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful for user:', user.username, 'role:', user.role);

      res.json({ 
        message: "Login successful",
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      if ((error as any).issues) {
        return res.status(400).json({ message: "Validation error", errors: (error as any).issues });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  app.post('/api/auth/logout', (req: any, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ message: "Logout successful" });
  });

  // Profile update route
  app.put("/api/auth/profile", authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user._id;
      const updates = req.body;
      
      // In a real app, you'd update the user in the database
      // For now, we'll just return success
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get user reviews
  app.get("/api/reviews/user/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      // For now, return empty array since we don't have a getReviewsByUser method
      // In a real implementation, you'd fetch user's reviews from the database
      res.json([]);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ message: "Failed to fetch user reviews" });
    }
  });

  // Car routes
  app.get("/api/cars", async (req, res) => {
    try {
      const cars = await storage.getAllCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/cars/featured", async (req, res) => {
    try {
      const cars = await storage.getFeaturedCars();
      res.json(cars);
    } catch (error) {
      console.error("Error fetching featured cars:", error);
      res.status(500).json({ message: "Failed to fetch featured cars", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/cars/search", async (req, res) => {
    try {
      const filters = {
        make: req.query.make as string,
        model: req.query.model as string,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        minYear: req.query.minYear ? parseInt(req.query.minYear as string) : undefined,
        maxYear: req.query.maxYear ? parseInt(req.query.maxYear as string) : undefined,
        fuelType: req.query.fuelType as string,
        transmission: req.query.transmission as string,
        bodyType: req.query.bodyType as string,
        maxMileage: req.query.maxMileage ? parseInt(req.query.maxMileage as string) : undefined,
      };

      // Handle general search query (from hero search bar)
      const generalQuery = req.query.q as string;
      if (generalQuery) {
        // Use text-based search for general queries
        const cars = await storage.searchCarsByText(generalQuery);
        res.json(cars);
        return;
      }

      // Remove undefined values and "all" values
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof typeof filters];
        if (value === undefined || value === "" || value === "all") {
          delete filters[key as keyof typeof filters];
        }
      });

      const cars = await storage.searchCars(filters);
      res.json(cars);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const car = await storage.getCar(id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  app.post("/api/cars", async (req, res) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar(carData);
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'CAR_ADDED',
        data: car,
        dealerId: car.dealerId
      }, (ws) => ws.dealerId === car.dealerId || !ws.dealerId);
      
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid car data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create car" });
    }
  });

  app.patch("/api/cars/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updates = req.body;
      const car = await storage.updateCar(id, updates);
      
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      
      // Broadcast real-time update
      broadcastUpdate({
        type: 'CAR_UPDATED',
        data: car,
        dealerId: car.dealerId
      }, (ws) => ws.dealerId === car.dealerId || !ws.dealerId);
      
      res.json(car);
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({ message: "Failed to update car" });
    }
  });

  // Test endpoint to simulate real-time updates
  app.post("/api/test/car-update", async (req, res) => {
    try {
      const { dealerId } = req.body;
      
      // Broadcast a test update
      broadcastUpdate({
        type: 'CAR_ADDED',
        data: {
          make: 'Test',
          model: 'Demo Car',
          year: 2024,
          price: 30000,
          _id: 'test-' + Date.now()
        },
        dealerId: dealerId || 'test-dealer'
      });
      
      res.json({ message: 'Test update broadcasted' });
    } catch (error) {
      console.error("Error broadcasting test update:", error);
      res.status(500).json({ message: "Failed to broadcast test update" });
    }
  });

  // Dealer routes
  app.get("/api/dealers", async (req, res) => {
    try {
      const dealers = await storage.getAllDealers();
      res.json(dealers);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      res.status(500).json({ message: "Failed to fetch dealers", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/dealers/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const dealer = await storage.getDealer(id);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error) {
      console.error("Error fetching dealer:", error);
      res.status(500).json({ message: "Failed to fetch dealer" });
    }
  });

  app.get("/api/dealers/:id/cars", async (req, res) => {
    try {
      const dealerId = req.params.id;
      const cars = await storage.getCarsByDealer(dealerId);
      res.json(cars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer cars" });
    }
  });

  app.post("/api/dealers", async (req, res) => {
    try {
      const dealerData = insertDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(dealerData);
      res.status(201).json(dealer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid dealer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create dealer" });
    }
  });

  // Review routes
  app.get("/api/reviews/dealer/:dealerId", async (req, res) => {
    try {
      const dealerId = req.params.dealerId;
      const reviews = await storage.getReviewsByDealer(dealerId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer reviews" });
    }
  });

  app.get("/api/reviews/car/:carId", async (req, res) => {
    try {
      const carId = req.params.carId;
      const reviews = await storage.getReviewsByCar(carId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Favorites routes  
  app.get("/api/favorites/:userId", authenticateToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      const favorites = await storage.getUserFavorites(userId);
      
      // Populate car details for each favorite
      const favoritesWithCars = await Promise.all(
        favorites.map(async (favorite: any) => {
          const car = await storage.getCar(favorite.carId);
          return {
            ...favorite,
            car
          };
        })
      );
      
      res.json(favoritesWithCars);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", authenticateToken, async (req, res) => {
    try {
      const favoriteData = {
        userId: req.body.userId,
        carId: req.body.carId
      };
      const favorite = await storage.addToFavorites(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:userId/:carId", authenticateToken, async (req, res) => {
    try {
      const userId = req.params.userId;
      const carId = req.params.carId;
      await storage.removeFromFavorites(userId, carId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  // Utility routes
  app.get("/api/makes", async (req, res) => {
    try {
      const cars = await storage.getAllCars();
      const makes = Array.from(new Set(cars.map(car => car.make))).sort();
      res.json(makes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch makes" });
    }
  });

  app.get("/api/models/:make", async (req, res) => {
    try {
      const make = req.params.make;
      const cars = await storage.getAllCars();
      const models = Array.from(new Set(cars.filter(car => car.make === make).map(car => car.model))).sort();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocketConnection, req) => {
    console.log('New WebSocket connection established');
    wsConnections.add(ws);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Handle client registration (dealer or user identification)
        if (message.type === 'register') {
          if (message.dealerId) {
            ws.dealerId = message.dealerId;
            console.log(`Dealer ${message.dealerId} connected via WebSocket`);
          }
          if (message.userId) {
            ws.userId = message.userId;
            console.log(`User ${message.userId} connected via WebSocket`);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      wsConnections.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsConnections.delete(ws);
    });
  });
  
  return httpServer;
}
