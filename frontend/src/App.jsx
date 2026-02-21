import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import VehicleRegistry from './pages/VehicleRegistry';
import DriverProfiles from './pages/DriverProfiles';
import TripDispatcher from './pages/TripDispatcher';
import MaintenanceLogs from './pages/MaintenanceLogs';
import FuelLogs from './pages/FuelLogs';
import CommandCenter from './pages/CommandCenter';
import OperationalAnalytics from './pages/OperationalAnalytics';
import SafetyProfiles from './pages/SafetyProfiles';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<CommandCenter />} />
                            <Route path="vehicles" element={<VehicleRegistry />} />
                            <Route path="drivers" element={<DriverProfiles />} />
                            <Route path="dispatch" element={<TripDispatcher />} />
                            <Route path="maintenance" element={<MaintenanceLogs />} />
                            <Route path="fuel" element={<FuelLogs />} />
                            <Route path="analytics" element={<OperationalAnalytics />} />
                            <Route path="safety" element={<SafetyProfiles />} />
                            <Route path="*" element={<div>404 Page Not Found</div>} />
                        </Route>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
