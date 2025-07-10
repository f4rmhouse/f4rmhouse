/**
 * Encryption utilities for securing sensitive data like tokens and credentials
 * Uses AES-GCM encryption for authenticated encryption with additional data (AEAD)
 */

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  salt: string;
}

export class TokenEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly SALT_LENGTH = 16; // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits

  /**
   * Derives a cryptographic key from a password using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // OWASP recommended minimum
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts sensitive data using AES-GCM
   */
  static async encrypt(data: string, password: string): Promise<EncryptedData> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Generate random salt and IV
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Derive key from password
      const key = await this.deriveKey(password, salt);

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH * 8 // Convert to bits
        },
        key,
        dataBuffer
      );

      // Convert to base64 for storage/transmission
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encryptedData = btoa(String.fromCharCode(...encryptedArray));
      const ivBase64 = btoa(String.fromCharCode(...iv));
      const saltBase64 = btoa(String.fromCharCode(...salt));

      return {
        encryptedData,
        iv: ivBase64,
        salt: saltBase64
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts data that was encrypted with the encrypt method
   */
  static async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    try {
      // Convert from base64
      const encryptedBuffer = Uint8Array.from(atob(encryptedData.encryptedData), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
      const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));

      // Derive the same key
      const key = await this.deriveKey(password, salt);

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH * 8
        },
        key,
        encryptedBuffer
      );

      // Convert back to string
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - invalid password or corrupted data');
    }
  }

  /**
   * Generates a secure random password for encryption
   * Useful for generating encryption keys that can be stored securely
   */
  static generateSecurePassword(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, byte => charset[byte % charset.length]).join('');
  }

  /**
   * Encrypts a token object for secure transmission
   */
  static async encryptToken(token: any, password: string): Promise<EncryptedData> {
    const tokenString = JSON.stringify(token);
    return this.encrypt(tokenString, password);
  }

  /**
   * Decrypts a token object
   */
  static async decryptToken(encryptedData: EncryptedData, password: string): Promise<any> {
    const tokenString = await this.decrypt(encryptedData, password);
    return JSON.parse(tokenString);
  }

  /**
   * Creates a hash of sensitive data for verification purposes
   * Useful for checking data integrity without storing the actual data
   */
  static async createHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = new Uint8Array(hashBuffer);
    return btoa(String.fromCharCode(...hashArray));
  }

  /**
   * Securely compares two strings to prevent timing attacks
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

/**
 * Environment-specific encryption configuration
 */
export class EncryptionConfig {
  /**
   * Gets the encryption password from environment or generates one
   * In production, this should come from a secure environment variable
   * @param username Optional username for secure client-side key derivation
   */
  static getEncryptionPassword(username?: string): string {
    if (typeof window === 'undefined') {
      // Server-side - MUST have environment variable
      if (!process.env.ENCRYPTION_PASSWORD) {
        throw new Error('ENCRYPTION_PASSWORD environment variable is required for server-side encryption');
      }
      return process.env.ENCRYPTION_PASSWORD;
    } else {
      // Client-side - use username-derived key
      return this.getClientEncryptionPassword(username);
    }
  }

  /**
   * Get encryption password with proper security hierarchy for client-side
   * @param username Optional username for secure key derivation
   */
  private static getClientEncryptionPassword(username?: string): string {
    // Priority 1: Use provided username for secure key derivation
    if (username) {
      // Create deterministic key from username
      const keyMaterial = `f4rmhouse:${username}:encryption-key-v1`;
      return btoa(keyMaterial).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
    }
    
    // Priority 2: Use sessionStorage (cleared on tab close, more secure than localStorage)
    const sessionKeyName = 'f4rmhouse-session-key';
    let sessionKey = sessionStorage.getItem(sessionKeyName);
    if (!sessionKey) {
      sessionKey = TokenEncryption.generateSecurePassword(32);
      sessionStorage.setItem(sessionKeyName, sessionKey);
      console.warn('Using session-based encryption key. Pass username to getClientEncryptionPassword() for better security.');
    }
    
    return sessionKey;
  }
}
