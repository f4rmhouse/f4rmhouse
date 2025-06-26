# Security Guide

## SSRF Protection Implementation

This application implements comprehensive Server-Side Request Forgery (SSRF) protection across all proxy endpoints. This document explains the security measures and how to configure them.

## Overview

The following endpoints have been secured against SSRF attacks:
- `/api/mcp/route.ts` - Main MCP proxy endpoint
- `/api/mcp/sse/route.ts` - SSE streaming proxy endpoint  
- `/api/mcp/streamable/route.ts` - Streamable proxy endpoint

## Security Features

### 1. URL Validation (`url-validator.ts`)

**Host Allowlisting**: Only allows requests to pre-approved hosts
- Blocks all hosts not in the allowlist
- Prevents access to internal services
- Configurable per environment

**Protocol Restriction**: Only allows HTTP and HTTPS protocols
- Blocks file://, ftp://, gopher://, and other dangerous protocols
- Prevents local file access and other protocol-based attacks

**Port Filtering**: Restricts allowed ports
- Only allows standard web ports and common development ports
- Prevents access to internal services on unusual ports

**Network Range Blocking**: Prevents access to private networks
- Blocks RFC 1918 private networks (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
- Blocks link-local addresses (169.254.x.x)
- Blocks localhost range (except explicitly allowed 127.0.0.1)
- Blocks IPv6 private ranges

**DNS Resolution Security**: Validates resolved IP addresses
- Resolves hostnames to IP addresses
- Checks if resolved IPs fall within blocked network ranges
- Blocks requests if hostname resolves to private networks

**Redirect Prevention**: Disables automatic redirects
- Sets `redirect: 'manual'` to prevent following redirects
- Prevents redirect-based SSRF attacks
- Returns error if server attempts redirect

**Request Timeouts**: Implements request timeouts
- 10-second timeout in development
- 5-second timeout in production
- Prevents hanging requests and resource exhaustion

### 2. Centralized Configuration (`proxy-config.ts`)

**Environment-Specific Settings**:
- Development: More permissive settings for local development
- Production: Stricter settings, removes localhost access

**Easy Host Management**:
```typescript
allowedHosts: [
  'localhost',           // Local development
  '127.0.0.1',          // Local development
  'mcp.deepwiki.com',   // Trusted MCP server
  'signin.mcp.shop',    // Trusted MCP server
  // Add your trusted servers here
]
```

## Configuration

### Adding Trusted Hosts

To add a new trusted MCP server, edit `/app/lib/security/proxy-config.ts`:

```typescript
allowedHosts: [
  // Existing hosts...
  'your-mcp-server.com',
  'api.your-service.com',
]
```

### Adding Custom Ports

If your MCP server runs on a non-standard port:

```typescript
allowedPorts: [
  // Existing ports...
  9000,  // Your custom port
]
```

### Environment Variables

You can override security settings using environment variables:

```bash
# In production, be more restrictive
NODE_ENV=production

# Custom timeout (milliseconds)
PROXY_TIMEOUT_MS=5000
```

## Security Best Practices

### 1. Principle of Least Privilege
- Only add hosts you absolutely trust to the allowlist
- Use the minimum required ports
- Regularly review and remove unused hosts

### 2. Regular Security Audits
- Review allowed hosts quarterly
- Monitor proxy logs for suspicious activity
- Update security configurations as needed

### 3. Network Segmentation
- Run MCP servers in isolated network segments
- Use firewalls to restrict internal network access
- Implement proper authentication on MCP servers

### 4. Monitoring and Logging
- Monitor failed validation attempts
- Log all proxy requests for audit trails
- Set up alerts for suspicious patterns

## Error Handling

The security system provides detailed error messages for debugging:

```
Invalid server URI: Hostname example.com is not in the allowlist. Allowed hosts: localhost, 127.0.0.1, mcp.deepwiki.com
```

In production, consider sanitizing error messages to avoid information disclosure.

## Testing Security

### Valid Requests
```bash
# Should work - localhost is allowed
curl "http://localhost:3000/api/mcp?server_uri=http://localhost:8080/mcp"

# Should work - trusted host
curl "http://localhost:3000/api/mcp?server_uri=https://mcp.deepwiki.com/api"
```

### Blocked Requests
```bash
# Should be blocked - not in allowlist
curl "http://localhost:3000/api/mcp?server_uri=http://evil.com/steal"

# Should be blocked - private network
curl "http://localhost:3000/api/mcp?server_uri=http://192.168.1.1/admin"

# Should be blocked - dangerous protocol
curl "http://localhost:3000/api/mcp?server_uri=file:///etc/passwd"
```

## Incident Response

If you suspect an SSRF attack:

1. **Immediate Actions**:
   - Check proxy logs for suspicious requests
   - Review allowed hosts configuration
   - Temporarily disable proxy if needed

2. **Investigation**:
   - Analyze request patterns
   - Check for data exfiltration
   - Review internal network access logs

3. **Remediation**:
   - Update security configurations
   - Patch any discovered vulnerabilities
   - Implement additional monitoring

## Additional Security Measures

Consider implementing these additional security layers:

### 1. Rate Limiting
```typescript
// Add to your middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 2. Authentication
```typescript
// Require API keys for proxy access
const apiKey = request.headers.get('X-API-Key');
if (!isValidApiKey(apiKey)) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 3. Request Size Limits
```typescript
// Limit request body size
const MAX_BODY_SIZE = 1024 * 1024; // 1MB
if (request.headers.get('content-length') > MAX_BODY_SIZE) {
  return new Response('Request too large', { status: 413 });
}
```

### 4. Content Type Validation
```typescript
// Only allow specific content types
const contentType = request.headers.get('content-type');
if (!['application/json', 'text/plain'].includes(contentType)) {
  return new Response('Invalid content type', { status: 400 });
}
```

## Compliance and Standards

This implementation follows security best practices from:
- OWASP Top 10 (A10:2021 - Server-Side Request Forgery)
- NIST Cybersecurity Framework
- CWE-918: Server-Side Request Forgery (SSRF)

## Support

For security-related questions or to report vulnerabilities:
- Create a private GitHub issue
- Contact the security team directly
- Follow responsible disclosure practices
