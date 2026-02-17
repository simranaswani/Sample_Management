import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    // Clear cookie
    const cookie = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(0),
        path: '/',
    });

    res.setHeader('Set-Cookie', cookie);

    res.status(200).json({ success: true, message: 'Logged out successfully' });
}
