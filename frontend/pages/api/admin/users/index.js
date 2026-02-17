import connectDB from '../../../../lib/db';
import User from '../../../../models/User';
import jwt from 'jsonwebtoken';

/**
 * Middleware to check if user is admin
 */
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
    try {
        await connectDB();

        if (!(await isAdmin(req))) {
            return res.status(403).json({ success: false, error: 'Not authorized as admin' });
        }

        if (req.method === 'GET') {
            const users = await User.find({}).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, users });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
}
