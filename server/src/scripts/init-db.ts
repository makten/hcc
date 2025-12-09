import { initializeDatabase, userOperations, configOperations } from '../database.js';
import { v4 as uuidv4 } from 'uuid';

console.log('🚀 Initializing Home Control Center database...\n');

// Initialize schema
initializeDatabase();

// Check if admin user exists
const adminCount = userOperations.countByRole.get('admin') as any;

if (adminCount.count === 0) {
    console.log('📝 Creating default admin user...');

    const now = new Date().toISOString();

    userOperations.create.run({
        id: 'admin',
        name: 'Administrator',
        email: null,
        avatar: null,
        role: 'admin',
        pinHash: null,
        pinSalt: null,
        biometricEnabled: 0,
        biometricCredentialId: null,
        allowedRooms: null,
        preferences: JSON.stringify({
            theme: 'dark',
            accentColor: '#00d4ff',
            animations: true,
            notifications: {
                enabled: true,
                sound: true,
                securityAlerts: true,
                deviceChanges: false,
                energyAlerts: true,
            },
        }),
        createdAt: now,
    });

    console.log('✅ Default admin user created');
}

// Initialize default config if not exists
const existingConfig = configOperations.get.get('rooms') as any;

if (!existingConfig) {
    console.log('📝 Creating default room configuration...');

    configOperations.set.run({
        id: uuidv4(),
        key: 'rooms',
        value: JSON.stringify([]),
        updatedAt: new Date().toISOString(),
    });

    configOperations.set.run({
        id: uuidv4(),
        key: 'hassUrl',
        value: JSON.stringify(''),
        updatedAt: new Date().toISOString(),
    });

    console.log('✅ Default configuration created');
}

console.log('\n🎉 Database initialization complete!');
console.log('   You can now start the server with: npm run dev\n');
