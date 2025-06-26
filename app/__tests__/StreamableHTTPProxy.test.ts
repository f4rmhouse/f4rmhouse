import { POST, GET } from '../api/mcp/streamable/route';
import { extractAndValidateServerUri, secureFetch } from '../lib/security/url-validator';
import { getProxyConfig } from '../lib/security/proxy-config';

// Mock the security modules
jest.mock('../lib/security/url-validator');
jest.mock('../lib/security/proxy-config');

const mockExtractAndValidateServerUri = extractAndValidateServerUri as jest.MockedFunction<typeof extractAndValidateServerUri>;
const mockSecureFetch = secureFetch as jest.MockedFunction<typeof secureFetch>;
const mockGetProxyConfig = getProxyConfig as jest.MockedFunction<typeof getProxyConfig>;

describe('Streamable HTTP Proxy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock for proxy config
    mockGetProxyConfig.mockReturnValue({
      allowedHosts: ['localhost', '127.0.0.1'],
      allowedPorts: [8081, 3000, 8080],
      allowedProtocols: ['http:', 'https:'],
      blockedNetworks: [],
      maxRedirects: 0,
      timeoutMs: 10000
    });
  });

  describe('POST endpoint', () => {
    test('successfully proxies POST request with valid URL', async () => {
      // Mock successful validation
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: true,
        url: 'http://localhost:8081/mcp',
        error: undefined
      });

      // Mock successful upstream response
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: new ReadableStream(),
        text: async () => JSON.stringify({ result: 'success' })
      } as Response;
      mockSecureFetch.mockResolvedValue(mockResponse);

      // Create test request
      const testRequest = new Request('http://localhost:3000/api/mcp/streamable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ method: 'test', params: {} })
      });

      const response = await POST(testRequest);

      expect(response.status).toBe(200);
      expect(mockExtractAndValidateServerUri).toHaveBeenCalledWith(
        testRequest,
        'http://localhost:8081/mcp',
        expect.any(Object)
      );
      expect(mockSecureFetch).toHaveBeenCalledWith(
        'http://localhost:8081/mcp',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    test('returns 400 for invalid server URI', async () => {
      // Mock validation failure
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: false,
        url: undefined,
        error: 'Invalid host'
      });

      const testRequest = new Request('http://localhost:3000/api/mcp/streamable', {
        method: 'POST',
        body: JSON.stringify({ method: 'test' })
      });

      const response = await POST(testRequest);

      expect(response.status).toBe(400);
      const responseText = await response.text();
      expect(responseText).toBe('Invalid server URI: Invalid host');
    });

    test('handles upstream 401 unauthorized response', async () => {
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: true,
        url: 'http://localhost:8081/mcp',
        error: undefined
      });

      const mockResponse = {
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'WWW-Authenticate': 'Bearer' }),
        text: async () => 'Unauthorized'
      } as Response;
      mockSecureFetch.mockResolvedValue(mockResponse);

      const testRequest = new Request('http://localhost:3000/api/mcp/streamable', {
        method: 'POST',
        body: JSON.stringify({ method: 'test' })
      });

      const response = await POST(testRequest);

      expect(response.status).toBe(401);
    });
  });

  describe('GET endpoint', () => {
    test('successfully proxies GET request for SSE stream', async () => {
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: true,
        url: 'http://localhost:8081/mcp',
        error: undefined
      });

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: new ReadableStream()
      } as Response;
      mockSecureFetch.mockResolvedValue(mockResponse);

      const testRequest = new Request('http://localhost:3000/api/mcp/streamable?server_uri=http://localhost:8081/mcp', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const response = await GET(testRequest);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('Connection')).toBe('keep-alive');
      
      expect(mockSecureFetch).toHaveBeenCalledWith(
        'http://localhost:8081/mcp',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'text/event-stream',
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    test('returns 400 for invalid server URI in GET request', async () => {
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: false,
        url: undefined,
        error: 'Blocked network range'
      });

      const testRequest = new Request('http://localhost:3000/api/mcp/streamable?server_uri=http://192.168.1.1/mcp', {
        method: 'GET'
      });

      const response = await GET(testRequest);

      expect(response.status).toBe(400);
      const responseText = await response.text();
      expect(responseText).toBe('Invalid server URI: Blocked network range');
    });

    test('handles upstream 401 unauthorized in GET request', async () => {
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: true,
        url: 'http://localhost:8081/mcp',
        error: undefined
      });

      const mockResponse = {
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers({ 'WWW-Authenticate': 'Bearer' })
      } as Response;
      mockSecureFetch.mockResolvedValue(mockResponse);

      const testRequest = new Request('http://localhost:3000/api/mcp/streamable', {
        method: 'GET'
      });

      const response = await GET(testRequest);

      expect(response.status).toBe(401);
    });

  });

  describe('CORS headers', () => {
    test('POST response includes proper CORS headers', async () => {
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: true,
        url: 'http://localhost:8081/mcp',
        error: undefined
      });

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: new ReadableStream(),
        text: async () => '{}'
      } as Response;
      mockSecureFetch.mockResolvedValue(mockResponse);

      const testRequest = new Request('http://localhost:3000/api/mcp/streamable', {
        method: 'POST',
        body: JSON.stringify({ method: 'test' })
      });

      const response = await POST(testRequest);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Authorization, Content-Type');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, GET, OPTIONS');
    });

    test('GET response includes proper CORS headers', async () => {
      mockExtractAndValidateServerUri.mockResolvedValue({
        isValid: true,
        url: 'http://localhost:8081/mcp',
        error: undefined
      });

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: new ReadableStream()
      } as Response;
      mockSecureFetch.mockResolvedValue(mockResponse);

      const testRequest = new Request('http://localhost:3000/api/mcp/streamable', {
        method: 'GET'
      });

      const response = await GET(testRequest);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Authorization, Content-Type');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
    });
  });
});