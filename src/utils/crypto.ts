/**
 * Cryptographic utilities for secure PIN handling
 * Uses the Web Crypto API for secure hashing
 */

// Generate a random salt for PIN hashing
export async function generateSalt(): Promise<string> {
    const saltBuffer = new Uint8Array(16);
    crypto.getRandomValues(saltBuffer);
    return bufferToHex(saltBuffer);
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer: Uint8Array): string {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Convert hex string to Uint8Array
function hexToBuffer(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Hash a PIN using PBKDF2 with SHA-256
 * This is a secure key derivation function suitable for password/PIN hashing
 * 
 * @param pin - The plaintext PIN to hash
 * @param salt - A unique salt for this PIN (should be stored with the hash)
 * @returns The hashed PIN as a hex string
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
    // Convert PIN to buffer
    const encoder = new TextEncoder();
    const pinBuffer = encoder.encode(pin);
    const saltBuffer = hexToBuffer(salt);

    // Import the PIN as a key
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        pinBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
    );

    // Derive bits using PBKDF2
    // Using 100,000 iterations for good security while maintaining reasonable performance
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer.buffer as ArrayBuffer,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        256 // 256 bits = 32 bytes
    );

    return bufferToHex(new Uint8Array(derivedBits));
}

/**
 * Verify a PIN against a stored hash
 * 
 * @param pin - The plaintext PIN to verify
 * @param salt - The salt used when hashing
 * @param storedHash - The previously computed hash
 * @returns True if the PIN matches
 */
export async function verifyPin(pin: string, salt: string, storedHash: string): Promise<boolean> {
    const computedHash = await hashPin(pin, salt);
    // Use constant-time comparison to prevent timing attacks
    return constantTimeCompare(computedHash, storedHash);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * PIN storage format - combines salt and hash
 */
export interface HashedPin {
    salt: string;
    hash: string;
}

/**
 * Create a storable PIN hash object
 */
export async function createPinHash(pin: string): Promise<HashedPin> {
    const salt = await generateSalt();
    const hash = await hashPin(pin, salt);
    return { salt, hash };
}

/**
 * Verify a PIN against a HashedPin object
 */
export async function verifyPinHash(pin: string, hashedPin: HashedPin): Promise<boolean> {
    return verifyPin(pin, hashedPin.salt, hashedPin.hash);
}

/**
 * Serialize a HashedPin for storage (e.g., in localStorage)
 */
export function serializeHashedPin(hashedPin: HashedPin): string {
    return `${hashedPin.salt}:${hashedPin.hash}`;
}

/**
 * Deserialize a stored PIN hash
 */
export function deserializeHashedPin(stored: string): HashedPin | null {
    const parts = stored.split(':');
    if (parts.length !== 2) {
        return null;
    }
    return {
        salt: parts[0],
        hash: parts[1],
    };
}

export default {
    hashPin,
    verifyPin,
    createPinHash,
    verifyPinHash,
    generateSalt,
    serializeHashedPin,
    deserializeHashedPin,
};
