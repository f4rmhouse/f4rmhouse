import ProductType from "../components/types/ProductType";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import User from "./User";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport} from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InputSchema, Tool, ServerSummaryType, Prompt, MCPToolType, MCPResourceType } from "../components/types/MCPTypes";
import { MCPConnectionStatus } from "../components/types/MCPConnectionStatus";
import MCPAuthHandler from "../MCPAuthHandler";
import Store from "./Store";
import { toast } from "sonner";
import { ToolListChangedNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * F4MCPClient is a client for interacting with Model Context Protocol (MCP) servers.
 * It manages connections to multiple MCP servers and provides methods to interact with them.
 * Each server is identified by a Universal Tool Identifier (UTI).
 */
class F4MCPClient {
  /** Name identifier for this client instance */
  public name: string;
  
  /** Map of UTIs to product metadata */
  private metadata: Map<string, ProductType>
  
  /** Map of UTIs to MCP client connections */
  public connections: Map<string, Client>
  
  /** User object for authentication purposes */
  private caller: User | null = null

  private testing = false;
  private base_url = (process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://app.f4rmhouse.com' : 'http://localhost:3000');

  /**
   * Creates a new F4MCPClient instance
   * @param name - Name identifier for this client
   * @param metadata - Array of product metadata objects
   * @param caller - User object for authentication
   */
  constructor(name: string, metadata: ProductType[], caller?: User, testing:boolean=false) {
    this.name = name;
    this.metadata = new Map<string, ProductType>();
    if(metadata) {
      metadata.map((product:ProductType) => 
        this.metadata.set(product.uti, product)
      )
    }
    this.connections = new Map<string, Client>();

    if(caller) {
      this.caller = caller;
    }

    this.testing = testing;
  }

  /**
   * Sets the user for authentication purposes
   * @param user - User object containing authentication credentials
   */
  setUser(user:User) {
    this.caller = user
  }

  /**
   * Lists available tools from an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to the list of available tools
   */
  async listTools(uti: string): Promise<Tool[]> {
    let response = await this.connections.get(uti)?.listTools()
    if(response && response.tools){
      // Map the SDK response to match our Tool type
      return response.tools.map((tool: any) => ({
        name: tool.name,
        description: tool.description || "", // Convert description to descriptions
        inputSchema: tool.inputSchema || {
          type: "",
          required: [],
          properties: {}
        }
      })) as Tool[]
    }
    return []
  }

  /**
   * Lists available prompts from an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to the list of available prompts
   */
  async listPrompts(uti: string): Promise<Prompt[]> {
    try {
      let response = await this.connections.get(uti)?.listPrompts()
      if (response && response.prompts) {
        // Transform the response to match our Prompt type
        let properties: any = {}
        response.prompts.map((p:any) => {
          p.arguments.map((pp:any) => {
            properties[pp.name] = {type: "string", title: pp.name}
          })
        })
        let inputSchema: InputSchema = {
          type: "string",
          required: response.prompts.map((p:any) => p.arguments.map((pp:any) => pp.required ? pp.name : null)).flat(),
          properties: properties
      } 

      return response.prompts.map((prompt: any) => ({
        name: prompt.name || '',
        description: prompt.description || '',
        inputSchema: inputSchema,
        // Add any other required fields for the Prompt type
      })) as Prompt[]
    }
    
    // Return empty array if no response or no prompts
    return []
    } catch (error) {
      console.log("Error listing prompts:", error)
      return []
    }
  }

  /**
   * Lists available resources from an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to the list of available resources
   */
  async listResources(uti: string): Promise<MCPResourceType[]> {
    try {
      const client = this.connections.get(uti);
      if (!client) return [];
      const response = await client.listResources();
      if (response) {
        return response.resources.map((resource: any) => ({
          uri: resource.uri,
          name: resource.name,
          mimeType: resource.mimeType
        })) as MCPResourceType[];
      }
      return [];
    } catch (error) {
      console.log("Error listing resources:", error)
      return []
    }
  }

  /**
   * Lists available resource templates from an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Object containing the list of available resource templates
   */
  async listResourceTemplates(uti: string): Promise<Object[]> {
    try {
      const client = this.connections.get(uti)
      if (!client) return [];
      const response = await client.listResourceTemplates()
      if (response) {
        return response.resourceTemplates;
      }
      return []
    } catch (error) {
      console.log("Error listing resource templates:", error)
      return []
    }
  }

  /**
   * Gets the capabilities of an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to the server capabilities as an array of objects
   */
  async getServerCapabilities(uti: string): Promise<Object[]> {
    const client = this.connections.get(uti);
    if (!client) return [];
    
    const capabilities = await client.getServerCapabilities();
    // Convert capabilities to an array format if it exists, otherwise return empty array
    return capabilities ? [capabilities] : [];
  }

  /**
   * Gets server instructions/documentation from an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to the server instructions as a string
   */
  async getServerInstructions(uti: string): Promise<string> {
    let response = await this.connections.get(uti)?.getInstructions()
    return response || ""
  }

  /**
   * Gets the version information of an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to an object containing server name and version
   */
  async getServerVersion(uti: string): Promise<{name: string, version: string}> {
    let response = await this.connections.get(uti)?.getServerVersion()
    return response || {name: "", version: ""}
  }

  /**
   * Retrieves a comprehensive JSON structure containing all server information
   * including tools, prompts, resources, resource templates, and server capabilities
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to a structured JSON object with all server information
   */
  async getStructuredJSON(uti: string): Promise<ServerSummaryType> {
    let tools = await this.listTools(uti)
    let prompts = await this.listPrompts(uti)
    let resources = await this.listResources(uti)
    let resourceTemplates = await this.listResourceTemplates(uti)
    let serverCapabilities = await this.getServerCapabilities(uti)
    let instructions = await this.getServerInstructions(uti)
    let version = await this.getServerVersion(uti)
    // let version: {name: string, version: string} = {name: "", version: ""}

    return {
      name: version.name,
      version: version.version,
      instructions: instructions,
      tools: tools,
      prompts: prompts,
      resources: resources,
      resourceTemplates: resourceTemplates,
      serverCapabilities: serverCapabilities,
      uri: this.metadata.get(uti)?.server.uri
    } as ServerSummaryType
  }

  /**
   * Prepares a prompt by gathering structured JSON data from all registered products
   * @returns Promise resolving to an array of structured JSON data for all products
   */
  async preparePrompt() : Promise<MCPToolType[]>{
    let tools:any[] = []
    for (const uti of this.metadata.keys()) {
      try {
        const res = await this.getStructuredJSON(uti) 
        if(res.tools.length > 0 || res.prompts.length > 0 || res.resources.length > 0){
          tools.push({
            tools: res.tools, 
            prompts: res.prompts, 
            resources: res.resources,
            instructions: res.instructions,
            name: res.name,
            uri: res.uri,
            uti: uti,
            authorization: this.metadata.get(uti)?.server.authorization,
            auth_provider: this.metadata.get(uti)?.server.auth_provider,
            transport: this.metadata.get(uti)?.server.transport
          })
        }
      } catch (error) {
        console.error(`Error getting data for UTI ${uti}:`, error)
      }
    }

    return tools
  }

  /**
   * Establishes a connection to an MCP server with authentication handling
   * @param uti - Unique Tool Identifier for the server
   * @param serverURL - URL of the MCP server to connect to
   * @returns Promise resolving to connection status object
   * @throws Error if connection fails or server is unreachable
   */
  async connect(uti: string, serverURL: string, transport: string, auth_provider: string): Promise<MCPConnectionStatus> {
    let accessToken = ""

    // Create a new MCP client instance for this connection
    const client = new Client({
      name: "f4rmhouse-client",
      version: "1.0.0"
    })

    client.setNotificationHandler(ToolListChangedNotificationSchema, async () => {
      await client.listTools()
    });

    // Check if we have authentication credentials for this server
    if(this.caller && this.caller.isLoggedIn()) {
      let token = await this.caller.getToken(uti)
      if(token.encryptedData == "") {
        accessToken = ""
      }
      else {
        accessToken = token.token.token
      }
    }

    try {
      if (accessToken) {
        await this._connectToClientWithAuthToken(uti, serverURL, accessToken, client, transport)
        return {status: "success"}
      }
      else {
        // Attempt connection without authentication first
        // Encode the serverURL to safely use it as a URL parameter
        const encodedServerURL = encodeURIComponent(serverURL);

        let url = new URL(`${this.base_url}/api/mcp/streamable?server_uri=${encodedServerURL}`)

        if(transport == "sse") {
          url = new URL(`${this.base_url}/api/mcp/sse?server_uri=${encodedServerURL}`)
        }

        if(this.testing) {
          url = new URL("http://localhost:8080/sse");
        }

        console.log("connecting to: ", url)
        let res = await fetch(url)
        console.log("res: ", res)

        if(res.status == 200 || res.status == 404 || res.status == 500 || res.status == 400 || res.status == 405) {
          // Server allows unauthenticated access
          await this._connectWithMCPServerWithoutAuth(uti, serverURL, client, transport)
          return {status: "success"}
        }
        else if(res.status == 401) {
          // Server requires authentication - initiate OAuth flow
          toast.info(uti + ' needs you to authenticate to use the MCP server.')
          let result = await this._initiateMCPAuthentication(uti, serverURL, res)
          return result
        }
        else {
          console.error("Unexpected status code:", res.status)
          return {status: "error"}
        }
      }
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  }

  /**
   * Connects to an MCP server that doesn't require authentication
   * @param uti - Unique Tool Identifier for the server
   * @param url - URL object for the server connection
   * @param client - MCP Client instance to use for the connection
   */
  async _connectWithMCPServerWithoutAuth(uti: string, serverURL: string, client: Client, transport: string) {
    // console.info("No auth needed for this server. Proceed to connection.")

    let encodedURL = `${this.base_url}/api/mcp/streamable?server_uri=${encodeURIComponent(serverURL)}`;
    if(transport == "sse") {
      encodedURL = `${this.base_url}/api/mcp/sse?server_uri=${encodeURIComponent(serverURL)}`;
    }
    let url = new URL(encodedURL);

    await this._handleConnection(transport, url, {}, client, uti, null)
  }

  /**
   * Initiates the OAuth authentication flow for an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @param serverURL - URL of the MCP server
   * @param initialResponseFromServer - Initial 401 response from the server
   * @returns Promise resolving to authentication status and metadata
   */
  async _initiateMCPAuthentication(uti: string, serverURL: string, initialResponseFromServer: Response) : Promise<MCPConnectionStatus> {
    if (this.metadata.get(uti)?.server.authorization.authorization_url) {
      console.info("Vendor has described auth metadata. Ask user to login")
      return {status: "authenticate"}
    }
    else {
      // Attempt automatic discovery of OAuth endpoints
      let remoteMetaDataEndpoint = this._extractUrl(initialResponseFromServer.headers.get("www-authenticate") || "");
      // Construct RFC 8414 compliant metadata endpoint
      let remoteAuthServerMetaDataEndpoint = ""
      if(serverURL.includes("/sse")) {
        remoteAuthServerMetaDataEndpoint = serverURL.replace("sse", "") + ".well-known/oauth-authorization-server"
      }
      else {
        remoteAuthServerMetaDataEndpoint = this._parseServerURL(serverURL) + ".well-known/oauth-authorization-server"
      }
      let authMetadata: MCPConnectionStatus = {status: "error", remoteMetadata: {}, remoteAuthServerMetadata: {}}

      // Try to fetch RFC 9728 metadata if endpoint is provided
      if(remoteMetaDataEndpoint) {
        let remoteMetaData = await this._fetchRFC9728MetaData(remoteMetaDataEndpoint)
        if(remoteMetaData.status == 200) {
          authMetadata.remoteMetadata = await remoteMetaData.json()
          authMetadata.status = "authenticate"
        }
        else {
          authMetadata.status = remoteMetaData.status
        }
      }
      if (remoteMetaDataEndpoint == null) {
        let store = new Store()
        let product = await store.getProduct(uti)
        let provider = product.Message.server.auth_provider
        let authServer = MCPAuthHandler.oauth2(provider).authorization_server
        authMetadata.remoteMetadata = {authorization_servers: [authServer]}
      }

      // Try to fetch RFC 8414 authorization server metadata
      if(remoteAuthServerMetaDataEndpoint) {
        let remoteAuthServerMetaData = await this._fetchRFC8414AuthServerMetaData(remoteAuthServerMetaDataEndpoint)
        if(remoteAuthServerMetaData.status == 200) {
          authMetadata.remoteAuthServerMetadata = await remoteAuthServerMetaData.json()
          localStorage.setItem(`token_url_${uti}`, authMetadata.remoteAuthServerMetadata.token_endpoint)
          authMetadata.status = "authenticate"
        }
        else if(remoteAuthServerMetaData.status == 404) {
          let store = new Store()
          let product = await store.getProduct(uti)
          let provider = product.Message.server.auth_provider
          let auth = MCPAuthHandler.oauth2(provider)
          authMetadata.remoteAuthServerMetadata = {
            authorization_endpoint: auth.authorization_server, 
            token_endpoint: auth.token_url
          }
          localStorage.setItem(`token_url_${uti}`, authMetadata.remoteAuthServerMetadata.token_endpoint)
          authMetadata.status = "authenticate"
        }
        else {
          authMetadata.status = "error"
        }
      }
      return authMetadata
    }
  }

  /**
   * Connects to an MCP server using an existing authentication token
   * @param uti - Unique Tool Identifier for the server
   * @param serverURL - URL of the MCP server
   * @param accessToken - Existing authentication token
   * @param client - MCP Client instance to use for the connection
   */
  async _connectToClientWithAuthToken(uti: string, serverURL: string, accessToken: string, client: Client, transport: string) {
    const authToken = "Bearer " + accessToken
    /**
     * Helper function to add authorization headers to fetch requests
     * @param url - URL to fetch
     * @param init - Request initialization options
     * @returns Promise from fetch with authorization headers added
     */
    const fetchWithAuth = (url: string | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      headers.set("Authorization", authToken);
      return fetch(url.toString(), { ...init, headers });
    };

    let customHeaders = {
      headers: {
        "Authorization": authToken,
      }
    };
    // if(transport == "sse") {
    //   customHeaders = {
    //     Authorization: authToken,
    //   };
    // }
    
    // Avoid CORS in issues streamable http by using proxy
    let encodedURL = `${this.base_url}/api/mcp/streamable?server_uri=${encodeURIComponent(serverURL)}`;
    if(transport == "sse") {
      encodedURL = `${this.base_url}/api/mcp/sse?server_uri=${encodeURIComponent(serverURL)}`;
    }
    let url = new URL(encodedURL);

    await this._handleConnection(transport, url, customHeaders, client, uti, fetchWithAuth)
  }

  async _handleConnection(transport: string, url: URL, customHeaders: any, client: Client, uti: string, fetchWithAuth: any) {
    if (transport == "streamable_http") {
      let t = new StreamableHTTPClientTransport(url, {requestInit: customHeaders});
      try {
        await client.connect(t);
        this.connections.set(uti, client);
      }
      catch(err) {
        console.error(err)
      }
    }
    else {
      let t = new SSEClientTransport(new URL(url), {
          eventSourceInit: {
              fetch: fetchWithAuth,
          },
          requestInit: customHeaders
      });
      try {
        await client.connect(t);
        this.connections.set(uti, client);
      }
      catch(err) {
        console.error(err)
      }
    } 
  }

  /**
   * Handles automatic discovery of OAuth server metadata according to RFC 9728 and RFC 8414
   * @param serverURL - URL of the MCP server
   * @param res - Response object from the initial server request
   * @returns Promise resolving to authentication metadata object
   */
  async _handleAutomaticServerAuthDiscovery(serverURL:string, res:Response): Promise<any> {
    // RFC 8414 defines the standard path for OAuth authorization server metadata
    const rfc8415OauthServerPath = "/.well-known/oauth-authorization-server"

    // Extract metadata endpoint from WWW-Authenticate header (RFC 9728)
    let remoteMetaDataEndpoint = this._extractUrl(res.headers.get("www-authenticate") || "");
    // Construct RFC 8414 compliant metadata endpoint
    let remoteAuthServerMetaDataEndpoint = serverURL.replace("/sse", rfc8415OauthServerPath)
    let authMetadata = {status: 404, remoteMetadata: {}, remoteAuthServerMetadata: {}}

    // Try to fetch RFC 9728 metadata if endpoint is provided
    if(remoteMetaDataEndpoint) {
      let remoteMetaData = await this._fetchRFC9728MetaData(remoteMetaDataEndpoint)
      if(remoteMetaData.status == 200) {
        authMetadata.remoteMetadata = await remoteMetaData.json()
        authMetadata.status = 200
      }
      else {
        authMetadata.status = remoteMetaData.status
      }
    }
    // Fallback to hardcoded Linear auth server configuration
    else if (remoteMetaDataEndpoint == null) {
      let authServer = MCPAuthHandler.oauth2("linear")
      authMetadata.remoteMetadata = {authorization_servers: [authServer.authorization_server]}
    }

    // Try to fetch RFC 8414 authorization server metadata
    if(remoteAuthServerMetaDataEndpoint) {
      let remoteAuthServerMetaData = await this._fetchRFC8414AuthServerMetaData(remoteAuthServerMetaDataEndpoint)
      if(remoteAuthServerMetaData.status == 200) {
        authMetadata.remoteAuthServerMetadata = await remoteAuthServerMetaData.json()
        authMetadata.status = 200
      }
      else {
        authMetadata.status = remoteAuthServerMetaData.status
      }
    }
    return authMetadata
  }

  /**
   * Fetches OAuth metadata according to RFC 9728 specification
   * @param remoteMetaDataEndpoint - URL of the metadata endpoint
   * @returns Promise resolving to the fetch response
   */
  async _fetchRFC9728MetaData(remoteMetaDataEndpoint:string): Promise<any> {
    try {
      return await fetch(remoteMetaDataEndpoint)
    }
    catch(err) {
      console.log(err)
      return new Response('Discovery not available', { status: 404});
    }
  }

  /**
   * Fetches OAuth authorization server metadata according to RFC 8414 specification
   * @param remoteAuthServerMetaDataEndpoint - URL of the authorization server metadata endpoint
   * @returns Promise resolving to the fetch response
   */
  async _fetchRFC8414AuthServerMetaData(remoteAuthServerMetaDataEndpoint:string): Promise<any> {
    try {
      return await fetch(remoteAuthServerMetaDataEndpoint)
    }
    catch(err) {
      console.log(err)
      return new Response('Discovery not available', { status: 404});
    }
  }


  /**
   * Extracts URL from resource_metadata attribute in WWW-Authenticate header
   * @param input - String containing the WWW-Authenticate header value
   * @returns Extracted URL string or null if not found
   */
  _extractUrl(input: string): string | null{
    const regex = /resource_metadata="([^"]+)"/;
    const match = input.match(regex);
    return match && match[1];
  }

  /**
   * Pings an MCP server to check if it's responsive
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to the ping response
   */
  async ping(uti: string) {
    const startTime = performance.now();
    let res = await this.connections.get(uti)?.ping()
    const endTime = performance.now();
    const pingTime = endTime - startTime;
    return { response: res, pingTimeMs: pingTime };
  }

  /**
   * Closes the connection to a specific MCP server
   * @param uti - Unique Tool Identifier for the server to disconnect from
   * @returns Promise resolving when the connection is closed
   */
  async close(uti: string) {
    let res = this.connections.get(uti)?.close()
    this.connections.delete(uti)
    return res
  }

  /**
   * Closes all active connections to MCP servers
   * @returns Promise resolving when all connections are closed
   */
  async closeAll() {
    this.connections.forEach((client) => {
      client.close()
    })
    this.connections.clear()
  }

  /**
   * Retrieves authentication endpoints for a specific server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to an object containing authentication endpoints
   */
  async getAuthEndpoints(uti: string) {
    let product = this.metadata.get(uti)

    return {
      authorizationUrl: "https://auth.external.com/oauth2/v1/authorize",
      tokenUrl: "https://auth.external.com/oauth2/v1/token",
      revocationUrl: "https://auth.external.com/oauth2/v1/revoke",
      redirectURI: "https://auth.external.com/oauth2/v1/redirect",
    }
  }

  /**
   * Deactivates a server connection
   * @param uti - Unique Tool Identifier for the server to deactivate
   * @remarks This method is currently a stub and doesn't perform any action
   */
  deactivate(uti: string) {
    
  }

  /**
   * Returns the map of active connections for debugging/monitoring purposes
   * @returns Map of UTI strings to Client instances
   */
  getConnections() {
    return this.connections
  }

  private _parseServerURL(serverURL: string) {
    try {
      let url = new URL(serverURL)
      // Remove /mcp from the end of the pathname if it exists
      if (url.pathname.endsWith('/mcp')) {
        url.pathname = url.pathname.slice(0, -4); // Remove the last 4 characters ('/mcp')
      }
      // Also handle case where /mcp is followed by other path segments
      else if (url.pathname.includes('/mcp/')) {
        url.pathname = url.pathname.replace('/mcp/', '/');
      }
      return url.toString()
    }

    catch(err) {
      console.error(err)
      toast.info("Could not parse MCP server URL " + serverURL + " make sure it's a valid URL")
      return serverURL
    }

  }
}

export default F4MCPClient;