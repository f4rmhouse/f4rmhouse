import F4MCPClient from '../microstore/F4MCPClient';
import ProductType from '../components/types/ProductType';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('OAuth Metadata Fetching', () => {
  let client: F4MCPClient;
  
  const mockMetadata: ProductType[] = [
    {
      uid: 'test-uid',
      title: 'Test Server',
      uti: 'test-server',
      description: 'Test server for OAuth testing',
      rating: 5,
      price: 0,
      thumbnail: '',
      overview: 'Test overview',
      communityURL: '',
      reviews: 0,
      developer: 'Test Developer',
      pricingType: 'free',
      releaseType: 'stable',
      version: '1.0.0',
      showcase: [],
      tags: [],
      deployed: true,
      deployment_type: 'cloud',
      server: {
        transport: 'sse',
        uri: 'https://test.example.com',
        authorization: {
          authorization_url: 'https://test.example.com/auth',
          token_url: 'https://test.example.com/token',
          revocation_url: 'https://test.example.com/revoke',
          redirect_url: 'http://localhost:3000/callback'
        },
        auth_provider: 'oauth2'
      }
    }
  ];

  beforeEach(() => {
    client = new F4MCPClient('test-client', mockMetadata, undefined, true);
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('_fetchRFC9728MetaData', () => {
    test('constructs correct proxy URL with encoded server URI', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ metadata: 'test' })
      } as Response);

      const testEndpoint = 'https://example.com/.well-known/oauth-authorization-server';
      
      await client._fetchRFC9728MetaData(testEndpoint);

      // Verify fetch was called with correctly encoded URL
      expect(mockFetch).toHaveBeenCalledWith(
        testEndpoint
      );
    });

    test('handles special characters in server URI', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response);

      const complexEndpoint = 'https://api.example.com/oauth/metadata?param=value&other=test';
      
      await client._fetchRFC9728MetaData(complexEndpoint);

      expect(mockFetch).toHaveBeenCalledWith(
        complexEndpoint
      );
    });

    test('returns fetch response directly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ 
          authorization_endpoint: 'https://example.com/auth',
          token_endpoint: 'https://example.com/token'
        })
      } as Response;

      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await client._fetchRFC9728MetaData('https://example.com/.well-known/oauth-authorization-server');

      expect(result).toBe(mockResponse);
    });

    test('handles fetch errors', async () => {
      const errorResponse = {
        ok: false,
        status: 404,
        statusText: 'Discovery not available',
        text: async () => 'Discovery not available'
      } as Response;
      mockFetch.mockResolvedValueOnce(errorResponse);

      const result = await client._fetchRFC9728MetaData('https://example.com/.well-known/oauth-authorization-server');

      expect(result).toBe(errorResponse);
      expect(result.status).toBe(404);
      expect(result.statusText).toBe('Discovery not available');
    });

    test('handles HTTP error responses', async () => {
      const errorResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response;

      mockFetch.mockResolvedValueOnce(errorResponse);

      const result = await client._fetchRFC9728MetaData('https://example.com/.well-known/oauth-authorization-server');

      expect(result.status).toBe(404);
      expect(result.ok).toBe(false);
    });

    test('encodes various URI formats correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200
      } as Response);

      const testCases = [
        {
          input: 'https://signin.mcp.shop/.well-known/oauth-authorization-server',
        },
        {
          input: 'https://api.linear.app/oauth/metadata',
        },
        {
          input: 'http://localhost:8080/auth/metadata',
        }
      ];

      for (const testCase of testCases) {
        await client._fetchRFC9728MetaData(testCase.input);
        
        expect(mockFetch).toHaveBeenCalledWith(
          testCase.input
        );
      }
    });
  });

  describe('_extractUrl', () => {
    test('extracts URL from resource_metadata attribute', () => {
      const input = 'resource_metadata="https://example.com/.well-known/oauth-authorization-server"';
      const result = client._extractUrl(input);
      
      expect(result).toBe('https://example.com/.well-known/oauth-authorization-server');
    });

    test('returns null for invalid input', () => {
      const invalidInputs = [
        'no metadata here',
        'resource_metadata=',
        'resource_metadata="',
        'other_attribute="https://example.com"'
      ];

      invalidInputs.forEach(input => {
        expect(client._extractUrl(input)).toBeNull();
      });
    });
  });

  describe('signOut', () => {
    test('signs out successfully', () => {
      const client = new F4MCPClient('test-client', []);
      expect(client.getConnections().get("test-uti")).toBeUndefined();
    });

    test('returns null for invalid uti', () => {
      const client = new F4MCPClient('test-client', []);
      expect(client.getConnections().get("invalid-uti")).toBeUndefined();
    });
  });
});