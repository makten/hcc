/**
 * Biometric Authentication Utilities
 * Uses the Web Authentication API (WebAuthn) for biometric authentication
 * Supports Face ID, Touch ID, Windows Hello, and other platform authenticators
 */

// Generate a random challenge for WebAuthn
function generateChallenge(): Uint8Array {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    return challenge;
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Check if WebAuthn is supported in the current browser
 */
export function isWebAuthnSupported(): boolean {
    return !!window.PublicKeyCredential;
}

/**
 * Check if platform authenticator (biometric) is available
 * This checks for Face ID, Touch ID, Windows Hello, etc.
 */
export async function isBiometricAvailable(): Promise<boolean> {
    if (!isWebAuthnSupported()) {
        return false;
    }

    try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
    } catch (error) {
        console.error('Error checking biometric availability:', error);
        return false;
    }
}

/**
 * Register a new biometric credential for a user
 * This prompts the user to scan their fingerprint or face
 * 
 * @param userId - The user's unique identifier
 * @param userName - The user's display name
 * @returns The credential ID to store for future authentication
 */
export async function registerBiometric(
    userId: string,
    userName: string
): Promise<{ credentialId: string; publicKey: string } | null> {
    if (!isWebAuthnSupported()) {
        throw new Error('WebAuthn is not supported in this browser');
    }

    try {
        const challenge = generateChallenge();

        // Create credential options
        const createOptions: PublicKeyCredentialCreationOptions = {
            challenge: challenge.buffer as ArrayBuffer,
            rp: {
                name: 'Home Control Center',
                id: window.location.hostname,
            },
            user: {
                id: new TextEncoder().encode(userId),
                name: userName,
                displayName: userName,
            },
            pubKeyCredParams: [
                { type: 'public-key', alg: -7 },   // ES256
                { type: 'public-key', alg: -257 }, // RS256
            ],
            authenticatorSelection: {
                authenticatorAttachment: 'platform', // Only platform authenticators (built-in biometric)
                userVerification: 'required',        // Require biometric verification
                residentKey: 'preferred',
            },
            timeout: 60000, // 60 seconds timeout
            attestation: 'none', // We don't need attestation for this use case
        };

        // Create the credential
        const credential = await navigator.credentials.create({
            publicKey: createOptions,
        }) as PublicKeyCredential;

        if (!credential) {
            return null;
        }

        const response = credential.response as AuthenticatorAttestationResponse;

        return {
            credentialId: arrayBufferToBase64(credential.rawId),
            publicKey: arrayBufferToBase64(response.getPublicKey() || new ArrayBuffer(0)),
        };
    } catch (error) {
        console.error('Error registering biometric:', error);

        // Handle specific errors
        if (error instanceof DOMException) {
            if (error.name === 'NotAllowedError') {
                throw new Error('Biometric registration was cancelled or denied');
            } else if (error.name === 'InvalidStateError') {
                throw new Error('A biometric credential already exists for this device');
            }
        }

        throw error;
    }
}

/**
 * Authenticate using a stored biometric credential
 * 
 * @param credentialId - The stored credential ID from registration
 * @returns True if authentication was successful
 */
export async function authenticateWithBiometric(credentialId: string): Promise<boolean> {
    if (!isWebAuthnSupported()) {
        throw new Error('WebAuthn is not supported in this browser');
    }

    try {
        const challenge = generateChallenge();

        // Create authentication options
        const getOptions: PublicKeyCredentialRequestOptions = {
            challenge: challenge.buffer as ArrayBuffer,
            rpId: window.location.hostname,
            allowCredentials: [
                {
                    type: 'public-key',
                    id: base64ToArrayBuffer(credentialId),
                    transports: ['internal'], // Platform authenticator
                },
            ],
            userVerification: 'required',
            timeout: 60000,
        };

        // Perform the authentication
        const assertion = await navigator.credentials.get({
            publicKey: getOptions,
        }) as PublicKeyCredential;

        if (!assertion) {
            return false;
        }

        // In a production system, you would verify the signature against the stored public key
        // For this local-only implementation, we just check that the credential was used successfully
        return true;
    } catch (error) {
        console.error('Error authenticating with biometric:', error);

        if (error instanceof DOMException) {
            if (error.name === 'NotAllowedError') {
                throw new Error('Biometric authentication was cancelled or denied');
            }
        }

        return false;
    }
}

/**
 * Get information about available biometric types
 */
export async function getBiometricType(): Promise<'face' | 'fingerprint' | 'unknown' | 'none'> {
    if (!await isBiometricAvailable()) {
        return 'none';
    }

    // Unfortunately, the WebAuthn API doesn't provide information about
    // the specific type of biometric. We can make educated guesses based on the platform.
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        // iOS devices typically have Face ID (newer) or Touch ID (older)
        return 'face'; // Most modern iOS devices use Face ID
    } else if (userAgent.includes('mac')) {
        return 'fingerprint'; // Macs use Touch ID
    } else if (userAgent.includes('windows')) {
        return 'face'; // Windows Hello often uses facial recognition
    } else if (userAgent.includes('android')) {
        return 'fingerprint'; // Most Android devices use fingerprint
    }

    return 'unknown';
}

/**
 * Human-readable biometric type name
 */
export function getBiometricTypeName(type: 'face' | 'fingerprint' | 'unknown' | 'none'): string {
    switch (type) {
        case 'face':
            return 'Face ID';
        case 'fingerprint':
            return 'Fingerprint';
        case 'unknown':
            return 'Biometric';
        case 'none':
            return 'Not Available';
    }
}

export default {
    isWebAuthnSupported,
    isBiometricAvailable,
    registerBiometric,
    authenticateWithBiometric,
    getBiometricType,
    getBiometricTypeName,
};
