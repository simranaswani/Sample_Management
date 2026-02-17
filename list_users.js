const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'frontend', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function listUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
