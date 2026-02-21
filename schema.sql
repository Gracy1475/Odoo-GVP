-- FleetFlow Database Schema Cleanup (Optional: uncomment if you want to start fresh)
-- DROP TABLE IF EXISTS fuel_logs;
-- DROP TABLE IF EXISTS maintenance_logs;
-- DROP TABLE IF EXISTS trips;
-- DROP TABLE IF EXISTS drivers;
-- DROP TABLE IF EXISTS vehicles;
-- DROP TYPE IF EXISTS vehicle_status;
-- DROP TYPE IF EXISTS vehicle_type;
-- DROP TYPE IF EXISTS driver_status;
-- DROP TYPE IF EXISTS trip_status;

-- 1. Create Enums (Using DO block to avoid 'already exists' error)
DO $$ BEGIN
    CREATE TYPE vehicle_status AS ENUM ('Available', 'On Trip', 'In Shop', 'Retired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE vehicle_type AS ENUM ('Truck', 'Van', 'Bike');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE driver_status AS ENUM ('On Duty', 'Off Duty', 'Suspended', 'On Trip');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE trip_status AS ENUM ('Draft', 'Dispatched', 'Completed', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Admin', 'Dispatcher', 'Manager');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'Dispatcher',
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(50) NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    max_load_capacity_kg DECIMAL(10, 2) NOT NULL,
    odometer_km INT DEFAULT 0,
    acquisition_cost DECIMAL(12, 2) NOT NULL,
    status vehicle_status DEFAULT 'Available',
    region VARCHAR(50),
    last_service_date DATE,
    last_service_odometer INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    safety_score INT DEFAULT 100 CHECK (safety_score >= 0 AND safety_score <= 100),
    status driver_status DEFAULT 'Off Duty',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    driver_id INT REFERENCES drivers(id),
    cargo_weight_kg DECIMAL(10, 2) NOT NULL,
    origin_address TEXT,
    destination_address TEXT,
    revenue DECIMAL(12, 2) DEFAULT 0.00,
    status trip_status DEFAULT 'Draft',
    start_odometer INT,
    end_odometer INT,
    dispatch_date TIMESTAMP,
    completion_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT weight_check CHECK (cargo_weight_kg > 0)
);

-- 5. Maintenance Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    service_type VARCHAR(100),
    category VARCHAR(50) DEFAULT 'Repair', -- Preventive, Repair, Emergency
    description TEXT,
    cost DECIMAL(12, 2) NOT NULL,
    odometer_at_service INT,
    service_date DATE NOT NULL,
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Fuel & Expense Logs
CREATE TABLE IF NOT EXISTS fuel_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INT REFERENCES vehicles(id),
    trip_id INT REFERENCES trips(id),
    liters DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(12, 2) NOT NULL,
    odometer_reading INT,
    log_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Driver Safety Events
CREATE TABLE IF NOT EXISTS safety_events (
    id SERIAL PRIMARY KEY,
    driver_id INT REFERENCES drivers(id),
    vehicle_id INT REFERENCES vehicles(id),
    trip_id INT REFERENCES trips(id),
    event_type VARCHAR(50) NOT NULL, -- e.g., 'Speeding', 'Hard Braking', 'Sudden Acceleration'
    severity VARCHAR(20) DEFAULT 'Low', -- Low, Medium, High
    description TEXT,
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
