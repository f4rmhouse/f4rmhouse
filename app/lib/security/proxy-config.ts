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
    'app.f4rmhouse.com',
    
    // Trusted MCP servers - ADD YOUR SERVERS HERE
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
    'gmail.mintmcp.com',
    'gcal.mintmcp.com',
    'mcp.coupler.io',
    'proto.rostro.dev'
    
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
    // baseConfig.allowedHosts = baseConfig.allowedHosts.filter(
    //   host => host !== 'localhost' && host !== '127.0.0.1' && host !== "app.f4rmhouse.com"
    // );
    
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
