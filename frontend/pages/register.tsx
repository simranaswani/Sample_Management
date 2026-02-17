import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import AllenJorgioLogo from '../src/components/AllenJorgioLogo';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { signup, error, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await signup(name, email, password);
            if (data?.success) {
                setIsSubmitted(true);
            }
        } catch (err) {
            // Error is handled by AuthContext
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                <Head>
                    <title>Request Received | Allen Jorgio</title>
                </Head>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 text-center"
                    style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6" style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Mail size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: '#111827' }}>Request Received!</h2>
                    <p className="text-gray-600 mb-8" style={{ color: '#4b5563', marginBottom: '32px', lineHeight: '1.6' }}>
                        Your account has been created and is now <strong>pending approval</strong> by an administrator. You will be able to log in once your request is reviewed.
                    </p>
                    <Link href="/login" className="btn-auth inline-block w-full text-center" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer', textDecoration: 'none', fontSize: '16px' }}>
                        Return to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <Head>
                <title>Register | Allen Jorgio</title>
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
                            <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '28px', fontWeight: '800', margin: '20px 0 8px', color: '#111827' }}>Create Account</h1>
                            <p className="text-gray-500" style={{ color: '#6b7280', textAlign: 'center', fontSize: '15px' }}>Join the sample management system</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100" style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center', border: '1px solid #fee2e2', lineHeight: '1.5' }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label className="block text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>
                                <div className="relative" style={{ position: 'relative' }}>
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                                        <User size={19} />
                                    </span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="auth-input"
                                        style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '15px', transition: 'all 0.2s', outline: 'none' }}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

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
                                        minLength={6}
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
                                        <UserPlus size={20} />
                                        <span>Create Account</span>
                                    </div>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center text-sm text-gray-500" style={{ marginTop: '40px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
                                style={{ color: '#2563eb', fontWeight: '700', textDecoration: 'none' }}
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
