import ProductType from "../components/types/ProductType";
import F4MCPClient from "../microstore/F4MCPClient";

const TEST_MCP_URL = "http://127.0.0.1:8080/sse"

let mockProducts:ProductType[] = [{
  uid: "1",
  title: "test product",
  uti: "linear",
  description: "test description",
  rating: 5,
  price: 0,
  thumbnail: "test thumbnail",
  overview: "test overview",
  communityURL: "test community URL",
  reviews: 5,
  developer: "test developer",
  pricingType: "test pricing type",
  releaseType: "test release type",
  version: "1.0.0",
  showcase: ["test showcase"],
  tags: ["test tag"],
  deployed: true,
  deployment_type: "test deployment type",
  server: { "authorization" : { "token_url" : "", "authorization_url" : "", "redirect_url" : "", "revocation_url" : "" }, "transport" : "sse", "uri" : "http://localhost:8080", "auth_provider" : "" }
}]

describe('F4MCPClient', () => {
    // Declare client variable at the describe block level so it's accessible in all tests
    let client: F4MCPClient;
    
    // Set up before each test
    beforeEach(async () => {
      // Create a new client instance
      let user = undefined
      client = new F4MCPClient("test f4rmer", mockProducts, user, true);
      // Connect to the test server
      await client.connect("linear", TEST_MCP_URL);
    });
    
    // Clean up after all tests are complete
    afterAll(async () => {
      try {
        // Close the specific connection first
        await client.closeAll();
        // Small delay to allow any background processes to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('All connections closed after tests');
      } catch (error) {
        console.error('Error during test cleanup:', error);
      }
    }, 1000); // Add timeout of 1 second for afterAll
    
    // Reset client state after each test if needed
    afterEach(async () => {
      // Any per-test cleanup that doesn't involve closing connections
      await client.close("linear");
    });
    
    // Constructor test
    test('constructor initializes properties correctly', () => {
      expect(client.getConnections().get("linear")).toBeDefined();
    });
    
    // Method tests
    test('listTools returns tools from the MCP server', async () => {
      let result = await client.listTools("linear");
      expect(result).toBeDefined();
    });
    
    test('listPrompts returns prompts from the MCP server', async () => {
      let result = await client.listPrompts("linear");
      expect(result).toBeDefined();
    });
    
    test('listResources returns resources from the MCP server', async () => {
      let result = await client.listResources("linear");
      expect(result).toBeDefined();
    });
    
    test('listResourceTemplates returns resource templates from the MCP server', async () => {
      let result = await client.listResourceTemplates("linear");
      expect(result).toBeDefined();
    });
    
    test('getServerCapabilities returns server capabilities from the MCP server', async () => {
      let result = await client.getServerCapabilities("linear");
      expect(result).toBeDefined();
    });
    
    test('getStructuredJSON returns combined data from the MCP server', async () => {
      let result = await client.getStructuredJSON("linear");
      expect(result.tools).toBeDefined();
      expect(result.prompts).toBeDefined();
      expect(result.resources).toBeDefined();
    });
    
    test('preparePrompt gathers structured JSON from all products', async () => {
      let result = await client.preparePrompt();
      expect(result).toBeDefined();
    });
    
    test('ping checks if server is responsive and returns timing data', async () => {
      let result = await client.ping("linear");
      
      // Check that the result has the expected structure
      expect(result).toMatchObject({
        response: expect.anything(),
        pingTimeMs: expect.any(Number)
      });
      
      // Alternative approach using objectContaining
      expect(result).toEqual(expect.objectContaining({
        pingTimeMs: expect.any(Number)
      }));
    });
    
    test('close terminates connection to a specific server', async () => {
      await client.close("linear");
      expect(client.getConnections().get("linear")).toBeUndefined();
    });
    
    test('closeAll terminates all connections', async () => {
      await client.closeAll();
      expect(client.getConnections().get("linear")).toBeUndefined();
    });
  });