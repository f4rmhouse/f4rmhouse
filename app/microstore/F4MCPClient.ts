import ProductType from "../components/types/ProductType";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import User from "./User";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { InputSchema, Tool, ServerSummaryType, Prompt, MCPToolType, MCPResourceType } from "../components/types/MCPTypes";
import { MCPConnectionStatus } from "../components/types/MCPConnectionStatus";

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
  private connections: Map<string, Client>
  
  /** User object for authentication purposes */
  private caller: User | null = null

  private testing = false;

  /**
   * Creates a new F4MCPClient instance
   * @param name - Name identifier for this client
   * @param metadata - Array of product metadata objects
   * @param caller - User object for authentication
   */
  constructor(name: string, metadata: ProductType[], caller?: User, testing:boolean=false) {
    this.name = name;
    this.metadata = new Map<string, ProductType>();
    metadata.map((product:ProductType) => 
      this.metadata.set(product.uti, product)
    )
    this.connections = new Map<string, Client>();
    if(caller) {
      this.caller = caller;
    }

    this.testing = testing;
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
    return []
  }

  /**
   * Lists available resources from an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Promise resolving to the list of available resources
   */
  async listResources(uti: string): Promise<MCPResourceType[]> {
    const client = this.connections.get(uti);
    if (!client) return [];
    const response = await client.listResources();
    if (response) {
      console.log("RESOURCE: ", response.resources)
      return response.resources.map((resource: any) => ({
        uri: resource.uri,
        name: resource.name,
        mimeType: resource.mimeType
      })) as MCPResourceType[];
    }
    return [];
  }

  /**
   * Lists available resource templates from an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @returns Object containing the list of available resource templates
   */
  async listResourceTemplates(uti: string): Promise<Object[]> {
    const client = this.connections.get(uti)
    if (!client) return [];
    const response = await client.listResourceTemplates()
    if (response) {
      return response.resourceTemplates;
    }
    return []
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

  async getServerInstructions(uti: string): Promise<string>{
    const client = this.connections.get(uti);
    if (!client) return "";
    const instructions = await client.getInstructions();
    return instructions || "";
  }

  async getServerVersion(uti: string): Promise<{name: string, version: string}>{
    const client = this.connections.get(uti);
    if (!client) return {name: "", version: ""};
    const version = await client.getServerVersion();
    return version || {name: "", version: ""};
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
   * Establishes a connection to an MCP server
   * @param uti - Unique Tool Identifier for the server
   * @param serverURL - URL of the MCP server to connect to
   * @throws Error if connection fails
   * @returns Promise that resolves when the connection is established
   */
  async connect(uti: string, serverURL: string): Promise<MCPConnectionStatus> {
    let accessToken = ""

    const client = new Client({
      name: "f4rmhouse-client",
      version: "1.0.0"
    })

    if(this.caller) {
      let token = await this.caller.getToken(uti)
      if(token.Code == 404) {
        accessToken = ""
      }
      else {
        accessToken = token.Token
      }
    }

    try {
      if (accessToken) {
        await this._connectToClientWithAuthToken(serverURL, accessToken, client)
        return {status: "success"}
      }
      else {
        // Encode the serverURL to safely use it as a URL parameter
        const encodedServerURL = encodeURIComponent(serverURL);
        console.log(encodedServerURL)
        let url = new URL(`http://localhost:3000/api/mcp/sse?server_uri=${encodedServerURL}`);
        if(this.testing) {
          url = new URL("http://localhost:8080/sse");
        }
        let res = await fetch(url)
        if(res.status == 200) {
          const transport = new SSEClientTransport(url);
          await client.connect(transport);
          this.connections.set(uti, client);
          console.info("No auth needed for this server. Proceed to connection.")
          return {status: "success"}
        }
        else if(res.status == 401) {
          if (this.metadata.get(uti)?.server.authorization.authorization_url) {
            console.info("Vendor has described auth metadata. Ask user to login")
            return {status: "authenticate"}
          }
          else {
            let authMetadata = await this._handleAutomaticServerAuthDiscovery(serverURL, res)
            if(authMetadata.status == 200) {
              console.info("Found metadata endpoints on MCP server will ask user to login.") 
              return {status: "authenticate", remoteMetadata: authMetadata.remoteMetadata, remoteAuthServerMetadata: authMetadata.remoteAuthServerMetadata}
            }
            else {
              console.error("Could not find metadata endpoints on MCP server")
              return {status: "error"}
            }
          }
        }
        else {
          console.error("Unexpected status code:", res.status)
          return {status: "error"}
        }
      }
    } catch(err) {
      this.connections.delete(uti)
      throw new Error(`Could not connect to ${uti}: ` + String(err))
    }
  }

  async _connectToClientWithAuthToken(serverURL: string, accessToken: string, client: Client) {
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

    const customHeaders = {
        Authorization: authToken,
    };
    const url = new URL(serverURL)
    const transport = new SSEClientTransport(url, {
        eventSourceInit: {
            fetch: fetchWithAuth,
        },
        requestInit: {
          headers: customHeaders,
        },
    });
    await client.connect(transport); 
  }

  async _handleAutomaticServerAuthDiscovery(serverURL:string, res:Response): Promise<any> {
    console.info("401 - Unauthorized and no discovery mechanism defined by vendor, checking for metadata endpoints on MCP server...")
    const rfc8415OauthServerPath = "/.well-known/oauth-authorization-server"

    let remoteMetaDataEndpoint = this._extractUrl(res.headers.get("www-authenticate") || "");
    let remoteAuthServerMetaDataEndpoint = serverURL.replace("/sse", rfc8415OauthServerPath)
    let authMetadata = {status: 404, remoteMetadata: {}, remoteAuthServerMetadata: {}}

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

  async _fetchRFC9728MetaData(remoteMetaDataEndpoint:string): Promise<any> {
    const encodedURL = "http://localhost:3000/api/mcp/automatic/discovery?server_uri=" +encodeURIComponent(remoteMetaDataEndpoint);
    return await fetch(encodedURL)
  }

  async _fetchRFC8414AuthServerMetaData(remoteAuthServerMetaDataEndpoint:string): Promise<any> {
    const encodedURL = "http://localhost:3000/api/mcp/automatic/discovery?server_uri=" + encodeURIComponent(remoteAuthServerMetaDataEndpoint);
    return await fetch(encodedURL)
  }

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

  getConnections() {
    return this.connections
  }
}

export default F4MCPClient;