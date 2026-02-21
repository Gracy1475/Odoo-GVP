const fs = require('fs');
const db = require('./db');

async function runSqlFile(filePath) {
    console.log(`Executing ${filePath}...`);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split by DO blocks or simple semicolons (very basic parser)
    // Note: This is an simplification. A better approach is to use the full string if the driver supports multiple statements.
    // pg driver query can handle multiple statements if they are semicolon-separated.

    try {
        await db.query(sql);
        console.log(`Successfully executed ${filePath}`);
    } catch (err) {
        console.error(`Error executing ${filePath}:`, err.message);
        // If it fails due to multiple statements, we might need to split it, 
        // but often pg can handle it if the DB user has permissions.
    }
}

async function main() {
    try {
        await runSqlFile('schema.sql');
        await runSqlFile('seed_logical_data.sql');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

main();
