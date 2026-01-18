
import dbConnect from './lib/db';
import User from './models/User';

async function check() {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    await dbConnect();
    const users = await User.find();
    console.log('Seeded Users in DB:', JSON.stringify(users, null, 2));
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
