import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import {
    initializeDatabase,
    userOperations,
    configOperations,
    sceneOperations,
    auditOperations,
    cameraOperations,
} from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Initialize database on startup
initializeDatabase();

// Serve static files from the frontend build (in production)
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// USER ROUTES
// ============================================

// Get all users
app.get('/api/users', (req, res) => {
    try {
        const users = userOperations.getAll.all();
        // Parse JSON fields
        const parsedUsers = users.map((user: any) => ({
            ...user,
            hasPin: Boolean(user.has_pin),
            biometricEnabled: Boolean(user.biometric_enabled),
            allowedRooms: user.allowed_rooms ? JSON.parse(user.allowed_rooms) : undefined,
            preferences: user.preferences ? JSON.parse(user.preferences) : {},
            createdAt: user.created_at,
            lastLogin: user.last_login,
        }));
        res.json(parsedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
    try {
        const user = userOperations.getById.get(req.params.id) as any;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            ...user,
            pinHash: user.pin_hash ? { hash: user.pin_hash, salt: user.pin_salt } : null,
            biometricEnabled: Boolean(user.biometric_enabled),
            biometricCredentialId: user.biometric_credential_id,
            allowedRooms: user.allowed_rooms ? JSON.parse(user.allowed_rooms) : undefined,
            preferences: user.preferences ? JSON.parse(user.preferences) : {},
            createdAt: user.created_at,
            lastLogin: user.last_login,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create user
app.post('/api/users', (req, res) => {
    try {
        const { name, email, avatar, role, pinHash, allowedRooms, preferences } = req.body;
        const id = uuidv4();
        const createdAt = new Date().toISOString();

        userOperations.create.run({
            id,
            name,
            email: email || null,
            avatar: avatar || null,
            role: role || 'user',
            pinHash: pinHash?.hash || null,
            pinSalt: pinHash?.salt || null,
            biometricEnabled: 0,
            biometricCredentialId: null,
            allowedRooms: allowedRooms ? JSON.stringify(allowedRooms) : null,
            preferences: preferences ? JSON.stringify(preferences) : '{}',
            createdAt,
        });

        // Log the action
        auditOperations.log.run({
            userId: id,
            action: 'USER_CREATED',
            details: JSON.stringify({ name, role }),
            ipAddress: req.ip,
            timestamp: createdAt,
        });

        res.status(201).json({ id, name, role, createdAt });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
app.patch('/api/users/:id', (req, res) => {
    try {
        const { name, email, avatar, role, allowedRooms, preferences } = req.body;

        userOperations.update.run({
            id: req.params.id,
            name: name || null,
            email: email || null,
            avatar: avatar || null,
            role: role || null,
            allowedRooms: allowedRooms ? JSON.stringify(allowedRooms) : null,
            preferences: preferences ? JSON.stringify(preferences) : null,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Update user PIN
app.patch('/api/users/:id/pin', (req, res) => {
    try {
        const { pinHash } = req.body;

        if (pinHash) {
            userOperations.updatePin.run({
                id: req.params.id,
                pinHash: pinHash.hash,
                pinSalt: pinHash.salt,
            });
        } else {
            userOperations.removePin.run(req.params.id);
        }

        auditOperations.log.run({
            userId: req.params.id,
            action: pinHash ? 'PIN_UPDATED' : 'PIN_REMOVED',
            details: null,
            ipAddress: req.ip,
            timestamp: new Date().toISOString(),
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating PIN:', error);
        res.status(500).json({ error: 'Failed to update PIN' });
    }
});

// Verify user PIN
app.post('/api/users/:id/verify-pin', (req, res) => {
    try {
        const user = userOperations.getById.get(req.params.id) as any;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.pin_hash) {
            return res.json({ valid: true, hasPin: false });
        }

        // Return the hash/salt for client-side verification
        // (We do verification client-side to use Web Crypto API)
        res.json({
            valid: false,
            hasPin: true,
            pinHash: { hash: user.pin_hash, salt: user.pin_salt },
        });
    } catch (error) {
        console.error('Error verifying PIN:', error);
        res.status(500).json({ error: 'Failed to verify PIN' });
    }
});

// Update biometric settings
app.patch('/api/users/:id/biometric', (req, res) => {
    try {
        const { enabled, credentialId } = req.body;

        userOperations.updateBiometric.run({
            id: req.params.id,
            enabled: enabled ? 1 : 0,
            credentialId: credentialId || null,
        });

        auditOperations.log.run({
            userId: req.params.id,
            action: enabled ? 'BIOMETRIC_ENABLED' : 'BIOMETRIC_DISABLED',
            details: null,
            ipAddress: req.ip,
            timestamp: new Date().toISOString(),
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating biometric:', error);
        res.status(500).json({ error: 'Failed to update biometric settings' });
    }
});

// Update last login
app.patch('/api/users/:id/login', (req, res) => {
    try {
        const lastLogin = new Date().toISOString();
        userOperations.updateLastLogin.run({
            id: req.params.id,
            lastLogin,
        });

        auditOperations.log.run({
            userId: req.params.id,
            action: 'USER_LOGIN',
            details: null,
            ipAddress: req.ip,
            timestamp: lastLogin,
        });

        res.json({ success: true, lastLogin });
    } catch (error) {
        console.error('Error updating login time:', error);
        res.status(500).json({ error: 'Failed to update login time' });
    }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    try {
        // Check if this is the last admin
        const user = userOperations.getById.get(req.params.id) as any;
        if (user?.role === 'admin') {
            const adminCount = userOperations.countByRole.get('admin') as any;
            if (adminCount.count <= 1) {
                return res.status(400).json({ error: 'Cannot delete the last admin user' });
            }
        }

        userOperations.delete.run(req.params.id);

        auditOperations.log.run({
            userId: req.params.id,
            action: 'USER_DELETED',
            details: JSON.stringify({ name: user?.name }),
            ipAddress: req.ip,
            timestamp: new Date().toISOString(),
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ============================================
// CONFIG ROUTES
// ============================================

// Get all configuration
app.get('/api/config', (req, res) => {
    try {
        const configs = configOperations.getAll.all() as any[];
        const result: Record<string, any> = {};

        for (const config of configs) {
            try {
                result[config.key] = JSON.parse(config.value);
            } catch {
                result[config.key] = config.value;
            }
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

// Get specific config key
app.get('/api/config/:key', (req, res) => {
    try {
        const config = configOperations.get.get(req.params.key) as any;
        if (!config) {
            return res.status(404).json({ error: 'Config key not found' });
        }

        try {
            res.json(JSON.parse(config.value));
        } catch {
            res.json(config.value);
        }
    } catch (error) {
        console.error('Error fetching config:', error);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

// Set config value
app.put('/api/config/:key', (req, res) => {
    try {
        const value = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

        configOperations.set.run({
            id: uuidv4(),
            key: req.params.key,
            value,
            updatedAt: new Date().toISOString(),
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error setting config:', error);
        res.status(500).json({ error: 'Failed to set configuration' });
    }
});

// Delete config key
app.delete('/api/config/:key', (req, res) => {
    try {
        configOperations.delete.run(req.params.key);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting config:', error);
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

// ============================================
// SCENE ROUTES
// ============================================

// Get all scenes
app.get('/api/scenes', (req, res) => {
    try {
        const scenes = sceneOperations.getAll.all() as any[];
        const parsedScenes = scenes.map(scene => ({
            ...scene,
            devices: JSON.parse(scene.devices),
            isActive: Boolean(scene.is_active),
            createdAt: scene.created_at,
            updatedAt: scene.updated_at,
        }));
        res.json(parsedScenes);
    } catch (error) {
        console.error('Error fetching scenes:', error);
        res.status(500).json({ error: 'Failed to fetch scenes' });
    }
});

// Create scene
app.post('/api/scenes', (req, res) => {
    try {
        const { name, icon, color, devices } = req.body;
        const id = uuidv4();
        const now = new Date().toISOString();

        sceneOperations.create.run({
            id,
            name,
            icon: icon || null,
            color: color || null,
            devices: JSON.stringify(devices || []),
            isActive: 0,
            createdAt: now,
            updatedAt: now,
        });

        res.status(201).json({ id, name });
    } catch (error) {
        console.error('Error creating scene:', error);
        res.status(500).json({ error: 'Failed to create scene' });
    }
});

// Update scene
app.patch('/api/scenes/:id', (req, res) => {
    try {
        const { name, icon, color, devices, isActive } = req.body;

        sceneOperations.update.run({
            id: req.params.id,
            name: name || null,
            icon: icon || null,
            color: color || null,
            devices: devices ? JSON.stringify(devices) : null,
            isActive: isActive !== undefined ? (isActive ? 1 : 0) : null,
            updatedAt: new Date().toISOString(),
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating scene:', error);
        res.status(500).json({ error: 'Failed to update scene' });
    }
});

// Delete scene
app.delete('/api/scenes/:id', (req, res) => {
    try {
        sceneOperations.delete.run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting scene:', error);
        res.status(500).json({ error: 'Failed to delete scene' });
    }
});

// ============================================
// AUDIT LOG ROUTES
// ============================================

// Get recent audit logs
app.get('/api/audit', (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const logs = auditOperations.getRecent.all(limit);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// ============================================
// CAMERA ROUTES
// ============================================

// Get all cameras
app.get('/api/cameras', (req, res) => {
    try {
        const cameras = cameraOperations.getAll.all();
        const parsedCameras = (cameras as any[]).map((cam: any) => ({
            id: cam.id,
            name: cam.name,
            location: cam.location,
            type: cam.type,
            url: cam.url,
            entityId: cam.entity_id,
            snapshotUrl: cam.snapshot_url,
            refreshInterval: cam.refresh_interval,
            motionDetection: Boolean(cam.motion_detection),
            recordingEnabled: Boolean(cam.recording_enabled),
            nightVision: Boolean(cam.night_vision),
            ptzEnabled: Boolean(cam.ptz_enabled),
            audioEnabled: Boolean(cam.audio_enabled),
            createdAt: cam.created_at,
            updatedAt: cam.updated_at
        }));
        res.json(parsedCameras);
    } catch (error) {
        console.error('Error fetching cameras:', error);
        res.status(500).json({ error: 'Failed to fetch cameras' });
    }
});

// Get camera by ID
app.get('/api/cameras/:id', (req, res) => {
    try {
        const camera = cameraOperations.getById.get(req.params.id) as any;
        if (!camera) {
            return res.status(404).json({ error: 'Camera not found' });
        }
        res.json({
            id: camera.id,
            name: camera.name,
            location: camera.location,
            type: camera.type,
            url: camera.url,
            entityId: camera.entity_id,
            snapshotUrl: camera.snapshot_url,
            refreshInterval: camera.refresh_interval,
            motionDetection: Boolean(camera.motion_detection),
            recordingEnabled: Boolean(camera.recording_enabled),
            nightVision: Boolean(camera.night_vision),
            ptzEnabled: Boolean(camera.ptz_enabled),
            audioEnabled: Boolean(camera.audio_enabled),
            createdAt: camera.created_at,
            updatedAt: camera.updated_at
        });
    } catch (error) {
        console.error('Error fetching camera:', error);
        res.status(500).json({ error: 'Failed to fetch camera' });
    }
});

// Create camera
app.post('/api/cameras', (req, res) => {
    try {
        const {
            id, name, location, type, url, entityId, snapshotUrl,
            refreshInterval, motionDetection, recordingEnabled,
            nightVision, ptzEnabled, audioEnabled
        } = req.body;

        const cameraId = id || uuidv4();
        const now = new Date().toISOString();

        cameraOperations.create.run({
            id: cameraId,
            name,
            location,
            type: type || 'snapshot',
            url: url || null,
            entityId: entityId || null,
            snapshotUrl: snapshotUrl || null,
            refreshInterval: refreshInterval || 10,
            motionDetection: motionDetection ? 1 : 0,
            recordingEnabled: recordingEnabled ? 1 : 0,
            nightVision: nightVision ? 1 : 0,
            ptzEnabled: ptzEnabled ? 1 : 0,
            audioEnabled: audioEnabled ? 1 : 0,
            createdAt: now,
            updatedAt: now
        });

        res.status(201).json({ id: cameraId, success: true });
    } catch (error) {
        console.error('Error creating camera:', error);
        res.status(500).json({ error: 'Failed to create camera' });
    }
});

// Update camera
app.put('/api/cameras/:id', (req, res) => {
    try {
        const {
            name, location, type, url, entityId, snapshotUrl,
            refreshInterval, motionDetection, recordingEnabled,
            nightVision, ptzEnabled, audioEnabled
        } = req.body;

        cameraOperations.update.run({
            id: req.params.id,
            name,
            location,
            type,
            url,
            entityId,
            snapshotUrl,
            refreshInterval,
            motionDetection: motionDetection !== undefined ? (motionDetection ? 1 : 0) : undefined,
            recordingEnabled: recordingEnabled !== undefined ? (recordingEnabled ? 1 : 0) : undefined,
            nightVision: nightVision !== undefined ? (nightVision ? 1 : 0) : undefined,
            ptzEnabled: ptzEnabled !== undefined ? (ptzEnabled ? 1 : 0) : undefined,
            audioEnabled: audioEnabled !== undefined ? (audioEnabled ? 1 : 0) : undefined,
            updatedAt: new Date().toISOString()
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating camera:', error);
        res.status(500).json({ error: 'Failed to update camera' });
    }
});

// Delete camera
app.delete('/api/cameras/:id', (req, res) => {
    try {
        cameraOperations.delete.run(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting camera:', error);
        res.status(500).json({ error: 'Failed to delete camera' });
    }
});

// ============================================
// SPA CATCH-ALL (must be last)
// ============================================

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║           Home Control Center - Backend API               ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on http://localhost:${PORT}              ║
║  📦 Database: SQLite with WAL mode                        ║
║  ✅ Ready to accept connections                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

export default app;
