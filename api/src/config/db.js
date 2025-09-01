const dotenv = require("dotenv")
dotenv.config({path:'./.env'})
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});
async function runMigration() {
    console.log('🔍 Checking for migrations...');
    const migrationFilePath = path.join(__dirname, '../../database/migrations/001_initial_schema.sql');
    if (!fs.existsSync(migrationFilePath)) {
        console.error('Migration file not found!');
        return;
    }
    const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');
    const connection = await pool.getConnection();
    try {
        console.log('Applying migration...');
        await connection.query(migrationSQL);
        console.log('Migration applied successfully.');
    } catch (error) {
        console.error('Failed to apply migration:', error);
    } finally {
        connection.release();
        pool.end();
    }
}
module.exports = { pool, runMigration };
