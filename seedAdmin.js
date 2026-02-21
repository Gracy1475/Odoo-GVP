const db = require('./db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        const username = 'admin';
        const password = 'admin123';
        const role = 'Admin';
        const full_name = 'Fleet Administrator';

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await db.query(`
      INSERT INTO users (username, password_hash, role, full_name)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) DO NOTHING
    `, [username, password_hash, role, full_name]);

        console.log('Admin user seeded: admin / admin123');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
};

seedAdmin();
