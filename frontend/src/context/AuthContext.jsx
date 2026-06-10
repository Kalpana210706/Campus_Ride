import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Jab bhi token badlega, use axios defaults mein set karenge
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            
            // Token se user ki info fetch karna (Optional parse layer)
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(window.atob(base64));
                setUser({ id: payload.id, role: payload.role }); // assuming token payloads have id & role
            } catch (e) {
                console.error("Token decode error:", e);
            }
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    // Login function backend link karne ke liye
    const login = async (email, password) => {
        try {
            const res = await axios.post('https://campus-ride-ov94.onrender.com/api/auth/login', { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            return { success: true, role: res.data.user.role };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || "Login failed" };
        }
    };

    // Logout function
    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};