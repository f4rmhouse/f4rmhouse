# Token Encryption System

This directory contains security utilities for encrypting sensitive data, particularly authentication tokens and credentials.

## Overview

The encryption system addresses critical security vulnerabilities identified in the security audit, specifically:
- Client-side sensitive data storage without encryption
- Token exposure during transmission
- Secure handling of OAuth tokens and API keys

## Components

### `encryption.ts`
Core encryption utilities using AES-GCM (Authenticated Encryption with Additional Data).

#### Key Features:
- **AES-GCM Encryption**: Provides both confidentiality and authenticity
- **PBKDF2 Key Derivation**: Secure key derivation from passwords
- **Random Salt & IV**: Each encryption uses unique salt and initialization vector
- **Base64 Encoding**: Safe for JSON transmission and storage
- **Timing Attack Protection**: Secure string comparison functions

### `EncryptionConfig`
Environment-specific configuration for encryption passwords and settings.

## Usage Examples

### Basic Token Encryption

```typescript
import { TokenEncryption, EncryptionConfig } from '../lib/security/encryption';

// Encrypt a token
const token = {
  username: "user123",
  server: "api.example.com",
  token: "sensitive-token-value",
  provider: "oauth"
};

const password = EncryptionConfig.getEncryptionPassword();
const encryptedData = await TokenEncryption.encryptToken(token, password);

// Send encrypted data to server
const response = await fetch('/api/tokens', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    encryptedData: encryptedData,
    encrypted: true
  })
});
```

### Decrypting Tokens

```typescript
// Decrypt received token
const decryptedToken = await TokenEncryption.decryptToken(encryptedData, password);
console.log(decryptedToken); // Original token object
```

### Manual Encryption/Decryption

```typescript
// Encrypt any string
const sensitiveData = "api-key-12345";
const encrypted = await TokenEncryption.encrypt(sensitiveData, password);

// Decrypt
const decrypted = await TokenEncryption.decrypt(encrypted, password);
```

## Security Configuration

### Environment Variables

For production deployments, set the encryption password via environment variable:

```bash
export ENCRYPTION_PASSWORD="your-secure-encryption-password-here"
```

### Client-Side Key Management

The system automatically handles client-side encryption keys:
- Derives keys from user session data when available
- Generates and stores secure random keys in localStorage
- Falls back to environment-specific defaults

## Security Best Practices

### Password Requirements
- Minimum 32 characters for encryption passwords
- Use cryptographically secure random generation
- Store in secure environment variables, not in code

### Key Rotation
- Regularly rotate encryption passwords
- Implement versioning for encrypted data
- Provide migration path for re-encryption

### Storage Security
- Never store encryption passwords in localStorage
- Use secure key derivation from user authentication
- Consider using Web Crypto API key storage for enhanced security

## Implementation Details

### Encryption Algorithm: AES-GCM
- **Key Size**: 256 bits
- **IV Size**: 96 bits (12 bytes)
- **Tag Size**: 128 bits (16 bytes)
- **Salt Size**: 128 bits (16 bytes)

### Key Derivation: PBKDF2
- **Hash Function**: SHA-256
- **Iterations**: 100,000 (OWASP recommended minimum)
- **Salt**: Random 128-bit salt per encryption

### Data Format
Encrypted data is returned as an object:
```typescript
{
  encryptedData: string; // Base64 encoded encrypted data + auth tag
  iv: string;           // Base64 encoded initialization vector
  salt: string;         // Base64 encoded salt for key derivation
}
```

## Error Handling

The encryption system provides clear error messages:
- `"Failed to encrypt data"` - Encryption process failed
- `"Failed to decrypt data - invalid password or corrupted data"` - Decryption failed

Always handle these errors appropriately in your application:

```typescript
try {
  const encrypted = await TokenEncryption.encrypt(data, password);
  // Handle success
} catch (error) {
  console.error('Encryption failed:', error.message);
  // Handle error appropriately
}
```

## Testing

The encryption system is designed to be testable:

```typescript
// Test encryption/decryption round trip
const originalData = "test data";
const password = "test-password";

const encrypted = await TokenEncryption.encrypt(originalData, password);
const decrypted = await TokenEncryption.decrypt(encrypted, password);

console.assert(originalData === decrypted, "Round trip failed");
```

## Integration with Existing Code

The `User.createToken()` method has been updated to automatically encrypt tokens:

```typescript
// Before (insecure)
const response = await axios.post('/api/tokens', token);

// After (secure)
const encryptedToken = await TokenEncryption.encryptToken(token, password);
const response = await axios.post('/api/tokens', {
  encryptedData: encryptedToken,
  encrypted: true
});
```

## Server-Side Considerations

Your server must be updated to handle encrypted tokens:

1. Check for `encrypted: true` flag in requests
2. Decrypt the `encryptedData` using the same password
3. Process the decrypted token normally

Example server-side decryption:
```javascript
if (req.body.encrypted) {
  const decryptedToken = await TokenEncryption.decryptToken(
    req.body.encryptedData, 
    process.env.ENCRYPTION_PASSWORD
  );
  // Process decryptedToken
}
```

## Compliance

This encryption system helps achieve compliance with:
- **GDPR**: Encryption of personal data
- **SOC 2**: Data protection controls
- **OWASP**: Secure coding practices
- **NIST**: Cryptographic standards

## Monitoring and Logging

Consider implementing:
- Encryption/decryption success/failure metrics
- Key rotation tracking
- Performance monitoring for crypto operations
- Security event logging (without exposing sensitive data)
