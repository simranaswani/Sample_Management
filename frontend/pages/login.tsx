import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import AllenJorgioLogo from '../src/components/AllenJorgioLogo';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (err) {
            // Error is handled by AuthContext
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Head>
                <title>Login | Allen Jorgio</title>
            </Head>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
                style={{ width: '100%', maxWidth: '420px' }}
            >
                <div className="glass-morphism overflow-hidden rounded-2xl shadow-xl bg-white" style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}>
                    <div className="p-8 md:p-10" style={{ padding: '40px' }}>
                        <div className="mb-8 flex flex-col items-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                            <AllenJorgioLogo className="mb-6" size="lg" />
                            <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '28px', fontWeight: '800', margin: '20px 0 8px', color: '#111827' }}>Welcome Back</h1>
                            <p className="text-gray-500" style={{ color: '#6b7280', textAlign: 'center', fontSize: '15px' }}>Log in to manage your samples</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100" style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1px solid #fee2e2', lineHeight: '1.5' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>
                                <div className="relative" style={{ position: 'relative' }}>
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                        <Mail size={19} />
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="auth-input"
                                        style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', transition: 'all 0.2s', outline: 'none' }}
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <div className="relative" style={{ position: 'relative' }}>
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                        <Lock size={19} />
                                    </span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="auth-input"
                                        style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', transition: 'all 0.2s', outline: 'none' }}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-auth mt-2"
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', transition: 'transform 0.2s' }}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" style={{ height: '22px', width: '22px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <LogIn size={20} />
                                        <span>Sign In</span>
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center text-sm text-gray-500" style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                            Don't have an account?{' '}
                            <Link
                                href="/register"
                                className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
                                style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}
                            >
                                Create one now
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
