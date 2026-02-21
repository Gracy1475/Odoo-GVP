# FleetFlow - Fleet Management System

FleetFlow is a comprehensive Full-Stack Fleet Management System designed to streamline vehicle operations, track trips, monitor driver activity, and manage vehicle maintenance and fuel logs.

## 🚀 Features

- **Dashboard & Analytics**: Centralized view of fleet status, vehicle metrics, and operational performance.
- **Vehicle Management**: Keep track of the entire fleet, vehicle statuses, and details.
- **Driver Management**: Manage driver profiles, assignments, and safety scores.
- **Trip Tracking**: Log trips, routes, distances, and associated costs.
- **Maintenance Logging**: Monitor vehicle health, schedule maintenance, and record service history.
- **Fuel Tracking**: Track fuel consumption and expenses per vehicle.
- **Safety Monitoring**: Analyze driver behavior and safety incidents.
- **Authentication**: Secure JWT-based user authentication and protected routes.

## 🛠️ Tech Stack

### Backend
- **Node.js & Express.js**: RESTful API framework.
- **PostgreSQL**: Relational database for robust data storage.
- **JWT (JSON Web Tokens)**: Secure user authentication.
- **Bcrypt.js**: Password hashing and security.
- **Cors & Helmet**: Security middleware.

### Frontend
- **React**: UI library for building the interactive dashboard.
- **Vite**: Fast frontend build tool.
- **React Router**: Client-side routing.
- **Lucide React**: Icon library for intuitive UI elements.
- **Tailwind CSS / Custom CSS**: (Based on the modern UI components).

## 📁 Project Structure

```bash
/
├── frontend/             # React (Vite) Frontend Application
│   ├── src/              # React components, pages, context, and assets
│   ├── public/           # Static files
│   └── package.json      # Frontend dependencies
├── controllers/          # Backend Express Controllers
├── routes/               # Express API Routes (auth, vehicles, trips, etc.)
├── middleware/           # Express Middleware (authentication)
├── db.js                 # PostgreSQL connection setup
├── schema.sql            # Database schema definitions
├── server.js             # Express application entry point
├── package.json          # Backend dependencies
└── .env                  # Environment variables (not tracked in Git)
```

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database

### 1. Database Setup
1. Create a PostgreSQL database.
2. Execute the `schema.sql` (and optionally `seed.sql`/`seed_logical_data.sql`) to set up your tables and sample data.

### 2. Backend Setup
1. Clone the repository and navigate to the root directory.
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and configure the following variables:
   ```env
   PORT=5000
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 🌐 API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **Dashboard**: `/api/dashboard`
- **Vehicles**: `/api/vehicles` (Protected)
- **Drivers**: `/api/drivers` (Protected)
- **Trips**: `/api/trips` (Protected)
- **Maintenance**: `/api/maintenance` (Protected)
- **Fuel**: `/api/fuel` (Protected)
- **Analytics & Safety**: `/api/analytics`, `/api/safety`

## 📄 License
ISC License
