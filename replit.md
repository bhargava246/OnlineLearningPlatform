# CarStore - Car Marketplace Application

## Overview

CarStore is a full-stack car marketplace application built with React, Express.js, and PostgreSQL. The application allows users to browse, search, and compare cars from verified dealers, providing a comprehensive platform for car shopping with features like advanced filtering, dealer profiles, and car comparisons.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless hosting
- **Session Management**: Express sessions with PostgreSQL storage

### Development Setup
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Type Safety**: Shared TypeScript schemas between frontend and backend

## Key Components

### Database Schema (Shared)
- **Users**: Authentication and user management with role-based access
- **Dealers**: Dealer profiles with ratings, location, and verification status
- **Cars**: Comprehensive car listings with detailed specifications and pricing
- **Reviews**: User reviews for dealers with rating system
- **Favorites**: User favorite cars functionality

### Frontend Pages
- **Home**: Hero section with search, featured cars, and dealer highlights
- **Search Results**: Advanced filtering and sorting capabilities
- **Car Detail**: Comprehensive car information with image galleries
- **Compare**: Side-by-side car comparison functionality
- **Dealers**: Dealer directory with search and filtering

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Route Handlers**: RESTful endpoints for cars, dealers, reviews, and favorites
- **Search Engine**: Advanced filtering system for cars with multiple criteria

## Data Flow

### Client-Server Communication
1. React components use TanStack Query for data fetching
2. API requests go through standardized fetch wrapper with error handling
3. Server responds with JSON data following consistent patterns
4. Client updates UI reactively based on server state changes

### Search and Filtering
1. User inputs filters on frontend (price, year, make, model, etc.)
2. Frontend constructs URL parameters for search criteria
3. Backend processes filters and queries database through Drizzle ORM
4. Results returned with pagination and sorting options
5. Frontend displays results with loading states and error handling

### Car Management
1. Cars are stored with comprehensive metadata (specs, pricing, images)
2. Featured cars are surfaced on homepage for better discovery
3. Search functionality supports multiple simultaneous filters
4. Car details include dealer information and contact options

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first styling with custom theme variables
- **Lucide Icons**: Consistent icon system throughout the application
- **Class Variance Authority**: Type-safe component variants

### Data Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation and formatting utilities

### Development Tools
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production
- **TypeScript**: Type safety across the entire application
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Build Process
1. Frontend built with Vite to static assets in `dist/public`
2. Backend compiled with ESBuild to `dist/index.js`
3. Shared schemas accessible to both frontend and backend
4. Environment variables managed through `.env` files

### Production Setup
- Static frontend assets served by Express in production
- Database migrations handled through Drizzle Kit
- PostgreSQL database hosted on Neon with connection pooling
- Express server configured for production deployment

### Development Environment
- Vite dev server with HMR for frontend development
- Backend runs with tsx for TypeScript execution
- Database schema changes applied with `npm run db:push`
- Replit integration with runtime error overlay and cartographer

## Changelog
- July 05, 2025. Migrated to full authentication system with role-based access. Created modern landing page with login/signup modals. Implemented sidebar navigation for authenticated users with different menus for buyers/sellers/admins. Fixed session persistence and role-based dashboard routing.
- July 05, 2025. Added comprehensive dealer profile page with inventory, reviews, and contact details. Made dealer cards clickable for better navigation.
- July 03, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.