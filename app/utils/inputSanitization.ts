/**
 * Input sanitization utilities to prevent injection attacks
 */

// HTML entity encoding to prevent XSS
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Remove potentially dangerous characters and patterns
export function sanitizeInput(input: string): string {
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Limit length to prevent DoS
    .substring(0, 10000);
}

// URL validation with additional security checks
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    
    // Block localhost and private IP ranges in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = urlObj.hostname.toLowerCase();
      
      // Block localhost variations
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return { isValid: false, error: 'Localhost URLs are not allowed' };
      }
      
      // Block private IP ranges
      const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^192\.168\./,
        /^169\.254\./, // Link-local
        /^fc00:/, // IPv6 private
        /^fe80:/ // IPv6 link-local
      ];
      
      if (privateRanges.some(range => range.test(hostname))) {
        return { isValid: false, error: 'Private IP addresses are not allowed' };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

// Email validation with additional security
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Additional length checks
  if (email.length > 254) {
    return { isValid: false, error: 'Email address too long' };
  }
  
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email local part too long' };
  }
  
  return { isValid: true };
}

// Sanitize and validate all form inputs
export function sanitizeFormData(data: {
  mcpUrl: string;
  creator: string;
  description: string;
  email: string;
  paymentMethod: string;
  paymentInfo: string;
}): { sanitized: typeof data; errors: string[] } {
  const errors: string[] = [];
  
  // Sanitize all string inputs
  const sanitized = {
    mcpUrl: sanitizeInput(data.mcpUrl),
    creator: sanitizeInput(data.creator),
    description: sanitizeInput(data.description),
    email: sanitizeInput(data.email),
    paymentMethod: sanitizeInput(data.paymentMethod),
    paymentInfo: sanitizeInput(data.paymentInfo)
  };
  
  // Validate URL
  const urlValidation = validateUrl(sanitized.mcpUrl);
  if (!urlValidation.isValid) {
    errors.push(`URL validation failed: ${urlValidation.error}`);
  }
  
  // Validate email
  const emailValidation = validateEmail(sanitized.email);
  if (!emailValidation.isValid) {
    errors.push(`Email validation failed: ${emailValidation.error}`);
  }
  
  // Validate payment method
  if (!['paypal', 'crypto'].includes(sanitized.paymentMethod)) {
    errors.push('Invalid payment method');
  }
  
  // Validate creator name (no special characters except spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(sanitized.creator)) {
    errors.push('Creator name contains invalid characters');
  }
  
  // Validate payment info based on method
  if (sanitized.paymentMethod === 'paypal') {
    const paypalEmailValidation = validateEmail(sanitized.paymentInfo);
    if (!paypalEmailValidation.isValid) {
      errors.push(`PayPal email validation failed: ${paypalEmailValidation.error}`);
    }
  } else if (sanitized.paymentMethod === 'crypto') {
    // Basic crypto address validation (alphanumeric + some special chars)
    if (!/^[a-zA-Z0-9]{20,100}$/.test(sanitized.paymentInfo.replace(/[^a-zA-Z0-9]/g, ''))) {
      errors.push('Invalid crypto wallet address format');
    }
  }
  
  return { sanitized, errors };
}
