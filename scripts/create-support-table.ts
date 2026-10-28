import 'dotenv/config';
import mysql from 'mysql2/promise';
import { requireEnv } from '../src/env';

async function main() {
  console.log("Starting script to create supportTickets table...");
  
  try {
    // Log environment variables (without revealing sensitive data)
    console.log(`Connecting to database at ${process.env.DB_HOST || 'undefined host'}`);
    console.log(`Using database: ${process.env.DB_SCHEMA || 'undefined schema'}`);
    
    // Connect to database
    const connection = await mysql.createConnection({
      host: requireEnv('DB_HOST'),
      user: requireEnv('DB_USER'),
      password: requireEnv('DB_PASS'),
      database: requireEnv('DB_SCHEMA'),
    });

    // SQL to create the supportTickets table
    const createTableSQL = `
CREATE TABLE IF NOT EXISTS supportTickets (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  userId VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  contactEmail VARCHAR(255),
  createdAt TIMESTAMP NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL,
  responseMessage TEXT,
  respondedBy VARCHAR(255),
  respondedAt TIMESTAMP NULL,
  resolvedAt TIMESTAMP NULL,
  reviewedAt TIMESTAMP NULL,
  closedAt TIMESTAMP NULL
);`;

    console.log("Creating supportTickets table with SQL:");
    console.log(createTableSQL);
    
    // Execute the create table SQL
    const [result] = await connection.query(createTableSQL);
    console.log("Query executed. Result:", result);
    console.log("Support tickets table created successfully!");
    
    await connection.end();
  } catch (error) {
    console.error("Error in script:", error);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});