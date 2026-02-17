import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isApproved: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const res = await axios.get('/api/auth/me');
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            if (res.data.success) {
                setUser(res.data.user);
                router.push('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/auth/signup', { name, email, password });
            if (res.data.success) {
                return res.data;
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Signup failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
            router.push('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
