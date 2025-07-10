/**
 * Example usage of the token encryption system
 * This file demonstrates how the encryption/decryption flow works
 */

import { TokenEncryption, EncryptionConfig } from './encryption';
import TokenType from '../../components/types/TokenType';

/**
 * Example: Complete encryption/decryption flow
 */
export async function demonstrateTokenEncryption() {
  console.log('🔐 Token Encryption/Decryption Demo');
  console.log('=====================================');

  // Sample token data (like what would be sent to createToken)
  const originalToken: TokenType = {
    username: "john_doe",
    server: "api.example.com",
    token: "oauth2_access_token_abc123xyz789",
    provider: "github"
  };

  console.log('📝 Original Token:', originalToken);

  try {
    // Step 1: Encrypt the token (what happens in createToken)
    const encryptionPassword = EncryptionConfig.getEncryptionPassword();
    const encryptedData = await TokenEncryption.encryptToken(originalToken, encryptionPassword);
    
    console.log('🔒 Encrypted Data Structure:');
    console.log('  - encryptedData:', encryptedData.encryptedData.substring(0, 50) + '...');
    console.log('  - iv:', encryptedData.iv);
    console.log('  - salt:', encryptedData.salt);

    // Step 2: Simulate server response format
    const serverResponse = {
      success: true,
      encryptedData: encryptedData,
      encrypted: true,
      timestamp: new Date().toISOString()
    };

    console.log('📡 Server Response Format:', {
      ...serverResponse,
      encryptedData: '{ encrypted token data... }'
    });

    // Step 3: Decrypt the token (what happens in getToken)
    const decryptedToken = await TokenEncryption.decryptToken(encryptedData, encryptionPassword);
    
    console.log('🔓 Decrypted Token:', decryptedToken);

    // Step 4: Verify integrity
    const isMatch = JSON.stringify(originalToken) === JSON.stringify(decryptedToken);
    console.log('✅ Encryption/Decryption Success:', isMatch);

    if (!isMatch) {
      throw new Error('Token integrity check failed!');
    }

    return {
      original: originalToken,
      encrypted: encryptedData,
      decrypted: decryptedToken,
      success: true
    };

  } catch (error) {
    console.error('❌ Encryption/Decryption Error:', error);
    throw error;
  }
}

/**
 * Example: Testing with different passwords (should fail)
 */
export async function demonstrateSecurityValidation() {
  console.log('\n🛡️  Security Validation Demo');
  console.log('==============================');

  const testToken = { test: "data", sensitive: "information" };
  const correctPassword = "correct-password-123";
  const wrongPassword = "wrong-password-456";

  try {
    // Encrypt with correct password
    const encrypted = await TokenEncryption.encrypt(
      JSON.stringify(testToken), 
      correctPassword
    );
    console.log('✅ Encryption with correct password: SUCCESS');

    // Try to decrypt with wrong password (should fail)
    try {
      await TokenEncryption.decrypt(encrypted, wrongPassword);
      console.log('❌ Security BREACH: Wrong password accepted!');
    } catch (error) {
      console.log('✅ Security VALIDATED: Wrong password rejected');
    }

    // Decrypt with correct password (should succeed)
    const decrypted = await TokenEncryption.decrypt(encrypted, correctPassword);
    const decryptedObj = JSON.parse(decrypted);
    console.log('✅ Decryption with correct password: SUCCESS');
    console.log('📝 Decrypted data:', decryptedObj);

  } catch (error) {
    console.error('❌ Security validation error:', error);
  }
}

/**
 * Example: Performance testing
 */
export async function demonstratePerformance() {
  console.log('\n⚡ Performance Demo');
  console.log('===================');

  const testData = "This is a test token with some sensitive information";
  const password = EncryptionConfig.getEncryptionPassword();
  const iterations = 10;

  // Encryption performance
  const encryptStart = performance.now();
  const encryptedResults = [];
  
  for (let i = 0; i < iterations; i++) {
    const encrypted = await TokenEncryption.encrypt(testData, password);
    encryptedResults.push(encrypted);
  }
  
  const encryptEnd = performance.now();
  const encryptTime = encryptEnd - encryptStart;
  
  console.log(`🔒 Encrypted ${iterations} tokens in ${encryptTime.toFixed(2)}ms`);
  console.log(`📊 Average encryption time: ${(encryptTime / iterations).toFixed(2)}ms per token`);

  // Decryption performance
  const decryptStart = performance.now();
  
  for (const encrypted of encryptedResults) {
    await TokenEncryption.decrypt(encrypted, password);
  }
  
  const decryptEnd = performance.now();
  const decryptTime = decryptEnd - decryptStart;
  
  console.log(`🔓 Decrypted ${iterations} tokens in ${decryptTime.toFixed(2)}ms`);
  console.log(`📊 Average decryption time: ${(decryptTime / iterations).toFixed(2)}ms per token`);
}

/**
 * Run all demonstrations
 */
export async function runAllDemos() {
  try {
    await demonstrateTokenEncryption();
    await demonstrateSecurityValidation();
    await demonstratePerformance();
    console.log('\n🎉 All demos completed successfully!');
  } catch (error) {
    console.error('\n💥 Demo failed:', error);
  }
}

// Uncomment to run demos when this file is executed directly
// if (typeof window === 'undefined') {
//   runAllDemos();
// }
