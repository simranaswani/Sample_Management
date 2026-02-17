import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, UserX, Shield, Trash2, Mail, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { useAuth } from '../../src/context/AuthContext';
import { toast } from 'react-toastify';

const UserManagementPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            if (res.data.success) {
                setUsers(res.data.users);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, currentStatus: boolean) => {
        try {
            const res = await axios.put(`/api/admin/users/${id}`, { isApproved: !currentStatus });
            if (res.data.success) {
                toast.success(currentStatus ? 'User unapproved' : 'User approved successfully');
                setUsers(users.map(u => u._id === id ? { ...u, isApproved: !currentStatus } : u));
            }
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await axios.delete(`/api/admin/users/${id}`);
            if (res.data.success) {
                toast.success('User deleted');
                setUsers(users.filter(u => u._id !== id));
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleRoleToggle = async (id: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const res = await axios.put(`/api/admin/users/${id}`, { role: newRole });
            if (res.data.success) {
                toast.success(`User role updated to ${newRole}`);
                setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            toast.error('Role update failed');
        }
    };

    if (currentUser?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Head>
                    <title>User Management | Admin</title>
                </Head>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                                <Users className="text-blue-600" />
                                User Management
                            </h1>
                            <p className="text-gray-500 mt-1">Review account requests and manage permissions</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">Total Users</span>
                                <span className="text-lg font-bold text-gray-900">{users.length}</span>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-blue-500 font-medium">Pending</span>
                                <span className="text-lg font-bold text-blue-600">{users.filter(u => !u.isApproved).length}</span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <AnimatePresence>
                                {users.map((u, index) => (
                                    <motion.div
                                        key={u._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-white rounded-2xl p-6 shadow-sm border ${!u.isApproved ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100'} hover:shadow-md transition-shadow`}
                                    >
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <Users size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                        {u.name}
                                                        {u.role === 'admin' && (
                                                            <span className="bg-indigo-100 text-indigo-700 text-[10px] uppercase tracking-wider font-heavy px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                <Shield size={10} /> Admin
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1.5 font-medium"><Mail size={14} /> {u.email}</span>
                                                        <span className="flex items-center gap-1.5"><Clock size={14} /> Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {!u.isApproved ? (
                                                    <button
                                                        onClick={() => handleApprove(u._id, u.isApproved)}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                                                    >
                                                        <UserCheck size={18} /> Approve Account
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApprove(u._id, u.isApproved)}
                                                        className="flex items-center gap-2 px-4 py-2 text-amber-600 bg-amber-50 rounded-xl font-bold text-sm hover:bg-amber-100 transition-colors"
                                                    >
                                                        <UserX size={18} /> Suspend
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleRoleToggle(u._id, u.role)}
                                                    className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors title='Toggle Admin Role'"
                                                >
                                                    <Shield size={20} />
                                                </button>

                                                {u._id !== currentUser.id && (
                                                    <button
                                                        onClick={() => handleDelete(u._id)}
                                                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors title='Delete Account'"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}

                                                {u.isApproved && (
                                                    <div className="flex items-center gap-1 text-green-600 font-bold text-sm px-3 py-1 bg-green-50 rounded-full">
                                                        <CheckCircle size={14} /> Active
                                                    </div>
                                                )}
                                                {!u.isApproved && (
                                                    <div className="flex items-center gap-1 text-amber-600 font-bold text-sm px-3 py-1 bg-amber-50 rounded-full">
                                                        <AlertCircle size={14} /> Pending
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
};

export default UserManagementPage;
