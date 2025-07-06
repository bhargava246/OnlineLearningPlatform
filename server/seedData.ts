import { MongoDBStorage } from './mongodb';
import type { InsertUser, InsertDealer, InsertCar, InsertReview } from '@shared/schema';

const mongoConnectionString = process.env.MONGODB_URI || "mongodb+srv://Himanshu:Himanshu123@himanshu.pe7xrly.mongodb.net/CarStore?retryWrites=true&w=majority&appName=himanshu";

export async function seedDatabase() {
  const storage = new MongoDBStorage(mongoConnectionString);
  
  try {
    await storage.connect();
    console.log('Seeding database with dummy data...');

    // Sample users
    const users: InsertUser[] = [
      {
        username: "john_dealer",
        email: "john@premiumauto.com",
        password: "hashedpassword123",
        role: "dealer"
      },
      {
        username: "sarah_dealer",
        email: "sarah@luxurycars.com", 
        password: "hashedpassword456",
        role: "dealer"
      },
      {
        username: "mike_customer",
        email: "mike@email.com",
        password: "hashedpassword789",
        role: "user"
      }
    ];

    // Create users first
    const createdUsers = [];
    for (const user of users) {
      try {
        const created = await storage.createUser(user);
        createdUsers.push(created);
      } catch (error) {
        console.log(`User ${user.username} might already exist, skipping...`);
      }
    }

    // Sample dealers
    const dealers: InsertDealer[] = [
      {
        name: "Premium Auto Group",
        location: "Downtown Los Angeles, CA",
        description: "Luxury vehicles and exceptional service since 1995. Specializing in premium German and Italian automobiles.",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        phone: "(555) 123-4567",
        email: "contact@premiumauto.com",
        address: "123 Luxury Ave, Los Angeles, CA 90210",
        rating: 4.8,
        reviewCount: 127,
        verified: true,
        businessHours: {
          monday: "9:00 AM - 7:00 PM",
          tuesday: "9:00 AM - 7:00 PM",
          wednesday: "9:00 AM - 7:00 PM",
          thursday: "9:00 AM - 7:00 PM",
          friday: "9:00 AM - 7:00 PM",
          saturday: "10:00 AM - 6:00 PM",
          sunday: "12:00 PM - 5:00 PM"
        },
        services: ["Financing", "Trade-ins", "Service & Maintenance", "Extended Warranties"]
      },
      {
        name: "Elite Motors",
        location: "Beverly Hills, CA",
        description: "Your destination for exotic and luxury vehicles. Curated collection of the world's finest automobiles.",
        imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
        phone: "(555) 987-6543",
        email: "info@elitemotors.com",
        address: "456 Rodeo Drive, Beverly Hills, CA 90210",
        rating: 4.9,
        reviewCount: 89,
        verified: true,
        businessHours: {
          monday: "10:00 AM - 8:00 PM",
          tuesday: "10:00 AM - 8:00 PM",
          wednesday: "10:00 AM - 8:00 PM",
          thursday: "10:00 AM - 8:00 PM",
          friday: "10:00 AM - 8:00 PM",
          saturday: "10:00 AM - 7:00 PM",
          sunday: "11:00 AM - 6:00 PM"
        },
        services: ["Concierge Service", "Custom Orders", "Collector Car Appraisals", "International Shipping"]
      },
      {
        name: "Metro Car Center",
        location: "Santa Monica, CA",
        description: "Quality pre-owned vehicles with transparent pricing. Family-owned business serving the community for over 20 years.",
        imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
        phone: "(555) 456-7890",
        email: "sales@metrocar.com",
        address: "789 Ocean Blvd, Santa Monica, CA 90401",
        rating: 4.6,
        reviewCount: 203,
        verified: true,
        businessHours: {
          monday: "8:00 AM - 6:00 PM",
          tuesday: "8:00 AM - 6:00 PM",
          wednesday: "8:00 AM - 6:00 PM",
          thursday: "8:00 AM - 6:00 PM",
          friday: "8:00 AM - 6:00 PM",
          saturday: "9:00 AM - 5:00 PM",
          sunday: "Closed"
        },
        services: ["Financing", "Trade-ins", "Inspections", "Warranty Options"]
      }
    ];

    // Create dealers
    const createdDealers = [];
    for (const dealer of dealers) {
      try {
        const created = await storage.createDealer(dealer);
        createdDealers.push(created);
      } catch (error) {
        console.log(`Dealer ${dealer.name} might already exist, skipping...`);
      }
    }

    // Get dealer IDs for cars
    const allDealers = await storage.getAllDealers();
    const dealerIds = allDealers.map(d => d._id!);

    // Sample cars
    const cars: InsertCar[] = [
      {
        make: "BMW",
        model: "3 Series",
        year: 2023,
        price: 45000,
        mileage: 12000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "sedan",
        drivetrain: "rwd",
        engine: "2.0L Turbocharged I4",
        horsepower: 255,
        mpgCity: 26,
        mpgHighway: 36,
        safetyRating: 5,
        color: "Alpine White",
        vin: "WBA8E9C09NCP12345",
        condition: "used",
        features: ["Navigation System", "Heated Seats", "Sunroof", "Premium Audio", "Backup Camera"],
        imageUrls: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
          "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
        ],
        description: "Immaculate BMW 3 Series with premium features and low mileage. One owner, full service history.",
        dealerId: dealerIds[0] || "1",
        available: true,
        inventoryStatus: "in_stock",
        stockQuantity: 1
      },
      {
        make: "Mercedes-Benz",
        model: "C-Class",
        year: 2022,
        price: 52000,
        mileage: 18000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "sedan",
        drivetrain: "rwd",
        engine: "2.0L Turbocharged I4",
        horsepower: 255,
        mpgCity: 23,
        mpgHighway: 34,
        safetyRating: 5,
        color: "Obsidian Black",
        vin: "WDD2H8EB0NCF67890",
        condition: "certified",
        features: ["MBUX Infotainment", "LED Headlights", "Wireless Charging", "Ambient Lighting", "Sport Package"],
        imageUrls: [
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
        ],
        description: "Certified Pre-Owned Mercedes-Benz C-Class with advanced technology and luxury appointments.",
        dealerId: dealerIds[0] || "1",
        available: true,
        inventoryStatus: "in_stock",
        stockQuantity: 1
      },
      {
        make: "Audi",
        model: "A4",
        year: 2023,
        price: 48000,
        mileage: 8000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "sedan",
        drivetrain: "awd",
        engine: "2.0L TFSI",
        horsepower: 201,
        mpgCity: 25,
        mpgHighway: 34,
        safetyRating: 5,
        color: "Glacier White",
        vin: "WAUENAF44PN123456",
        condition: "used",
        features: ["Quattro AWD", "Virtual Cockpit", "Apple CarPlay", "Heated Seats", "Audi Pre Sense"],
        imageUrls: [
          "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
        ],
        description: "Like-new Audi A4 with Quattro all-wheel drive and premium technology package.",
        dealerId: dealerIds[1] || "2",
        available: true,
        inventoryStatus: "in_stock",
        stockQuantity: 1
      },
      {
        make: "Tesla",
        model: "Model 3",
        year: 2022,
        price: 38000,
        mileage: 25000,
        fuelType: "electric",
        transmission: "automatic",
        bodyType: "sedan",
        drivetrain: "rwd",
        engine: "Electric Motor",
        horsepower: 283,
        mpgCity: 134,
        mpgHighway: 126,
        safetyRating: 5,
        color: "Pearl White",
        vin: "5YJ3E1EA9NF123789",
        condition: "used",
        features: ["Autopilot", "Premium Interior", "Glass Roof", "Mobile Connector", "Supercharging"],
        imageUrls: [
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
        ],
        description: "Clean Tesla Model 3 with Autopilot and premium features. Excellent battery health.",
        dealerId: dealerIds[1] || "2",
        available: true,
        inventoryStatus: "in_stock",
        stockQuantity: 1
      },
      {
        make: "Porsche",
        model: "911",
        year: 2021,
        price: 135000,
        mileage: 15000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "coupe",
        drivetrain: "rwd",
        engine: "3.0L Twin-Turbo H6",
        horsepower: 379,
        mpgCity: 18,
        mpgHighway: 24,
        safetyRating: 4,
        color: "Guards Red",
        vin: "WP0AB2A9XMS123456",
        condition: "used",
        features: ["Sport Chrono Package", "PASM", "Sport Exhaust", "PCM", "Bose Audio"],
        imageUrls: [
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
          "https://images.unsplash.com/photo-1544829099-b9a0c5303bff?w=800"
        ],
        description: "Iconic Porsche 911 Carrera S in stunning Guards Red. Sport Chrono package included.",
        dealerId: dealerIds[1] || "2",
        available: false,
        inventoryStatus: "sold",
        stockQuantity: 0,
        soldDate: new Date('2024-12-01'),
        soldPrice: 135000
      },
      {
        make: "Honda",
        model: "Accord",
        year: 2023,
        price: 28000,
        mileage: 22000,
        fuelType: "hybrid",
        transmission: "cvt",
        bodyType: "sedan",
        drivetrain: "fwd",
        engine: "1.5L Turbo + Electric",
        horsepower: 204,
        mpgCity: 48,
        mpgHighway: 47,
        safetyRating: 5,
        color: "Modern Steel",
        vin: "1HGCV1F13NA123456",
        condition: "certified",
        features: ["Honda Sensing", "Wireless CarPlay", "Heated Seats", "Dual-Zone Climate", "LED Headlights"],
        imageUrls: [
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"
        ],
        description: "Fuel-efficient Honda Accord Hybrid with advanced safety features and reliability.",
        dealerId: dealerIds[2] || "3",
        available: true,
        inventoryStatus: "in_stock",
        stockQuantity: 2
      },
      {
        make: "Toyota",
        model: "Camry",
        year: 2022,
        price: 26500,
        mileage: 35000,
        fuelType: "gasoline",
        transmission: "automatic",
        bodyType: "sedan",
        drivetrain: "fwd",
        engine: "2.5L I4",
        horsepower: 203,
        mpgCity: 28,
        mpgHighway: 39,
        safetyRating: 5,
        color: "Midnight Black",
        vin: "4T1G11AK9NU123456",
        condition: "used",
        features: ["Toyota Safety Sense", "Apple CarPlay", "Blind Spot Monitor", "Rear Cross Traffic", "Power Seats"],
        imageUrls: [
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
          "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800"
        ],
        description: "Reliable Toyota Camry with excellent fuel economy and proven dependability.",
        dealerId: dealerIds[2] || "3",
        available: true,
        inventoryStatus: "in_stock",
        stockQuantity: 1
      },
      {
        make: "Lexus",
        model: "RX",
        year: 2023,
        price: 62000,
        mileage: 12000,
        fuelType: "hybrid",
        transmission: "cvt",
        bodyType: "suv",
        drivetrain: "awd",
        engine: "2.5L Hybrid V6",
        horsepower: 308,
        mpgCity: 37,
        mpgHighway: 34,
        safetyRating: 5,
        color: "Eminent White",
        vin: "2T2BZMCA3PC123456",
        condition: "certified",
        features: ["Mark Levinson Audio", "Panoramic Roof", "Heated/Cooled Seats", "Head-Up Display", "Safety System+"],
        imageUrls: [
          "https://images.unsplash.com/photo-1606016899491-8844d2a0e8d8?w=800",
          "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800"
        ],
        description: "Luxury hybrid SUV with premium appointments and advanced technology features.",
        dealerId: dealerIds[0] || "1",
        available: true,
        inventoryStatus: "in_stock",
        stockQuantity: 1
      }
    ];

    // Create cars
    const createdCars = [];
    for (const car of cars) {
      try {
        const created = await storage.createCar(car);
        createdCars.push(created);
      } catch (error) {
        console.log(`Car ${car.make} ${car.model} might already exist, skipping...`);
      }
    }

    // Get all users for reviews
    const allUsers = await storage.getAllDealers();
    const allCars = await storage.getAllCars();

    // Sample reviews
    const reviews: InsertReview[] = [
      {
        userId: createdUsers[2]?._id || "user1",
        dealerId: dealerIds[0] || "1",
        rating: 5,
        comment: "Exceptional service from start to finish. The team at Premium Auto Group made buying my BMW a seamless experience. Highly recommended!",
        verified: true,
        helpful: 12
      },
      {
        userId: createdUsers[2]?._id || "user1",
        dealerId: dealerIds[1] || "2",
        rating: 5,
        comment: "Elite Motors truly lives up to their name. Professional staff, beautiful showroom, and they found exactly what I was looking for.",
        verified: true,
        helpful: 8
      },
      {
        userId: createdUsers[2]?._id || "user1",
        dealerId: dealerIds[0] || "1",
        rating: 4,
        comment: "Great selection of vehicles and competitive pricing. The financing process was smooth and transparent.",
        verified: true,
        helpful: 5
      },
      {
        userId: createdUsers[2]?._id || "user1",
        dealerId: dealerIds[2] || "3",
        rating: 5,
        comment: "Family-owned business with genuine care for customers. They went above and beyond to ensure I was satisfied with my purchase.",
        verified: true,
        helpful: 15
      },
      {
        userId: createdUsers[2]?._id || "user1",
        dealerId: dealerIds[1] || "2",
        rating: 4,
        comment: "Excellent customer service and attention to detail. The car was exactly as described and in perfect condition.",
        verified: true,
        helpful: 7
      }
    ];

    // Create reviews
    for (const review of reviews) {
      try {
        await storage.createReview(review);
      } catch (error) {
        console.log('Review might already exist, skipping...');
      }
    }

    console.log('✅ Database seeded successfully with dummy data!');
    console.log(`Created ${createdUsers.length} users, ${createdDealers.length} dealers, ${createdCars.length} cars, and ${reviews.length} reviews`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await storage.disconnect();
  }
}

// Run seeding if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}