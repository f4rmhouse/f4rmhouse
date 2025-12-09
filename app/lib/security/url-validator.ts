/**
 * URL Security Validator
 * Prevents Server-Side Request Forgery (SSRF) attacks by validating target URLs
 */

import { URL } from 'url';

// Configuration for allowed hosts and patterns
interface SecurityConfig {
  allowedHosts: string[];
  allowedPorts: number[];
  allowedProtocols: string[];
  blockedNetworks: string[];
  maxRedirects: number;
  timeoutMs: number;
}

const DEFAULT_CONFIG: SecurityConfig = {
  // Only allow specific trusted hosts
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'mcp.deepwiki.com',
    'signin.mcp.shop',
    'hiutdenim.co.uk',
    'api.githubcopilot.com',
    'mcp.exa.ai',
    'mcp.context7.com',
    'mcp.icons8.com',
    'app.f4rmhouse.com',
    'mcp.api.coingecko.com',
    'remote.mcpservers.org',
    'mcp.apify.com',
    'mcp.canva.com',
    'mcp.linear.app',
    'mcp.sentry.dev',
    'mcp.intercom.com',
    'mcp.neon.tech',
    'mcp.paypal.com',
    'mcp.squareup.com',
    'mcp.asana.com',
    'mcp.atlassian.com',
    'mcp.wix.com',
    'mcp.webflow.com',
    'mcp.globalping.dev',
    'mcp.semgrep.ai',
    'remote.mcpservers.org',
    'api.dashboard.plaid.com',
    'mcp.stripe.com',
    'mcp.invideo.io',
    'mcp.audioscrape.com',
    'getdialer.app',
    'mcp.listenetic.com',
    'api.findadomain.dev',
    'mcp.notion.com',
    'mcp.octagonagents.com',
    'rag-mcp-2.whatsmcp.workers.dev',
    'scorecard-mcp.dare-d5b.workers.dev',
    'mcp.pipeboard.co',
    'mcp.turkishtechlab.com',
    'mcp.thekollektiv.ai',
    'mcp.simplescraper.io',
    'waystation.ai',
    'docs.mcp.cloudflare.com',
    'mcp.docs.astro.build',
    'mcp.deepwiki.com',
    'hf.co',
    'mcp.semgrep.ai',
    'mcp.remote-mcp.com',
    'mcp.llmtxt.dev',
    'gitmcp.io',
    'app.hubspot.com',
    'mcp.needle-ai.com',
    'mcp.zapier.com',
    'mcp.dappier.com',
    'mcp.mercadolibre.com',
    'mcp.mercadopago.com',
    'ai-assistant.short.io',
    'mcp.monday.com',
    'mcp.dodopayments.com',
    'api.polarsignals.com',
    'api.grafbase.com',
    'mcp.twelvedata.com',
    'mcp.financialdatasets.ai',
    'radar.mcp.cloudflare.com',
    'containers.mcp.cloudflare.com',
    'mcp.needle-ai.com',
    'mcp.norman.finance',
    'gralio.ai',
    'dice-rolling-mcp.vercel.app',
    'cloud.yepcode.io',
    'mcp.vapi.ai',
    'mcp.fulcradynamics.com',
    'mcp.getalby.com',
    'mcp.atlassian.com',
    'mcp.llmtxt.dev',
    'mcp.simplescraper.io',
    'mcp.beatandraise.com',
    'mcp.grep.app',
    'api.tally.so',
    'mcp.customer.io',
    'seolinkmap.com',
    'mcp.tickettailor.ai',
    'mcp.prompts.mcpcentral.io',
    'catalog.shopify.com',
    'mcp.bitte.ai',
    'mcp.coresignal.com',
    'mcp.himalayas.app',
    'mcp-keywordspeopleuse.com',
    'mcp.pearl.com',
    'aimcp.info',
    'www.audioscrape.com',
    'app.scorecard.io',
    'mcp.timeslope.com',
    'outlook-email.mintmcp.com',
    'www.mcp.timeslope.com',
    'gcal.mintmcp.com',
    'gmail.mintmcp.com',
    'mcp.coupler.io',
    'proto.rostro.dev'
    
    // Add your trusted MCP servers here
  ],
  // Only allow standard HTTP/HTTPS ports and common development ports
  allowedPorts: [80, 443, 8080, 3000, 3001, 5000, 8000],
  // Only allow HTTP and HTTPS
  allowedProtocols: ['http:', 'https:'],
  // Block private network ranges (RFC 1918, RFC 3927, etc.)
  blockedNetworks: [
    '10.0.0.0/8',
    '172.16.0.0/12', 
    '192.168.0.0/16',
    '169.254.0.0/16', // Link-local
    '127.0.0.0/8',    // Loopback (except 127.0.0.1)
    '::1/128',        // IPv6 loopback
    'fc00::/7',       // IPv6 private
    'fe80::/10',      // IPv6 link-local
  ],
  maxRedirects: 0, // Disable redirects to prevent redirect-based SSRF
  timeoutMs: 10000, // 10 second timeout
};

/**
 * Check if an IP address is in a CIDR range
 */
function isIpInCidr(ip: string, cidr: string): boolean {
  const [network, prefixLength] = cidr.split('/');
  const prefix = parseInt(prefixLength, 10);
  
  // Convert IP to 32-bit integer (IPv4 only for now)
  const ipToInt = (ip: string): number => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  };
  
  const ipInt = ipToInt(ip);
  const networkInt = ipToInt(network);
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  
  return (ipInt & mask) === (networkInt & mask);
}

/**
 * Resolve hostname to IP and check if it's in blocked networks
 */
async function isHostnameBlocked(hostname: string, config: SecurityConfig): Promise<boolean> {
  // Skip IP resolution for localhost and 127.0.0.1 as they're explicitly allowed
  if (hostname=="app.f4rmhouse.com" || hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }
  
  try {
    // Use Node.js dns module to resolve hostname
    const dns = await import('dns');
    const { promisify } = await import('util');
    const lookup = promisify(dns.lookup);
    
    const { address } = await lookup(hostname);
    
    // Check if resolved IP is in any blocked network
    for (const network of config.blockedNetworks) {
      if (network.includes(':')) {
        // Skip IPv6 for now - would need more complex logic
        continue;
      }
      
      if (isIpInCidr(address, network)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // If we can't resolve the hostname, block it for safety
    console.error('Failed to resolve hostname:', hostname, error);
    return true;
  }
}

/**
 * Validate a URL for SSRF protection
 */
export async function validateUrl(urlString: string, customConfig?: Partial<SecurityConfig>): Promise<{
  isValid: boolean;
  error?: string;
  sanitizedUrl?: string;
}> {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  
  try {
    // Parse and validate URL format
    const url = new URL(urlString);
    
    // Check protocol
    if (!config.allowedProtocols.includes(url.protocol)) {
      return {
        isValid: false,
        error: `Protocol ${url.protocol} is not allowed. Allowed protocols: ${config.allowedProtocols.join(', ')}`
      };
    }
    
    // Check hostname against allowlist
    if (!config.allowedHosts.includes(url.hostname)) {
      return {
        isValid: false,
        error: `Hostname ${url.hostname} is not in the allowlist. Allowed hosts: ${config.allowedHosts.join(', ')}`
      };
    }
    
    // Check port
    const port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
    if (!config.allowedPorts.includes(port)) {
      return {
        isValid: false,
        error: `Port ${port} is not allowed. Allowed ports: ${config.allowedPorts.join(', ')}`
      };
    }
    
    // Check if hostname resolves to blocked networks
    const isBlocked = await isHostnameBlocked(url.hostname, config);
    if (isBlocked) {
      return {
        isValid: false,
        error: `Hostname ${url.hostname} resolves to a blocked network range`
      };
    }
    
    // Remove any dangerous URL components
    url.username = '';
    url.password = '';
    
    return {
      isValid: true,
      sanitizedUrl: url.toString()
    };
    
  } catch (error) {
    return {
      isValid: false,
      error: `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Create a secure fetch wrapper with SSRF protection
 * Supports both regular requests and streaming (SSE) with separate timeout handling
 */
export async function secureFetch(
  urlString: string, 
  options: RequestInit = {},
  customConfig?: Partial<SecurityConfig>
): Promise<Response> {
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  
  // Validate URL
  const validation = await validateUrl(urlString, customConfig);
  if (!validation.isValid) {
    throw new Error(`SSRF Protection: ${validation.error}`);
  }
  
  // Use sanitized URL
  const url = validation.sanitizedUrl!;
  
  // Determine if this is likely a streaming request
  const isStreamingRequest = 
    options.headers && 
    (Object.entries(options.headers).some(([key, value]) => 
      key.toLowerCase() === 'accept' && 
      typeof value === 'string' && 
      value.includes('text/event-stream')
    ));
  
  // Add security headers and timeouts
  const secureOptions: RequestInit = {
    ...options,
    redirect: 'manual', // Prevent automatic redirects
    headers: {
      ...options.headers,
      // Remove potentially dangerous headers by setting them to undefined and filtering
    }
  };

  // Handle timeout based on request type
  if (config.timeoutMs > 0) {
    if (isStreamingRequest) {
      // For streaming requests, use a connection timeout only
      // Create a separate controller for connection establishment
      const connectionController = new AbortController();
      const connectionTimeout = setTimeout(() => {
        connectionController.abort();
      }, Math.min(config.timeoutMs, 1000)); // Max 1s for connection
      
      secureOptions.signal = connectionController.signal;
      
      // Filter out undefined headers for streaming requests
      if (secureOptions.headers) {
        const filteredHeaders: Record<string, string> = {};
        Object.entries(secureOptions.headers).forEach(([key, value]) => {
          if (value !== undefined && key !== 'Host' && key !== 'X-Forwarded-For' && key !== 'X-Real-IP') {
            filteredHeaders[key] = value as string;
          }
        });
        secureOptions.headers = filteredHeaders;
      }
      
      // Handle streaming request with connection timeout
      try {
        const response = await fetch(url, secureOptions);
        clearTimeout(connectionTimeout); // Clear timeout once response is established
        
        // Check for redirects and block them
        // if (response.status >= 300 && response.status < 400) {
        //   throw new Error('SSRF Protection: Redirects are not allowed');
        // }
        
        return response;
      } catch (error) {
        clearTimeout(connectionTimeout);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`SSRF Protection: Connection timeout after ${Math.min(config.timeoutMs, 15000)}ms`);
        }
        throw error;
      }
    } else {
      // For regular requests, use full timeout
      secureOptions.signal = AbortSignal.timeout(config.timeoutMs);
    }
  }
  
  // Filter out undefined headers for non-streaming requests
  if (secureOptions.headers) {
    const filteredHeaders: Record<string, string> = {};
    Object.entries(secureOptions.headers).forEach(([key, value]) => {
      if (value !== undefined && key !== 'Host' && key !== 'X-Forwarded-For' && key !== 'X-Real-IP') {
        filteredHeaders[key] = value as string;
      }
    });
    secureOptions.headers = filteredHeaders;
  }
  
  try {
    const response = await fetch(url, secureOptions);
    
    // Check for redirects and block them
    if (response.status >= 300 && response.status < 400) {
      throw new Error('SSRF Protection: Redirects are not allowed');
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error(`SSRF Protection: Request timeout after ${config.timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Extract and validate server_uri parameter from request
 */
export async function extractAndValidateServerUri(
  request: Request,
  defaultUrl: string,
  customConfig?: Partial<SecurityConfig>
): Promise<{
  isValid: boolean;
  url?: string;
  error?: string;
}> {
  const { searchParams } = new URL(request.url);
  const serverUri = searchParams.get('server_uri');
  
  if (!serverUri) {
    // Use default URL and validate it
    const validation = await validateUrl(defaultUrl, customConfig);
    return {
      isValid: validation.isValid,
      url: validation.sanitizedUrl,
      error: validation.error
    };
  }
  
  try {
    const decodedUri = decodeURIComponent(serverUri);
    const validation = await validateUrl(decodedUri, customConfig);
    
    return {
      isValid: validation.isValid,
      url: validation.sanitizedUrl,
      error: validation.error
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to decode server_uri parameter: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
