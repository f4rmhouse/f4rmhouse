/**
 * Proxy Security Configuration
 * Centralized configuration for SSRF protection across all proxy endpoints
 */

export interface ProxySecurityConfig {
  allowedHosts: string[];
  allowedPorts: number[];
  allowedProtocols: string[];
  blockedNetworks: string[];
  maxRedirects: number;
  timeoutMs: number;
}

/**
 * Default security configuration for MCP proxy endpoints
 * Add your trusted MCP servers to allowedHosts
 */
export const MCP_PROXY_CONFIG: ProxySecurityConfig = {
  allowedHosts: [
    // Local development
    'localhost',
    '127.0.0.1',
    
    // Trusted MCP servers - ADD YOUR SERVERS HERE
    'mcp.deepwiki.com',
    'signin.mcp.shop',
    'hiutdenim.co.uk',
    'api.githubcopilot.com',
    'mcp.exa.ai',
    'mcp.context7.com',
    'mcp.icons8.com',
    
    // Example: Add your own MCP servers
    // 'your-mcp-server.com',
    // 'api.your-service.com',
  ],
  
  allowedPorts: [
    80,    // HTTP
    443,   // HTTPS
    8080,  // Common development port
    3000,  // Common development port
    3001,  // Common development port
    5000,  // Common development port
    8000,  // Common development port
    // Add other ports as needed for your MCP servers
  ],
  
  allowedProtocols: ['http:', 'https:'],
  
  // Block private network ranges to prevent internal network access
  blockedNetworks: [
    '10.0.0.0/8',        // Private Class A
    '172.16.0.0/12',     // Private Class B
    '192.168.0.0/16',    // Private Class C
    '169.254.0.0/16',    // Link-local
    '127.0.0.0/8',       // Loopback (except 127.0.0.1 which is explicitly allowed)
    '::1/128',           // IPv6 loopback
    'fc00::/7',          // IPv6 private
    'fe80::/10',         // IPv6 link-local
  ],
  
  maxRedirects: 0,    // Disable redirects to prevent redirect-based SSRF
  timeoutMs: 10000,   // 10 second timeout
};

/**
 * Environment-specific configuration overrides
 */
export function getProxyConfig(): ProxySecurityConfig {
  const baseConfig = { ...MCP_PROXY_CONFIG };
  
  // In development, you might want to be more permissive
  if (process.env.NODE_ENV === 'development') {
    // You can add development-specific hosts here if needed
    // baseConfig.allowedHosts.push('dev-server.local');
  }
  
  // In production, ensure we're more restrictive
  if (process.env.NODE_ENV === 'production') {
    // Remove localhost in production if not needed
    baseConfig.allowedHosts = baseConfig.allowedHosts.filter(
      host => host !== 'localhost' && host !== '127.0.0.1'
    );
    
    // Reduce timeout in production
    baseConfig.timeoutMs = 20000;
  }
  
  return baseConfig;
}

/**
 * Validate that a host is in the allowlist
 */
export function isHostAllowed(hostname: string): boolean {
  const config = getProxyConfig();
  return config.allowedHosts.includes(hostname);
}

/**
 * Get allowed hosts for error messages
 */
export function getAllowedHostsList(): string {
  const config = getProxyConfig();
  return config.allowedHosts.join(', ');
}
