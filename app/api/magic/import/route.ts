import { mtgMeta } from "@/drizzle/schema";
import { serverEnv } from "@/src/env";
import fs, { createReadStream, createWriteStream } from 'fs';
import fsPromises from 'fs/promises';
import mysql from "mysql2/promise";
import { requireRole } from "@/src/lib/auth/dal";
import { ROLES } from "@/src/lib/auth/roles";
import { NextRequest, NextResponse } from "next/server";
import os from 'os';
import path from 'path';
import { performance } from 'perf_hooks';
import readline from 'readline';
import db from "../../../../src/db/mysql";

// Export the runtime configuration for Next.js
export const runtime = 'nodejs';

// Path to the SQL import file
const SQL_IMPORT_FILE_PATH = path.join(process.cwd(), 'importdata', 'AllPrintings.sql');

const dbSchema = serverEnv('DB_SCHEMA');

// Create a dedicated MySQL connection pool for executing SQL imports
const importPool = mysql.createPool({
  host: serverEnv('DB_HOST'),
  user: serverEnv('DB_USER'),
  password: serverEnv('DB_PASS'),
  database: dbSchema,
  // Set appropriate connection limits for large imports
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectAttributes: {}
});

// Set max allowed packet size after connection
importPool.on('connection', async (connection) => {
  try {
    await connection.execute('SET GLOBAL max_allowed_packet = ?', [1024 * 1024 * 16]); // 16MB
  } catch (error) {
    console.warn('Failed to set max_allowed_packet:', error);
  }
});

/**
 * Helper to format milliseconds into a readable duration string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

/**
 * Progress reporter class that can be used to stream updates to the browser
 */
class ProgressReporter {
  private encoder: TextEncoder;
  private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private startTime: number;
  private lastReportTime: number;
  
  constructor() {
    this.encoder = new TextEncoder();
    this.startTime = performance.now();
    this.lastReportTime = this.startTime;
  }
  
  /**
   * Set the stream controller for sending updates
   */
  setController(controller: ReadableStreamDefaultController<Uint8Array>) {
    this.controller = controller;
    this.reportWithTimestamp("Starting MTG import process...");
    this.sendHtml("<html><head><title>MTG Import Progress</title>");
    this.sendHtml("<style>");
    this.sendHtml("body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 2rem; background-color: #f5f5f5; color: #333; }");
    this.sendHtml("h1 { color: #0066cc; }");
    this.sendHtml(".log { background-color: #fff; border-left: 4px solid #0066cc; padding: 1rem; margin-bottom: 0.5rem; border-radius: 0 4px 4px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }");
    this.sendHtml(".timestamp { color: #666; font-size: 0.9em; margin-right: 0.5rem; }");
    this.sendHtml(".error { border-left-color: #cc0000; background-color: #fff5f5; }");
    this.sendHtml(".success { border-left-color: #00cc66; background-color: #f5fff8; }");
    this.sendHtml(".progress { height: 20px; background-color: #e0e0e0; border-radius: 10px; margin: 1rem 0; overflow: hidden; }");
    this.sendHtml(".progress-bar { height: 100%; background-color: #0066cc; width: 0%; transition: width 0.3s; }");
    this.sendHtml("</style></head><body>");
    this.sendHtml("<h1>MTG Database Import Progress</h1>");
    this.sendHtml("<div id='progress' class='progress'><div id='progress-bar' class='progress-bar' style='width:0%'></div></div>");
    this.sendHtml("<div id='logs'>");
  }
  
  /**
   * Reports a progress message with elapsed time since last report
   */
  report(message: string, isError: boolean = false, progress?: number) {
    if (!this.controller) return;
    
    const now = performance.now();
    const elapsedSinceStart = now - this.startTime;
    const elapsedSinceLast = now - this.lastReportTime;
    this.lastReportTime = now;
    
    const timestamp = new Date().toISOString();
    const elapsed = formatDuration(elapsedSinceStart);
    const step = formatDuration(elapsedSinceLast);
    
    const logMessage = `[${timestamp}] (Total: ${elapsed}, Step: ${step}) ${message}`;
    console.log(logMessage);
    
    const className = isError ? 'log error' : 'log';
    this.sendHtml(`<div class="${className}"><span class="timestamp">[${timestamp}]</span> ${message}<br><small>Step: ${step}, Total: ${elapsed}</small></div>`);
    
    if (typeof progress === 'number') {
      const percentage = Math.min(Math.max(progress, 0), 100);
      this.sendHtml(`<script>document.getElementById('progress-bar').style.width = '${percentage}%';</script>`);
    }
  }
  
  /**
   * Reports a timestamped message
   */
  reportWithTimestamp(message: string, isError: boolean = false, progress?: number) {
    this.report(message, isError, progress);
  }
  
  /**
   * Reports an error message
   */
  reportError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    this.reportWithTimestamp(`ERROR: ${message}`, true);
  }
  
  /**
   * Reports successful completion
   */
  reportSuccess(message: string) {
    const totalTime = performance.now() - this.startTime;
    const totalTimeFormatted = formatDuration(totalTime);
    const successMsg = `${message} (Completed in ${totalTimeFormatted})`;
    
    this.reportWithTimestamp(successMsg, false, 100);
    this.sendHtml("<div class='log success'><strong>Import Complete!</strong><br>" + 
                  `<span>Total execution time: ${totalTimeFormatted}</span></div>`);
    this.sendHtml("</div></body></html>");
  }
  
  /**
   * Send raw HTML to the stream
   */
  private sendHtml(html: string) {
    if (!this.controller) return;
    this.controller.enqueue(this.encoder.encode(html));
  }
  
  /**
   * Create a response stream
   */
  createStream(): Response {
    const stream = new ReadableStream({
      start: (controller) => {
        this.setController(controller);
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

/**
 * Processes a SQL line to add mtg. prefix to table names
 * @param line A single line from the SQL file
 * @returns Modified line with prefixed table names
 */
function processLine(line: string): string {
  // Patterns for different SQL operations that reference table names
  const patterns = [
    { regex: /(CREATE\s+TABLE\s+`)([^`]+)(`)/i, position: 2 },
    { regex: /(INSERT\s+INTO\s+`)([^`]+)(`)/i, position: 2 },
    { regex: /(ALTER\s+TABLE\s+`)([^`]+)(`)/i, position: 2 },
    { regex: /(FOREIGN\s+KEY\s+.*REFERENCES\s+`)([^`]+)(`)/i, position: 2 }
  ];

  // Process each pattern
  let modifiedLine = line;
  for (const pattern of patterns) {
    modifiedLine = modifiedLine.replace(pattern.regex, (match, prefix, tableName, suffix) => {
      if (tableName.startsWith('mtg.')) {
        return match;
      }
      return `${prefix}${tableName}${suffix}`;
    });
  }

  return modifiedLine;
}

/**
 * Extract table names from the SQL file
 * @returns Array of table names found in CREATE TABLE statements
 */
async function extractTableNames(progress: ProgressReporter): Promise<string[]> {
  const startTime = performance.now();
  progress.reportWithTimestamp("Scanning SQL file for table definitions...", false, 5);
  
  // Check if the file exists and has content
  if (!fs.existsSync(SQL_IMPORT_FILE_PATH)) {
    progress.reportError(`SQL file not found at ${SQL_IMPORT_FILE_PATH}`);
    return [];
  }
  
  const stats = await fsPromises.stat(SQL_IMPORT_FILE_PATH);
  if (stats.size === 0) {
    progress.reportError("SQL file exists but is empty");
    return [];
  }
  
  progress.reportWithTimestamp(`SQL file found with size: ${formatFileSize(stats.size)}`, false, 6);
  
  const fileStream = createReadStream(SQL_IMPORT_FILE_PATH, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const tableNames: string[] = [];
  // More flexible regex patterns to match different CREATE TABLE formats
  const createTableRegex = [
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`([^`]+)`/i,  // Backtick quoted names
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)/i,   // Unquoted names
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"([^"]+)"/i,   // Double-quote quoted names
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?'([^']+)'/i    // Single-quote quoted names
  ];

  let lineCount = 0;
  let createTableLinesFound = 0;
  
  for await (const line of rl) {
    lineCount++;
    
    if (line.toUpperCase().includes('CREATE TABLE')) {
      createTableLinesFound++;
      progress.reportWithTimestamp(`Found potential CREATE TABLE on line ${lineCount}: ${line.substring(0, 100)}...`, false, 7);
      
      // Try each regex pattern
      let tableNameFound = false;
      for (const regex of createTableRegex) {
        const match = regex.exec(line);
        if (match && match[1]) {
          const tableName = match[1].trim();
          progress.reportWithTimestamp(`Extracted table name: ${tableName}`, false, 8);

          // The dump is third-party input and these names are later concatenated
          // into DDL identifiers (see renameTables), where a backtick would break
          // out of the quoting. Accept only plain identifiers; MTGJSON's own table
          // names all qualify.
          if (!/^[A-Za-z0-9_]+$/.test(tableName)) {
            progress.reportWithTimestamp(
              `Skipping table with unsupported name: ${tableName.substring(0, 60)}`, false, 8
            );
            continue;
          }

          if (!tableName.startsWith('mtg.')) {
            tableNames.push(tableName);
            tableNameFound = true;
            break;
          }
        }
      }
      
      if (!tableNameFound) {
        progress.reportWithTimestamp(`Could not extract table name from line: ${line.substring(0, 100)}...`, false, 8);
      }
    }
  }

  const duration = performance.now() - startTime;
  progress.reportWithTimestamp(
    `Scanned ${lineCount} lines, found ${createTableLinesFound} CREATE TABLE statements and extracted ${tableNames.length} table names (took ${formatDuration(duration)})`, 
    false, 
    10
  );
  
  return tableNames;
}

/**
 * Extracts the meta date from a SQL line if it contains meta table insert
 * @param line A single line from the SQL file
 * @returns The date from the meta table or null if not found
 */
function extractMetaDateFromLine(line: string): string | null {
  // Match INSERT INTO meta with named columns format
  const metaDatePattern = /INSERT\s+INTO\s+`?(?:mtg\.)?meta`?\s*\(\s*(?:.*?date.*?|date.*?)(?:,|\))\s*.*?\)\s*VALUES\s*\(\s*["']([0-9]{4}-[0-9]{2}-[0-9]{2})["']/i;
  const match = metaDatePattern.exec(line);
  if (match && match[1]) {
    return match[1];
  }
  
  // Alternative pattern that might match other date formats
  const altDatePattern = /INSERT\s+INTO\s+`?(?:mtg\.)?meta`?.*?VALUES.*?["']([0-9]{4}-[0-9]{2}-[0-9]{2})["']/i;
  const altMatch = altDatePattern.exec(line);
  if (altMatch && altMatch[1]) {
    return altMatch[1];
  }
  
  return null;
}

/**
 * Compares two dates and returns true if newDate is more recent than currentDate
 * @param newDate The new date from the import file
 * @param currentDate The current date in the database
 * @returns True if newDate is more recent than currentDate
 */
function isNewerVersion(newDate: string, currentDate: string | null): boolean {
  if (!currentDate) return true;
  
  const newDateObj = new Date(newDate);
  const currentDateObj = new Date(currentDate);
  
  return newDateObj > currentDateObj;
}

/**
 * Processes the SQL file in chunks and writes to a temporary file
 * @returns Object with import file date and path to processed SQL
 */
async function processSqlFile(progress: ProgressReporter): Promise<{ importFileDate: string | null, tempFilePath: string }> {
  const startTime = performance.now();
  progress.reportWithTimestamp("Processing SQL file...", false, 15);
  
  // Create a temporary file path
  const tempFilePath = path.join(os.tmpdir(), `mtg_import_${Date.now()}.sql`);
  const writeStream = createWriteStream(tempFilePath);
  
  // Get file stats to track progress
  const stats = await fsPromises.stat(SQL_IMPORT_FILE_PATH);
  const totalSize = stats.size;
  let processedSize = 0;
  let lastProgressPercent = 0;
  
  // Create read stream and interface for line-by-line reading
  const fileStream = createReadStream(SQL_IMPORT_FILE_PATH, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let importFileDate: string | null = null;
  let lineCount = 0;
  
  // Process the file line by line
  for await (const line of rl) {
    // Extract meta date if present and not yet found
    if (!importFileDate) {
      importFileDate = extractMetaDateFromLine(line);
      if (importFileDate) {
        progress.reportWithTimestamp(`Found meta date: ${importFileDate}`, false);
      }
    }
    
    // Process and write the modified line
    const modifiedLine = processLine(line);
    writeStream.write(modifiedLine + '\n');
    
    // Update progress tracking
    processedSize += Buffer.byteLength(line + '\n', 'utf8');
    lineCount++;
    
    // Report progress every 5% increment
    const progressPercent = Math.floor((processedSize / totalSize) * 100);
    if (progressPercent >= lastProgressPercent + 5) {
      lastProgressPercent = progressPercent;
      const processingProgress = 15 + Math.floor(progressPercent * 0.25); // Scale to 15-40% of overall progress
      progress.reportWithTimestamp(
        `Processed ${formatFileSize(processedSize)} of ${formatFileSize(totalSize)} (${progressPercent}%)`, 
        false, 
        processingProgress
      );
    }
  }
  
  // Close the write stream
  return new Promise((resolve, reject) => {
    writeStream.end(() => {
      const duration = performance.now() - startTime;
      progress.reportWithTimestamp(
        `SQL file processing complete: ${lineCount.toLocaleString()} lines, ${formatFileSize(processedSize)} processed (took ${formatDuration(duration)})`, 
        false, 
        40
      );
      resolve({ importFileDate, tempFilePath });
    });
    writeStream.on('error', (err) => {
      progress.reportError(`Failed to process SQL file: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Format file size in bytes to a human-readable string
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Execute SQL statements from a file
 * @param filePath Path to the SQL file to execute
 */
async function executeSqlFile(filePath: string, progress: ProgressReporter): Promise<void> {
  const startTime = performance.now();
  progress.reportWithTimestamp("Starting SQL execution...", false, 45);
  
  const connection = await importPool.getConnection();
  
  try {
    await connection.beginTransaction();
    progress.reportWithTimestamp("Transaction started", false, 45);
    
    // Get file stats to track progress
    const stats = await fsPromises.stat(filePath);
    const totalSize = stats.size;
    let processedSize = 0;
    let lastProgressPercent = 0;
    
    // Read the SQL file in chunks and execute each complete statement
    const fileStream = createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentStatement = '';
    let statementCount = 0;
    let successfulStatements = 0;

    for await (let line of rl) {
      processedSize += Buffer.byteLength(line + '\n', 'utf8');
      
      // Skip empty lines and comments
      line = line.trim();
      if (!line || line.startsWith('--') || line.startsWith('/*')) continue;

      // Add the line to the current statement
      currentStatement += ' ' + line;

      // If the line ends with a semicolon, execute the statement
      if (line.endsWith(';')) {
        if (currentStatement.trim()) {
          try {
            statementCount++;
            await connection.query(currentStatement);
            successfulStatements++;
            
            // Determine statement type for better logging
            const statementType = getStatementType(currentStatement);
            
            // Report progress every 5% or after important statements
            const progressPercent = Math.floor((processedSize / totalSize) * 100);
            if (progressPercent >= lastProgressPercent + 5 || isImportantStatement(statementType)) {
              lastProgressPercent = progressPercent;
              const executionProgress = 45 + Math.floor(progressPercent * 0.25); // Scale to 45-70% of overall progress
              progress.reportWithTimestamp(
                `Executed ${successfulStatements.toLocaleString()} of ${statementCount.toLocaleString()} statements - ${statementType} (${progressPercent}%)`, 
                false, 
                executionProgress
              );
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            progress.reportError(`Error executing statement: ${errorMsg.substring(0, 200)}...`);
            throw error;
          }
        }
        currentStatement = '';
      }
    }

    // Execute any remaining statement
    if (currentStatement.trim()) {
      await connection.query(currentStatement);
      successfulStatements++;
    }
    
    await connection.commit();
    const duration = performance.now() - startTime;
    progress.reportWithTimestamp(
      `SQL execution complete: ${successfulStatements.toLocaleString()} statements executed successfully (took ${formatDuration(duration)})`, 
      false, 
      70
    );
  } catch (error) {
    progress.reportError("Transaction failed, rolling back");
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Determine the type of SQL statement for better logging
 */
function getStatementType(statement: string): string {
  const normalized = statement.trim().toUpperCase();
  if (normalized.startsWith('CREATE TABLE')) return 'CREATE TABLE';
  if (normalized.startsWith('INSERT INTO')) return 'INSERT';
  if (normalized.startsWith('ALTER TABLE')) return 'ALTER TABLE';
  if (normalized.startsWith('CREATE INDEX')) return 'CREATE INDEX';
  if (normalized.startsWith('DROP TABLE')) return 'DROP TABLE';
  return 'SQL statement';
}

/**
 * Check if a statement type is important enough to always log
 */
function isImportantStatement(statementType: string): boolean {
  return ['CREATE TABLE', 'DROP TABLE', 'ALTER TABLE'].includes(statementType);
}

/**
 * Rename tables to use mtg. prefix, preserving old tables with old_mtg. prefix
 * @param tableNames List of table names to rename
 */
async function renameTables(tableNames: string[], progress: ProgressReporter): Promise<void> {
  const startTime = performance.now();
  progress.reportWithTimestamp("Starting table renaming process...", false, 75);
  
  const connection = await importPool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const totalTables = tableNames.length;
    let processedTables = 0;
    
    for (const tableName of tableNames) {
      processedTables++;
      const mtgPrefixedName = `mtg.${tableName}`;
      const oldMtgPrefixedName = `old_mtg.${tableName}`;
      const progressPercent = Math.floor((processedTables / totalTables) * 100);
      const renamingProgress = 75 + Math.floor(progressPercent * 0.2); // Scale to 75-95% of overall progress
      
      // Step 1: Check if old_mtg. prefixed table exists and drop it
      const [oldExistingTableRows] = await connection.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", 
        [dbSchema, oldMtgPrefixedName]
      );
      
      const oldExistingTableExists = Array.isArray(oldExistingTableRows) && oldExistingTableRows.length > 0;
      
      if (oldExistingTableExists) {
        progress.reportWithTimestamp(`Dropping previous backup table: ${oldMtgPrefixedName}`, false, renamingProgress);
        await connection.query(`DROP TABLE \`${oldMtgPrefixedName}\``);
      }
      
      // Step 2: Check if current mtg. prefixed table exists and rename it to old_mtg.
      const [existingTableRows] = await connection.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", 
        [dbSchema, mtgPrefixedName]
      );
      
      const existingTableExists = Array.isArray(existingTableRows) && existingTableRows.length > 0;
      
      if (existingTableExists) {
        progress.reportWithTimestamp(`Backing up existing table: ${mtgPrefixedName} → ${oldMtgPrefixedName}`, false, renamingProgress);
        await connection.query(`RENAME TABLE \`${mtgPrefixedName}\` TO \`${oldMtgPrefixedName}\``);
      }
      
      // Step 3: Check if the imported table exists and rename it to mtg. prefix
      const [importedTableRows] = await connection.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?", 
        [dbSchema, tableName]
      );
      
      const importedTableExists = Array.isArray(importedTableRows) && importedTableRows.length > 0;
      
      if (importedTableExists) {
        progress.reportWithTimestamp(`Setting up new table: ${tableName} → ${mtgPrefixedName} (${processedTables}/${totalTables})`, false, renamingProgress);
        await connection.query(`RENAME TABLE \`${tableName}\` TO \`${mtgPrefixedName}\``);
      } else {
        progress.reportWithTimestamp(`Warning: New table ${tableName} not found in database (${processedTables}/${totalTables})`, false, renamingProgress);
      }
    }
    
    await connection.commit();
    const duration = performance.now() - startTime;
    progress.reportWithTimestamp(
      `Table renaming complete: ${processedTables} tables processed (took ${formatDuration(duration)})`, 
      false, 
      95
    );
  } catch (error) {
    progress.reportError("Error during table renaming, rolling back");
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Update inventory foreign keys to match the new cards table
 * @param progress ProgressReporter instance for tracking progress
 */
async function updateInventoryForeignKeys(progress: ProgressReporter | null): Promise<void> {
  const startTime = performance.now();
  if (progress) progress.reportWithTimestamp("Starting inventory foreign key update...", false, 96);
  else console.log("Starting inventory foreign key update...");
  
  const connection = await importPool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // First, analyze which inventory records have UUID foreign keys that don't exist in the new mtg.cards table
    // This is a left join where the right side is NULL if the UUID doesn't exist in mtg.cards
    const [mismatchResults] = await connection.query(`
      SELECT COUNT(*) as mismatchCount
      FROM \`mtg.inventory\` inv
      LEFT JOIN \`mtg.cards\` cards ON inv.foreignKey = cards.uuid
      WHERE cards.uuid IS NULL AND inv.foreignKeySource = 'uuid'
    `);
    
    // Fix type error: properly access the count from query results
    const mismatchCount = Array.isArray(mismatchResults) && mismatchResults.length > 0 
      ? (mismatchResults[0] as any).mismatchCount || 0 
      : 0;
    
    if (mismatchCount === 0) {
      if (progress) progress.reportWithTimestamp("No inventory items with broken references found.", false, 97);
      else console.log("No inventory items with broken references found.");
      await connection.commit();
      const duration = performance.now() - startTime;
      if (progress) progress.reportWithTimestamp(
        `Inventory foreign key check complete (took ${formatDuration(duration)})`, 
        false, 
        100
      );
      return;
    }
    
    if (progress) progress.reportWithTimestamp(`Found ${mismatchCount} inventory items with broken references. Attempting to repair...`, false, 97);
    else console.log(`Found ${mismatchCount} inventory items with broken references. Attempting to repair...`);
    
    // Try to map inventory items to the new cards using UUID lookup in the old backup table
    const [repairResults] = await connection.query(`
      UPDATE \`mtg.inventory\` inv
      LEFT JOIN \`mtg.cards\` newcards ON inv.foreignKey = newcards.uuid
      JOIN \`old_mtg.cards\` oldcards ON inv.foreignKey = oldcards.uuid
      JOIN \`mtg.cards\` matchcards ON 
        oldcards.name = matchcards.name AND
        oldcards.setCode = matchcards.setCode AND
        oldcards.number = matchcards.number
      SET inv.foreignKey = matchcards.uuid
      WHERE newcards.uuid IS NULL AND inv.foreignKeySource = 'uuid'
    `);
    
    // Fix type error: properly access the affected rows from update results
    const repairedCount = repairResults && typeof repairResults === 'object' && 'affectedRows' in repairResults 
      ? (repairResults as any).affectedRows || 0 
      : 0;
      
    if (progress) progress.reportWithTimestamp(`Repaired ${repairedCount} of ${mismatchCount} inventory items with broken references.`, false, 98);
    else console.log(`Repaired ${repairedCount} of ${mismatchCount} inventory items with broken references.`);
    
    // Check if any items still have broken references
    const [remainingResults] = await connection.query(`
      SELECT COUNT(*) as remainingCount
      FROM \`mtg.inventory\` inv
      LEFT JOIN \`mtg.cards\` cards ON inv.foreignKey = cards.uuid
      WHERE cards.uuid IS NULL AND inv.foreignKeySource = 'uuid'
    `);
    
    // Fix type error: properly access the count from query results
    const remainingCount = Array.isArray(remainingResults) && remainingResults.length > 0 
      ? (remainingResults[0] as any).remainingCount || 0 
      : 0;
    
    if (remainingCount > 0) {
      if (progress) progress.reportWithTimestamp(`Warning: ${remainingCount} inventory items still have broken references.`, false, 99);
      else console.log(`Warning: ${remainingCount} inventory items still have broken references.`);
    }
    
    await connection.commit();
    const duration = performance.now() - startTime;
    if (progress) progress.reportWithTimestamp(
      `Inventory foreign key update complete: repaired ${repairedCount} of ${mismatchCount} items (took ${formatDuration(duration)})`, 
      false, 
      100
    );
    else console.log(`Inventory foreign key update complete: repaired ${repairedCount} of ${mismatchCount} items (took ${formatDuration(duration)})`);
  } catch (error) {
    if (progress) progress.reportError("Error during inventory foreign key update, rolling back");
    else console.error("Error during inventory foreign key update, rolling back:", error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Determines if the request is coming from a browser (expecting HTML)
 * or an API client (expecting JSON)
 */
function isBrowserRequest(request: NextRequest): boolean {
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

/**
 * Import handler endpoint that processes the MTG card data SQL file
 */
export async function GET(request: NextRequest) {
  // Admin only: this drops and rebuilds the shared mtg.* catalogue tables, so a
  // session alone is not enough to reach it.
  //
  // Checked here rather than inside executeImport because the browser path
  // returns its stream immediately and runs the import in the background - a
  // check further in would hand an unauthorised caller a 200 and a stream.
  const { response } = await requireRole(ROLES.ADMIN);
  if (response) return response;

  const wantsBrowserView = isBrowserRequest(request);
  const progress = wantsBrowserView ? new ProgressReporter() : null;
  const startTime = performance.now();
  
  if (progress) {
    // Return a streaming response for browser requests
    const streamResponse = progress.createStream();
    
    // Execute the import in the background
    executeImport(request, progress).catch(error => {
      console.error("Unhandled error during import:", error);
    });
    
    return streamResponse;
  } else {
    // For API clients, return a traditional JSON response
    try {
      return await executeImport(request, null);
    } catch (error) {
      console.error("Unhandled error during import:", error);
      return NextResponse.json({
        success: false,
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, { status: 500 });
    }
  }
}

/**
 * Core import execution logic, separated to support both streaming and JSON responses
 */
async function executeImport(request: NextRequest, progress: ProgressReporter | null): Promise<NextResponse> {
  const startTime = performance.now();
  
  try {
    // Authorisation already happened in GET, before the stream was opened.
    if (progress) {
      progress.reportWithTimestamp("Authentication successful", false, 2);
    } else {
      console.log("Starting MTG data import process...");
    }
    
    if (progress) progress.reportWithTimestamp(`Reading SQL file from ${SQL_IMPORT_FILE_PATH}`, false, 3);
    else console.log(`Reading SQL file from ${SQL_IMPORT_FILE_PATH}`);
    
    // Check if the file exists
    if (!fs.existsSync(SQL_IMPORT_FILE_PATH)) {
      if (progress) progress.reportError(`SQL import file not found at ${SQL_IMPORT_FILE_PATH}`);
      return NextResponse.json({
        success: false,
        message: `SQL import file not found at ${SQL_IMPORT_FILE_PATH}`
      }, { status: 404 });
    }

    // Extract table names to be used for renaming later
    const tableNames = await extractTableNames(progress || new ProgressReporter());
    if (tableNames.length === 0) {
      if (progress) progress.reportError("No tables found in SQL file");
      return NextResponse.json({
        success: false,
        message: "No tables found in SQL file"
      }, { status: 400 });
    }
    
    // Process the SQL file in chunks to extract meta date and prepare for execution
    const { importFileDate, tempFilePath } = await processSqlFile(progress || new ProgressReporter());
    
    if (!importFileDate) {
      // Clean up temporary file
      await fsPromises.unlink(tempFilePath).catch(() => {});
      if (progress) progress.reportError("Could not extract date from import file meta table");
      return NextResponse.json({
        success: false,
        message: "Could not extract date from import file meta table"
      }, { status: 400 });
    }
    
    // Get the current meta date from the database
    let currentMetaDate = null;
    try {
      const metaResult = await db.select({
        date: mtgMeta.date
      })
      .from(mtgMeta)
      .limit(1);
      
      if (metaResult.length > 0 && metaResult[0].date) {
        currentMetaDate = metaResult[0].date;
        if (progress) progress.reportWithTimestamp(`Current database meta date: ${currentMetaDate}`, false, 42);
      }
    } catch (error) {
      if (progress) progress.reportWithTimestamp("No existing meta data found or error retrieving it", false, 42);
      else console.log("No existing meta data found or error retrieving it:", error);
      // Continue with import if we can't find current meta data
    }
    
    // Compare dates to determine if import should proceed
    if (currentMetaDate && !isNewerVersion(importFileDate, currentMetaDate)) {
      // Clean up temporary file
      await fsPromises.unlink(tempFilePath).catch(() => {});
      const message = `Import file date (${importFileDate}) is not newer than current database date (${currentMetaDate}). Import cancelled.`;
      
      if (progress) {
        progress.reportWithTimestamp(message, false, 100);
        progress.reportSuccess("Import cancelled - database already contains newer data");
      }
      
      return NextResponse.json({
        success: false,
        message
      }, { status: 200 });
    }
    
    // Execute the processed SQL file
    if (progress) progress.reportWithTimestamp("Executing SQL import...", false, 45);
    else console.log("Executing SQL import...");
    
    try {
      await executeSqlFile(tempFilePath, progress || new ProgressReporter());
      
      // After successful import, rename tables with mtg. prefix
      await renameTables(tableNames, progress || new ProgressReporter());
      
      // Update inventory foreign keys to match the new card data
      await updateInventoryForeignKeys(progress || new ProgressReporter());
      
      // Clean up the temporary file
      await fsPromises.unlink(tempFilePath).catch(() => {});
      
      const totalDuration = performance.now() - startTime;
      const successMessage = `MTG card data imported successfully. Data updated to version from ${importFileDate}. Total execution time: ${formatDuration(totalDuration)}`;
      
      if (progress) {
        progress.reportSuccess(successMessage);
      } else {
        console.log(successMessage);
      }
      
      return NextResponse.json({
        success: true,
        message: successMessage,
        executionTime: formatDuration(totalDuration),
        importDate: importFileDate
      }, { status: 200 });
      
    } catch (error) {
      // Clean up temporary file on error
      await fsPromises.unlink(tempFilePath).catch(() => {});
      if (progress) progress.reportError(`Error during import process: ${error instanceof Error ? error.message : 'Unknown error'}`);
      else console.error("Error during import process:", error);
      
      return NextResponse.json({
        success: false,
        message: `Error during import process: ${error instanceof Error ? error.message : 'Unknown error'}`
      }, { status: 500 });
    }
    
  } catch (error) {
    if (progress) progress.reportError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    else console.error("Unexpected error during import:", error);
    
    return NextResponse.json({
      success: false,
      message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}