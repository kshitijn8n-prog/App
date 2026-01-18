
const mongoose = require('mongoose');

async function checkUsers() {
    await mongoose.connect('mongodb://localhost:27017/nest'); // Assuming db is 'nest' or default 'test'
    const UserSchema = new mongoose.Schema({
        email: String,
        name: String
    }, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const users = await User.find({});
    console.log('Seeded Users:', users.map(u => ({ email: u.email, name: u.name })));
    process.exit(0);
}

checkUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
