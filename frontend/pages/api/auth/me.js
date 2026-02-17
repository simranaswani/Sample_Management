import connectDB from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    try {
        await connectDB();

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
}
