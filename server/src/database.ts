import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default to local data directory, can be overridden by environment variable
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'hcc.db');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log(`📦 Database path: ${DB_PATH}`);

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema IMMEDIATELY (before any prepared statements)
console.log('🔧 Initializing database schema...');

// Users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        avatar TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        pin_hash TEXT,
        pin_salt TEXT,
        biometric_enabled INTEGER DEFAULT 0,
        biometric_credential_id TEXT,
        allowed_rooms TEXT,
        preferences TEXT,
        created_at TEXT NOT NULL,
        last_login TEXT
    )
`);

// Configuration table (rooms, general settings)
db.exec(`
    CREATE TABLE IF NOT EXISTS config (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
`);

// Scenes table
db.exec(`
    CREATE TABLE IF NOT EXISTS scenes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        devices TEXT NOT NULL,
        is_active INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
`);

// Audit log table (for security tracking)
db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        timestamp TEXT NOT NULL
    )
`);

// Cameras table
db.exec(`
    CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'snapshot',
        url TEXT,
        entity_id TEXT,
        snapshot_url TEXT,
        refresh_interval INTEGER DEFAULT 10,
        motion_detection INTEGER DEFAULT 1,
        recording_enabled INTEGER DEFAULT 0,
        night_vision INTEGER DEFAULT 0,
        ptz_enabled INTEGER DEFAULT 0,
        audio_enabled INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
`);

// Create indexes for better performance
db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_config_key ON config(key);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
    CREATE INDEX IF NOT EXISTS idx_cameras_location ON cameras(location);
`);

console.log('✅ Database schema initialized');

// For backwards compatibility, export a no-op function
export function initializeDatabase() {
    // Schema already initialized above
    console.log('📦 Database ready');
}

// User operations (NOW safe to create prepared statements)
export const userOperations = {
    getAll: db.prepare(`
        SELECT id, name, email, avatar, role, 
               pin_hash IS NOT NULL as has_pin,
               biometric_enabled, allowed_rooms, preferences,
               created_at, last_login
        FROM users ORDER BY created_at ASC
    `),

    getById: db.prepare(`
        SELECT * FROM users WHERE id = ?
    `),

    create: db.prepare(`
        INSERT INTO users (id, name, email, avatar, role, pin_hash, pin_salt, 
                          biometric_enabled, biometric_credential_id, allowed_rooms, 
                          preferences, created_at)
        VALUES (@id, @name, @email, @avatar, @role, @pinHash, @pinSalt, 
                @biometricEnabled, @biometricCredentialId, @allowedRooms, 
                @preferences, @createdAt)
    `),

    update: db.prepare(`
        UPDATE users SET
            name = COALESCE(@name, name),
            email = COALESCE(@email, email),
            avatar = COALESCE(@avatar, avatar),
            role = COALESCE(@role, role),
            allowed_rooms = COALESCE(@allowedRooms, allowed_rooms),
            preferences = COALESCE(@preferences, preferences)
        WHERE id = @id
    `),

    updatePin: db.prepare(`
        UPDATE users SET pin_hash = @pinHash, pin_salt = @pinSalt WHERE id = @id
    `),

    removePin: db.prepare(`
        UPDATE users SET pin_hash = NULL, pin_salt = NULL WHERE id = @id
    `),

    updateBiometric: db.prepare(`
        UPDATE users SET 
            biometric_enabled = @enabled,
            biometric_credential_id = @credentialId
        WHERE id = @id
    `),

    updateLastLogin: db.prepare(`
        UPDATE users SET last_login = @lastLogin WHERE id = @id
    `),

    delete: db.prepare(`DELETE FROM users WHERE id = ?`),

    countByRole: db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = ?`),
};

// Config operations
export const configOperations = {
    get: db.prepare(`SELECT value FROM config WHERE key = ?`),

    set: db.prepare(`
        INSERT INTO config (id, key, value, updated_at) 
        VALUES (@id, @key, @value, @updatedAt)
        ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updatedAt
    `),

    getAll: db.prepare(`SELECT key, value FROM config`),

    delete: db.prepare(`DELETE FROM config WHERE key = ?`),
};

// Scene operations
export const sceneOperations = {
    getAll: db.prepare(`SELECT * FROM scenes ORDER BY name ASC`),

    getById: db.prepare(`SELECT * FROM scenes WHERE id = ?`),

    create: db.prepare(`
        INSERT INTO scenes (id, name, icon, color, devices, is_active, created_at, updated_at)
        VALUES (@id, @name, @icon, @color, @devices, @isActive, @createdAt, @updatedAt)
    `),

    update: db.prepare(`
        UPDATE scenes SET
            name = COALESCE(@name, name),
            icon = COALESCE(@icon, icon),
            color = COALESCE(@color, color),
            devices = COALESCE(@devices, devices),
            is_active = COALESCE(@isActive, is_active),
            updated_at = @updatedAt
        WHERE id = @id
    `),

    delete: db.prepare(`DELETE FROM scenes WHERE id = ?`),
};

// Audit log operations
export const auditOperations = {
    log: db.prepare(`
        INSERT INTO audit_log (user_id, action, details, ip_address, timestamp)
        VALUES (@userId, @action, @details, @ipAddress, @timestamp)
    `),

    getRecent: db.prepare(`
        SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT ?
    `),

    getByUser: db.prepare(`
        SELECT * FROM audit_log WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
    `),
};

// Camera operations
export const cameraOperations = {
    getAll: db.prepare(`SELECT * FROM cameras ORDER BY name ASC`),

    getById: db.prepare(`SELECT * FROM cameras WHERE id = ?`),

    getByLocation: db.prepare(`SELECT * FROM cameras WHERE location = ?`),

    create: db.prepare(`
        INSERT INTO cameras (id, name, location, type, url, entity_id, snapshot_url, 
                            refresh_interval, motion_detection, recording_enabled, 
                            night_vision, ptz_enabled, audio_enabled, created_at, updated_at)
        VALUES (@id, @name, @location, @type, @url, @entityId, @snapshotUrl, 
                @refreshInterval, @motionDetection, @recordingEnabled, 
                @nightVision, @ptzEnabled, @audioEnabled, @createdAt, @updatedAt)
    `),

    update: db.prepare(`
        UPDATE cameras SET
            name = COALESCE(@name, name),
            location = COALESCE(@location, location),
            type = COALESCE(@type, type),
            url = COALESCE(@url, url),
            entity_id = COALESCE(@entityId, entity_id),
            snapshot_url = COALESCE(@snapshotUrl, snapshot_url),
            refresh_interval = COALESCE(@refreshInterval, refresh_interval),
            motion_detection = COALESCE(@motionDetection, motion_detection),
            recording_enabled = COALESCE(@recordingEnabled, recording_enabled),
            night_vision = COALESCE(@nightVision, night_vision),
            ptz_enabled = COALESCE(@ptzEnabled, ptz_enabled),
            audio_enabled = COALESCE(@audioEnabled, audio_enabled),
            updated_at = @updatedAt
        WHERE id = @id
    `),

    delete: db.prepare(`DELETE FROM cameras WHERE id = ?`),
};

export default db;

