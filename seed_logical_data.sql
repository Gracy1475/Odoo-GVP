-- Clear Existing Data and Reset IDs
TRUNCATE TABLE safety_events RESTART IDENTITY CASCADE;
TRUNCATE TABLE fuel_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE maintenance_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE trips RESTART IDENTITY CASCADE;
TRUNCATE TABLE drivers RESTART IDENTITY CASCADE;
TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE;

-- 1. Seed Vehicles
INSERT INTO vehicles (plate_number, model, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, region, status, last_service_date, last_service_odometer) VALUES
('GJ-01-AX-1010', 'Tata Prima 4028.S', 'Truck', 40000, 125000, 3500000, 'West Zone', 'Available', '2025-12-15', 120000), -- ID: 1
('GJ-01-BY-2020', 'Mahindra Blazo X', 'Truck', 35000, 88500, 3200000, 'West Zone', 'Available', '2025-08-01', 75000),   -- ID: 2
('MH-02-CZ-3030', 'Ashok Leyland 3520', 'Truck', 35000, 210000, 3000000, 'North Zone', 'In Shop', '2025-06-10', 200000), -- ID: 3
('DL-03-DE-4040', 'BharatBenz 2823R', 'Truck', 28000, 45000, 2800000, 'North Zone', 'On Trip', '2026-01-20', 40000),  -- ID: 4
('KA-05-FG-5050', 'Eicher Pro 6035', 'Truck', 35000, 12000, 3800000, 'South Zone', 'Available', '2026-02-01', 0);      -- ID: 5

-- 2. Seed Drivers
INSERT INTO drivers (full_name, license_number, license_expiry, safety_score, status) VALUES
('Rajesh Kumar', 'DL-1234567890', '2028-10-15', 95, 'On Duty'),     -- ID: 1
('Amit Sharma', 'DL-0987654321', '2027-05-20', 88, 'On Duty'),      -- ID: 2
('Suresh Raina', 'DL-5556667778', '2026-12-30', 72, 'On Trip'),     -- ID: 3
('Vijay Singh', 'DL-1112223334', '2024-01-01', 98, 'Off Duty'),      -- ID: 4 (Expired)
('Deepak Patel', 'DL-9998887776', '2029-02-15', 100, 'On Duty');    -- ID: 5

-- 3. Seed Trips
INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, revenue, status, dispatch_date, completion_date, end_odometer) VALUES
(1, 1, 38000, 45000, 'Completed', '2026-02-10 08:00:00', '2026-02-12 18:00:00', 125000),
(2, 2, 32000, 38000, 'Completed', '2026-02-05 09:00:00', '2026-02-07 14:00:00', 88500),
(4, 3, 25000, 40000, 'Dispatched', '2026-02-21 06:00:00', NULL, NULL);

-- 4. Seed Maintenance Logs
INSERT INTO maintenance_logs (vehicle_id, service_type, description, cost, odometer_at_service, service_date) VALUES
(1, 'Routine Service', 'Engine Oil & Filter Change', 12000, 120000, '2025-12-15'),
(2, 'Repair', 'Brake Pad Replacement', 8500, 75000, '2025-08-01'),
(3, 'Emergency Repair', 'Major Overhaul (Transmission)', 45000, 200000, '2025-06-10');

-- 5. Seed Fuel Logs
INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, odometer_reading, log_date) VALUES
(1, 1, 450, 40500, 124500, '2026-02-11'),
(2, 2, 380, 34200, 88200, '2026-02-06');

-- 6. Seed Safety Events
INSERT INTO safety_events (driver_id, vehicle_id, trip_id, event_type, severity, description, event_date) VALUES
(3, 4, 3, 'Speeding', 'Medium', 'Exceeded 80km/h in 60km/h zone on NH48', '2026-02-21 10:15:00'),
(2, 2, 2, 'Hard Braking', 'Low', 'Sudden stop at intersection', '2026-02-06 15:30:00');
