const { Pool } = require('pg');
require('dotenv').config();

console.log('Connecting to:', process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('Connected to the FleetFlow Database');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
