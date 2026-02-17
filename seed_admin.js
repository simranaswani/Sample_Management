const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'frontend', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'admin' },
});

// Encrypt password using bcrypt - COPIED FROM User.js to ensure consistency if running outside Next.js context
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@allenjorgio.com';
        await User.deleteOne({ email });
        console.log('Existing admin deleted');

        // Just pass the PLAIN password. The pre-save hook will hash it.
        await User.create({
            name: 'Admin',
            email,
            password: 'admin123',
            role: 'admin',
            isApproved: true,
        });

        console.log('Admin user recreated successfully with correct hashing!');
        console.log('Email: admin@allenjorgio.com');
        console.log('Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
