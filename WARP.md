# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Starting the Server
```bash
npm run dev              # Start with nodemon (auto-restart on changes)
npm start               # Start in production mode
```

### Database Management
```bash
# Database connection (requires XAMPP/MySQL running)
mysql -u root -p listing_app    # Connect to database directly (correct DB name)

# Prisma commands (using package.json scripts)
npm run prisma:generate        # Generate Prisma client after schema changes
npm run prisma:push            # Push schema changes to database (development)
npm run prisma:studio          # Open Prisma Studio (database GUI)

# Testing database connection
npm run test-db               # Test Prisma connection and show record counts
npm run setup-db              # Run database setup script
```

### Dependencies
```bash
npm install             # Install all dependencies
npm install <package>   # Add new dependency
```

### Testing API Endpoints
```bash
# Test server is running
curl http://localhost:3000

# Main tourism API endpoints
curl http://localhost:3000/api/users
curl http://localhost:3000/api/establishments
curl http://localhost:3000/api/sites
curl http://localhost:3000/api/reviews
curl http://localhost:3000/api/promotions

# Legacy listings endpoint
curl http://localhost:3000/api/listings

# Create new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

## High-Level Architecture

### API Architecture Pattern
This is a **classic REST API** built with the **MVC (Model-View-Controller)** pattern using Node.js/Express and MySQL:

- **Routes Layer** (`src/routes/`): URL endpoint definitions and HTTP method mappings
- **Controller Layer** (`src/controllers/`): Business logic and request/response handling  
- **Model Layer** (`src/models/`): Data schema definition and database utilities
- **Config Layer** (`src/config/`): Database connection and environment configuration

### Database Design
**Multi-Entity Tourism Platform** architecture with the following Prisma models:
- **Users**: Authentication with role-based access (USER, ADMIN, PARTNER)
- **Partners**: Business partners who manage establishments
- **Establishments**: Hotels, restaurants, attractions with geolocation and pricing
- **Sites**: Tourist sites with GPS coordinates and descriptions
- **Reviews**: User reviews for establishments with ratings (1-5)
- **Promotions**: Time-based special offers with percentage discounts

All models use CUID for IDs and include proper foreign key relationships with cascade deletion.

### Prisma ORM Integration
Uses **Prisma** as the database ORM for type-safe database operations:
- **Type Safety**: Auto-generated TypeScript types for all models
- **Relation Management**: Automatic handling of foreign keys and joins
- **Migration System**: Version-controlled database schema changes
- **Connection Pooling**: Built-in connection optimization
- **Query Optimization**: Intelligent query planning and execution

### REST API Design
Full CRUD operations following REST conventions across multiple entities:

**Main Tourism API (Prisma-based)**:
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | `/api/users` | Retrieve all users (excluding passwords) |
| GET    | `/api/users/:id` | Get user with their reviews |
| GET    | `/api/users/role/:role` | Filter users by role (USER/ADMIN/PARTNER) |
| POST   | `/api/users` | Create new user with validation |
| PUT    | `/api/users/:id` | Update user (partial updates supported) |
| DELETE | `/api/users/:id` | Remove user (cascades to reviews) |

| GET    | `/api/establishments` | All establishments with relations |
| GET    | `/api/establishments/:id` | Single establishment with full data |
| POST   | `/api/establishments` | Create establishment (requires partnerId) |
| PUT    | `/api/establishments/:id` | Update establishment |
| DELETE | `/api/establishments/:id` | Remove establishment |

| GET    | `/api/sites` | All tourist sites |
| GET    | `/api/sites/nearby` | Proximity-based search |
| GET    | `/api/sites/stats` | Site statistics |

| GET    | `/api/reviews` | All reviews with user/establishment info |
| GET    | `/api/reviews/user/:id` | Reviews by specific user |
| GET    | `/api/reviews/establishment/:id/stats` | Review statistics |

| GET    | `/api/promotions` | All promotions |
| GET    | `/api/promotions/current` | Active promotions only |
| GET    | `/api/promotions/expiring` | Promotions expiring soon |

**Legacy API (MySQL-based)**:
| GET/POST/PUT/DELETE | `/api/listings/*` | Original listings CRUD operations |

### Response Format Consistency
All API responses follow a standard JSON structure:
```javascript
{
  "success": boolean,
  "message"?: string,     // For create/update/delete operations
  "data"?: object|array,  // For successful data operations
  "error"?: string,       // For error cases
  "count"?: number        // For list operations
}
```

### Error Handling Strategy
**Layered error handling** with specific error types:
- **Validation Errors**: 400 status with field-specific messages
- **Not Found Errors**: 404 status for missing resources
- **Database Errors**: 500 status with sanitized error messages
- **Global Error Middleware**: Catches unhandled errors and prevents crashes

### Environment Configuration
**XAMPP-optimized setup** for local development:
- Database auto-initialization (creates `listing_db` and tables on first run)
- Sample data insertion for immediate testing
- Environment variables for database connection
- CORS configured for frontend integration

### File Structure Logic
```
src/
├── config/
│   └── database.js          # Prisma client configuration and connection management
├── controllers/             # Business logic layer (one per entity)
│   ├── usersController.js       # User CRUD with role validation
│   ├── establishmentsController.js  # Establishment CRUD with partner validation
│   ├── sitesController.js       # Site CRUD with geolocation features
│   ├── reviewsController.js     # Review CRUD with rating validation
│   ├── promotionsController.js  # Promotion CRUD with date validation
│   └── listingsController.js   # Legacy controller (MySQL-based)
├── models/                 # Data layer (legacy)
│   └── Listing.js            # MySQL schema and initialization
└── routes/                 # Express route definitions
    ├── users.js              # User routes with role-based endpoints
    ├── establishments.js     # Establishment routes
    ├── sites.js              # Site routes with search capabilities
    ├── reviews.js            # Review routes with filtering
    ├── promotions.js         # Promotion routes with time-based queries
    └── listings.js           # Legacy routes

prisma/
├── schema.prisma            # Complete database schema with relations
└── manual_schema.sql        # SQL fallback for MariaDB compatibility

# Root level
server.js                   # Express app configuration and startup
```

### Key Technical Patterns

**Dual Database Architecture**:
The codebase supports both legacy MySQL (via mysql2) and modern Prisma ORM patterns, allowing gradual migration while maintaining backward compatibility.

**Prisma Integration Pattern**:
Modern controllers use Prisma client with:
- Type-safe database operations
- Automatic relation loading with `include`
- Built-in connection pooling
- Environment-aware logging (query logs in development only)

**Controller Pattern**: 
Each controller method follows a consistent pattern:
1. Extract and validate request parameters
2. Check entity existence for updates/deletes
3. Validate business rules (unique emails, required relationships)
4. Execute Prisma operation with proper error handling
5. Return standardized JSON response with success/error structure

**Relationship Management**:
- All foreign keys use Prisma relations with cascade deletion
- Controllers automatically include related data (reviews with users, establishments with partners)
- Complex queries support filtering (active promotions, user roles, proximity search)

**Error Handling Strategy**:
- Consistent JSON response format across all endpoints
- Environment-aware error messages (detailed in dev, sanitized in prod)
- Proper HTTP status codes (400 for validation, 404 for not found, 500 for server errors)
- Global error middleware in server.js catches unhandled exceptions

**Development Environment Setup**:
- XAMPP-optimized with automatic database detection
- Manual SQL fallback for MariaDB compatibility issues
- Test scripts for connection validation (`npm run test-db`)
- Comprehensive API testing guide with curl examples

This architecture supports both rapid prototyping with the legacy system and modern development practices with Prisma, making it suitable for incremental modernization.
