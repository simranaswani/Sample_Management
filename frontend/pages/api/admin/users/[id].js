import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

async function isAdmin(req) {
    const { token } = req.cookies;
    if (!token) return false;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        return user && user.role === 'admin';
    } catch (error) {
        return false;
    }
}

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        await connectDB();

        if (!(await isAdmin(req))) {
            return res.status(403).json({ success: false, error: 'Not authorized as admin' });
        }

        if (req.method === 'PUT') {
            const { isApproved, role } = req.body;
            const updateData = {};
            if (isApproved !== undefined) updateData.isApproved = isApproved;
            if (role !== undefined) updateData.role = role;

            const user = await User.findByIdAndUpdate(id, updateData, { new: true });
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            return res.status(200).json({ success: true, user });
        }

        if (req.method === 'DELETE') {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            return res.status(200).json({ success: true, message: 'User deleted' });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
}
