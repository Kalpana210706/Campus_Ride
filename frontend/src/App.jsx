import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import PassengerDashboard from './pages/PassengerDashboard';
import DriverDashboard from './pages/DriverDashboard'; // Actual file imported

// Protected Route Shield Component
const ProtectedRoute = ({ children, allowedRole }) => {
    const { token, user } = useContext(AuthContext);
    
    // Check if token exists in session layer
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Dynamic role parsing fallback check
    if (allowedRole && user && user.role !== allowedRole) {
        return <Navigate to={user.role === 'driver' ? '/driver-dashboard' : '/passenger-dashboard'} replace />;
    }

    return children;
};

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Auth Screen Entry point */}
                <Route path="/login" element={<Login />} />
                
                {/* Shield-protected Passenger Terminal */}
                <Route 
                    path="/passenger-dashboard" 
                    element={
                        <ProtectedRoute allowedRole="passenger">
                            <PassengerDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Shield-protected Driver Terminal */}
                <Route 
                    path="/driver-dashboard" 
                    element={
                        <ProtectedRoute allowedRole="driver">
                            <DriverDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Catch-all global wildcard router redirection */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}