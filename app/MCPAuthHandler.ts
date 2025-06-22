import axios from "axios";

/**
 * MCPAuthHandler - OAuth 2.0 Authentication Handler for MCP (Model Context Protocol) Servers
 * 
 * This class provides OAuth 2.0 authentication functionality including:
 * - Static OAuth provider configurations
 * - PKCE (Proof Key for Code Exchange) implementation for public clients
 * - Dynamic client registration (RFC 7591)
 * - Authorization code flow management
 */
export default class MCPAuthHandler {
    /**
     * Returns OAuth 2.0 configuration for different providers
     * @param provider - The OAuth provider identifier (google, github, linear, etc.)
     * @returns OAuth configuration object with redirect_uri and token_url
     */
    static oauth2(provider: string) {
        switch (provider) {
          case "google":
            return {
              redirect_uri: "http://localhost:3000/auth/google", 
              token_url: "https://accounts.google.com/o/oauth2/v2/auth",
              authorization_server: "",
              client_id: ""
            }
          case "github":
            return {
              redirect_uri: "http://localhost:3000/auth/github", 
              token_url: "https://github.com/login/oauth/access_token",
              authorization_server: "https://linear.app/oauth/authorize",
              client_id: ""
            }
          case "linear":
            return {
              redirect_uri: "http://localhost:3000/auth/linear", 
              token_url: "https://api.linear.app/oauth/token",
              client_secret: process.env.LINEAR_CLIENT_SECRET,
              authroization_server: "https://mcp.linear.app/authorize",
              client_id: ""
            }
          default:
            return {
              redirect_uri: "unknown", 
              token_url: "unknown",
              authorization_server: "unknown",
              client_id: "unknown"
            }
        }
    }

    /**
     * Generates a cryptographically secure code verifier for PKCE
     * @returns Base64URL-encoded random string (43-128 characters)
     */
    static generateCodeVerifier() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode.apply(null, Array.from(array)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
      
    /**
     * Generates a SHA256 code challenge from the code verifier for PKCE
     * @param codeVerifier - The code verifier string
     * @returns Base64URL-encoded SHA256 hash of the code verifier
     */
    static async generateCodeChallenge(codeVerifier: string) {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    }
}

/**
 * OAuthClient - Object-oriented OAuth 2.0 client implementation
 * 
 * Represents an OAuth 2.0 client with dynamic registration capabilities.
 * Implements RFC 7591 (Dynamic Client Registration) and RFC 7636 (PKCE).
 */
export class OAuthClient {
  // Core OAuth 2.0 client properties (RFC 7591)
  private id: string;
  private client_name: string;           // Human-readable client name
  private redirect_uris: string[];       // List of valid redirect URIs
  private grant_types: string[];         // Supported OAuth grant types
  private response_types: string[];      // Supported OAuth response types
  private scope: string;                 // Requested OAuth scopes
  private token_endpoint_auth_method: string; // Client authentication method
  private application_type: string;      // Client type: "web" or "native"

  // PKCE properties (RFC 7636)
  private code_challenge: string;        // SHA256 hash of code_verifier
  private code_challenge_method: string; // Always "S256" for SHA256

  // Server configuration
  private server_metadata: any;          // OAuth server metadata

  /**
   * Creates a new OAuth client instance
   * @param client_name - Human-readable name for the client
   * @param redirect_uris - Array of valid redirect URIs
   * @param grant_types - Array of OAuth grant types (e.g., ["authorization_code"])
   * @param response_types - Array of OAuth response types (e.g., ["code"])
   * @param scope - Space-separated list of OAuth scopes
   * @param token_endpoint_auth_method - Authentication method ("none", "client_secret_post", etc.)
   * @param application_type - Client type ("web" for confidential, "native" for public)
   */
  constructor(oauthClient: OauthClientType, server_metadata?: any) {
    this.id = oauthClient.id
    this.client_name = oauthClient.client_name;
    this.redirect_uris = oauthClient.redirect_uris;
    this.grant_types = oauthClient.grant_types;
    this.response_types = oauthClient.response_types;
    this.scope = oauthClient.scope;
    this.token_endpoint_auth_method = oauthClient.token_endpoint_auth_method;
    this.application_type = oauthClient.application_type;

    // Initialize PKCE properties
    this.code_challenge = "";
    this.code_challenge_method = "";

    this.server_metadata = server_metadata
  }

  /**
   * Configures the client based on server metadata and enables PKCE if needed
   * @param codeChallenge - PKCE code challenge for public clients
   */
  create(codeChallenge: string) {
    if (this.server_metadata) {
      // Adapt client configuration to server capabilities
      if (this.server_metadata.grant_types_supported) {
        this.grant_types = this.grant_types.filter(
          (type: string) => this.server_metadata.grant_types_supported.includes(type)
        );
      }

      if (this.server_metadata.response_types_supported) {
        this.response_types = this.response_types.filter(
          (type: string) => this.server_metadata.response_types_supported.includes(type)
        );
      }

      // Set authentication method based on server support
      if (this.server_metadata.token_endpoint_auth_methods_supported) {
        if (this.server_metadata.token_endpoint_auth_methods_supported.includes('none')) {
          this.token_endpoint_auth_method = 'none';
        } else if (this.server_metadata.token_endpoint_auth_methods_supported.includes('client_secret_post')) {
          this.token_endpoint_auth_method = 'client_secret_post';
        }
      }

      // Enable PKCE for public clients (RFC 7636)
      if (this.server_metadata.token_endpoint_auth_methods_supported && 
          this.server_metadata.token_endpoint_auth_methods_supported.includes('none') && 
          this.server_metadata.grant_types_supported.includes('authorization_code')) {
        console.log("Server requires PKCE for public clients");
        this.code_challenge_method = 'S256';
        this.code_challenge = codeChallenge;
      }
    }
  }

  /**
   * Generates the client registration payload for RFC 7591 dynamic registration
   * @returns Object containing all client metadata for registration
   */
  getPayloadForRegistration() {
    return {
      client_name: this.client_name,
      redirect_uris: this.redirect_uris,
      grant_types: this.grant_types,
      response_types: this.response_types,
      scope: this.scope,
      token_endpoint_auth_method: this.token_endpoint_auth_method,
      application_type: this.application_type,
      code_challenge: this.code_challenge,
      code_challenge_method: this.code_challenge_method
    }
  }

  /**
   * Registers this client with the OAuth authorization server
   * @param encodedURL - Encoded registration endpoint URL
   * @returns Registration result containing client_id and authorization URL
   */
  async register(encodedURL: string) {
    try {
      console.log("Attempting registration with payload:", this.getPayloadForRegistration());
      console.log("encoded_URL: ", encodedURL)
      
      // Send dynamic client registration request (RFC 7591)
      const registrationResult = await axios.post(encodedURL, this.getPayloadForRegistration(), {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("REGISTRATION SUCCESS:", registrationResult.data);
      
      // Store client_id with unique key based on client identifier
      const storageKey = `oauth_client_id_${this.id}`;
      localStorage.setItem(storageKey, registrationResult.data.client_id);
      console.log(`Stored client_id in localStorage with key ${storageKey}:`, registrationResult.data.client_id);
      
      let encoded_redirect = encodeURIComponent(this.redirect_uris[0])
      const finalScope = encodeURIComponent(this.scope);
      
      // Build OAuth 2.0 authorization URL (RFC 6749 Section 4.1.1)
      // Use client ID as state parameter to identify which client during callback
      let authUrl = this.server_metadata.authorization_endpoint + 
        "?client_id=" + registrationResult.data.client_id + 
        "&response_type=code" + 
        "&redirect_uri=" + encoded_redirect + 
        "&scope=" + finalScope + 
        "&state=" + encodeURIComponent(this.id);
      
      // Add PKCE parameters for public clients (RFC 7636)
      if (this.code_challenge) {
        authUrl += "&code_challenge=" + encodeURIComponent(this.code_challenge) + "&code_challenge_method=S256";
        console.log("Added PKCE to authorization URL");
      }
      
      return authUrl;
    } catch (error) {
      console.error("Registration failed:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
        
        // Fallback strategy: try minimal registration payload
        if (error.response?.status === 422) {
          console.log("Trying with minimal payload...");
          const minimalClient = {
            client_name: "MCP Client Application",
            redirect_uris: ["http://localhost:3000/callback/mcp/oauth"]
          };
          
          try {
            const retryResult = await axios.post(encodedURL, minimalClient, {
              headers: { 'Content-Type': 'application/json' }
            });
            console.log("MINIMAL REGISTRATION SUCCESS:", retryResult.data);
            
            // Store client_id for minimal registration with unique key
            const minimalStorageKey = `oauth_client_id_${this.id}`;
            localStorage.setItem(minimalStorageKey, retryResult.data.client_id);
            console.log(`Stored minimal client_id in localStorage with key ${minimalStorageKey}:`, retryResult.data.client_id);
            
            return retryResult.data;
          } catch (retryError) {
            console.error("Minimal registration also failed:", retryError);
          }
        }
      }
      throw error;
    }
  }
}