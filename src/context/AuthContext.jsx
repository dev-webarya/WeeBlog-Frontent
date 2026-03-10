import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('userToken'));
    const [loading, setLoading] = useState(true);

    const isLoggedIn = !!token && !!user;

    // On mount: if we have a token, fetch user profile
    useEffect(() => {
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }

        // Listen for logouts from other tabs or admin login overrides
        const syncStorage = () => {
            const currentToken = localStorage.getItem('userToken');
            if (!currentToken && token) {
                setToken(null);
                setUser(null);
            }
        };
        window.addEventListener('storage', syncStorage);
        return () => window.removeEventListener('storage', syncStorage);
    }, [token]);

    const fetchProfile = async () => {
        try {
            const { default: api } = await import('../api/api');
            const response = await api.get('/api/account/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch {
            // Token expired or invalid
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = (jwt, userData) => {
        // Enforce strict segregation: if a user logs in, nuke the admin session
        localStorage.removeItem('adminAuth');
        window.dispatchEvent(new Event('storage'));

        localStorage.setItem('userToken', jwt);
        setToken(jwt);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn, loading, login, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useUserAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useUserAuth must be used within AuthProvider');
    return context;
};
