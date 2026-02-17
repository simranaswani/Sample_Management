import connectDB from '../../../lib/db';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
        });

        // User is created with isApproved: false by default (from model)

        res.status(201).json({
            success: true,
            message: 'Account created successfully. Your account is pending approval by an administrator. You will be able to log in once approved.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
}
