import { MongoDBStorage } from './mongodb';
import { IStorage } from './storage';

// Create MongoDB storage instance - use a dedicated MongoDB connection string
const mongoConnectionString = process.env.MONGODB_URI || 'mongodb+srv://Himanshu:Himanshu123@himanshu.pe7xrly.mongodb.net/CarStore?retryWrites=true&w=majority&appName=himanshu';
export const storage: IStorage = new MongoDBStorage(mongoConnectionString);