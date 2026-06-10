import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Router Navigation import kiya
import axios from 'axios';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate(); // Hook initializer
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('passenger');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        vehicleType: 'E-Rickshaw',
        vehicleNumber: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Global Redirection Handler Helper
    const handleRoleRedirection = (userRole) => {
        if (userRole === 'driver') {
            navigate('/driver-dashboard');
        } else {
            navigate('/passenger-dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login Workflow
                const result = await login(formData.email, formData.password);
                if (!result.success) {
                    setError(result.error);
                } else {
                    setMessage(`Logged in successfully!`);
                    
                    // Token parse karke user role detect karo local storage backup se
                    const savedUser = JSON.parse(localStorage.getItem('user'));
                    const finalRole = savedUser?.role || role;
                    
                    setTimeout(() => handleRoleRedirection(finalRole), 800);
                }
            } else {
                // Registration Workflow
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role,
                    ...(role === 'driver' && {
                        vehicleInfo: {
                            vehicleType: formData.vehicleType,
                            vehicleNumber: formData.vehicleNumber
                        }
                    })
                };

                const res = await axios.post('https://campus-ride-ov94.onrender.com/api/auth/register', payload);
                setMessage(res.data.message || "Registered successfully! Logging you in...");
                
                // Auto login immediate execution
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    setTimeout(() => handleRoleRedirection(role), 1000);
                } else {
                    setIsLogin(true);
                }
            }
        } catch (err) {
            console.error("Auth Error:", err);
            setError(err.response?.data?.message || "Something went wrong. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#1f2937' }}>
                    {isLogin ? 'Campus Ride Login' : 'Create Campus Account'}
                </h2>

                {error && <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
                {message && <div style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
                        <button type="button" onClick={() => setRole('passenger')} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: role === 'passenger' ? '#2563eb' : '#ffffff', color: role === 'passenger' ? '#ffffff' : '#374151', cursor: 'pointer', transition: 'all 0.2s' }}>Passenger</button>
                        <button type="button" onClick={() => setRole('driver')} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: role === 'driver' ? '#2563eb' : '#ffffff', color: role === 'driver' ? '#ffffff' : '#374151', cursor: 'pointer', transition: 'all 0.2s' }}>Driver</button>
                    </div>

                    {!isLogin && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', color: '#4b5563' }}>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#4b5563' }}>Campus Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', color: '#4b5563' }}>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                    </div>

                    {!isLogin && role === 'driver' && (
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '20px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', color: '#4b5563' }}>Vehicle Type</label>
                                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                                    <option value="E-Rickshaw">E-Rickshaw</option>
                                    <option value="Bicycle">Bicycle</option>
                                    <option value="Scooty">Scooty</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', color: '#4b5563' }}>Vehicle Number / ID</label>
                                <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="e.g. UK-08-ER-1234" required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #d1d5db' }} />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '4px', backgroundColor: loading ? '#9ca3af' : '#10b981', color: '#ffffff', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
                    {isLogin ? "New to the platform? " : "Already have an account? "}
                    <span onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLogin ? 'Register Here' : 'Login Here'}
                    </span>
                </p>
            </div>
        </div>
    );
}