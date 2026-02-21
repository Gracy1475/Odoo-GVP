-- FleetFlow Sample Data (Seed File)

-- 1. Sample Vehicles
INSERT INTO vehicles (plate_number, model, vehicle_type, max_load_capacity_kg, acquisition_cost, status, region)
VALUES 
('GJ-01-AX-1234', 'Tata Prima 4028.S', 'Truck', 40000.00, 3500000.00, 'Available', 'North'),
('MH-02-BZ-5678', 'Mahindra Blazo X 35', 'Truck', 35000.00, 3200000.00, 'On Trip', 'West'),
('DL-03-CY-9012', 'Ashok Leyland Ecomet', 'Truck', 15000.00, 1800000.00, 'Available', 'North'),
('KA-04-DV-3456', 'Force Traveler 3350', 'Van', 3000.00, 1200000.00, 'In Shop', 'South'),
('TN-05-EW-7890', 'Piaggio Ape Xtra LDX', 'Bike', 500.00, 250000.00, 'Available', 'South');

-- 2. Sample Drivers
INSERT INTO drivers (full_name, license_number, license_expiry, safety_score, status)
VALUES 
('Rajesh Kumar', 'DL-RJK-2024-001', '2028-12-31', 95, 'On Duty'),
('Suresh Raina', 'MH-SUR-2023-042', '2027-06-15', 88, 'On Trip'),
('Amit Pathak', 'UP-AMT-2021-099', '2025-03-20', 72, 'Off Duty'),
('Vikas Singh', 'KA-VIK-2022-777', '2026-09-10', 92, 'Suspended'),
('Deepak Verma', 'GJ-DEP-2025-111', '2030-01-01', 100, 'On Duty');
