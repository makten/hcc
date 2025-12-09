# Authentication System Documentation

## Overview

The Home Control Center implements a robust multi-user authentication system with Role-Based Access Control (RBAC), secure PIN protection, and biometric authentication support.

## Features

### 1. PIN Hashing (Security)

PINs are **never stored in plain text**. The system uses industry-standard cryptographic practices:

- **Algorithm**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Hash Function**: SHA-256
- **Iterations**: 100,000
- **Salt**: 16 bytes random, unique per PIN
- **Output**: 256-bit derived key

#### How It Works

1. When a user creates or updates their PIN, the system:
   - Generates a cryptographically random 16-byte salt
   - Derives a 256-bit key using PBKDF2-SHA256 with 100,000 iterations
   - Stores both the salt and hash in the user profile

2. During PIN verification:
   - Retrieves the stored salt
   - Derives a key from the entered PIN using the same parameters
   - Uses constant-time comparison to prevent timing attacks

#### API Usage

```typescript
import { createPinHash, verifyPinHash } from '@/utils/crypto';

// Creating a hashed PIN
const hashedPin = await createPinHash('1234');
// Returns: { salt: '...', hash: '...' }

// Verifying a PIN
const isValid = await verifyPinHash('1234', hashedPin);
// Returns: true/false
```

### 2. Biometric Authentication

The system supports platform authenticators using the Web Authentication API (WebAuthn):

- **Face ID** (iOS/macOS)
- **Touch ID** (iOS/macOS)
- **Windows Hello** (Windows)
- **Fingerprint** (Android)

#### Security Features

- Credentials are stored locally on the device
- Uses public key cryptography
- Each authentication generates a unique challenge
- Prevents replay attacks

#### API Usage

```typescript
import { 
    isBiometricAvailable, 
    registerBiometric, 
    authenticateWithBiometric,
    getBiometricType 
} from '@/utils/biometric';

// Check availability
const available = await isBiometricAvailable();

// Get biometric type
const type = await getBiometricType(); // 'face' | 'fingerprint' | 'unknown' | 'none'

// Register biometric for a user
const result = await registerBiometric(userId, userName);
// Returns: { credentialId, publicKey } | null

// Authenticate
const success = await authenticateWithBiometric(credentialId);
```

### 3. Role-Based Access Control (RBAC)

Three user roles with distinct permissions:

| Permission | Admin | User (Family) | Guest |
|------------|:-----:|:-------------:|:-----:|
| Control Devices | ✅ | ✅ | ✅* |
| View Cameras | ✅ | ✅ | ❌ |
| Edit Rooms | ✅ | ❌ | ❌ |
| Edit Devices | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Access Settings | ✅ | ❌ | ❌ |
| View Energy | ✅ | ✅ | ❌ |
| Create Scenes | ✅ | ✅ | ❌ |
| Use Intercom | ✅ | ✅ | ❌ |
| Room Access | All | All | Configured |

*Guests can only control devices in rooms they have been granted access to.

### 4. Guest Room Restrictions

Administrators can configure which rooms a guest user can access:

1. Navigate to **Settings > Users**
2. Click the **Room Access** button (🏠) for a guest user
3. Select the rooms the guest should have access to
4. Click **Save Access**

Guests will only be able to:
- See devices in their allowed rooms
- Control devices in their allowed rooms

## Components

### RestrictedAccess

Wrapper component for permission-based access control:

```tsx
import { RestrictedAccess } from '@/components/auth';

<RestrictedAccess 
    permission="canAccessSettings"
    fallbackMessage="Only administrators can access this page"
>
    <YourProtectedContent />
</RestrictedAccess>
```

### PinConfirmModal

Modal for PIN confirmation on sensitive actions:

```tsx
import { PinConfirmModal } from '@/components/auth';
import { usePinProtectedAction } from '@/hooks';

function MyComponent() {
    const { executeWithPin, modalProps } = usePinProtectedAction();

    const handleDestructiveAction = () => {
        executeWithPin(() => {
            // This runs after successful PIN confirmation
            performDestructiveAction();
        }, {
            actionType: 'destructive',
            title: 'Confirm Action',
            description: 'This action cannot be undone.',
        });
    };

    return (
        <>
            <button onClick={handleDestructiveAction}>
                Dangerous Action
            </button>
            <PinConfirmModal {...modalProps} />
        </>
    );
}
```

## Hooks

### usePinProtectedAction

Encapsulates PIN protection logic for sensitive actions:

```typescript
const {
    isModalOpen,      // Whether the PIN modal is open
    openModal,        // Open the modal manually
    closeModal,       // Close the modal manually
    executeWithPin,   // Execute an action with PIN protection
    pendingAction,    // The action waiting for confirmation
    modalProps,       // Props to spread on PinConfirmModal
} = usePinProtectedAction();
```

### useRequirePermission

Check if current user has a specific permission:

```typescript
const canEdit = useRequirePermission('canEditRooms');
```

### usePermissions

Get all permission-related helpers:

```typescript
const {
    isAdmin,      // boolean
    isUser,       // boolean
    isGuest,      // boolean
    role,         // 'admin' | 'user' | 'guest'
    hasPermission,// (permission) => boolean
    canAccessRoom,// (roomId) => boolean
    permissions,  // RolePermissions object
    user,         // Current UserProfile
} = usePermissions();
```

## User Profile Structure

```typescript
interface UserProfile {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role: 'admin' | 'user' | 'guest';
    
    // Authentication
    pin?: string;                    // Legacy plain text (deprecated)
    pinHash?: HashedPinData;         // Secure hashed PIN
    biometricEnabled?: boolean;      // Biometric auth enabled
    biometricCredentialId?: string;  // WebAuthn credential ID
    
    // Guest restrictions
    allowedRooms?: string[];         // Rooms guest can access
    
    // Preferences
    preferences: UserPreferences;
    
    // Timestamps
    createdAt: string;
    lastLogin?: string;
}
```

## Migration Guide

### Migrating Plain Text PINs to Hashed

The system automatically handles both legacy plain text PINs and new hashed PINs:

1. **Reading**: Checks `pinHash` first, falls back to `pin`
2. **Writing**: Always creates `pinHash`, removes plain `pin`

To manually migrate a user's PIN:

```typescript
const { updateUserPin } = useAuth();
await updateUserPin(userId, existingPlainTextPin);
// This will hash the PIN and remove the plain text version
```

## Security Best Practices

1. **Never log PINs** - The system only logs hashed values
2. **Use PIN protection for destructive actions** - Reset config, delete users, etc.
3. **Limit guest access** - Only grant access to necessary rooms
4. **Enable biometric when available** - Faster and more secure than PINs
5. **Regular security audits** - Review user access and permissions periodically

## Future Enhancements

- [ ] Session timeout and auto-logout
- [ ] Multi-factor authentication (PIN + Biometric)
- [ ] Audit logging for sensitive actions
- [ ] Password strength indicators
- [ ] Remote session management
- [ ] Emergency access codes
