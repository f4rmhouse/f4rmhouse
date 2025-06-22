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
        'http://localhost:3000/api/mcp/automatic/discovery?server_uri=https%3A%2F%2Fexample.com%2F.well-known%2Foauth-authorization-server'
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
        'http://localhost:3000/api/mcp/automatic/discovery?server_uri=https%3A%2F%2Fapi.example.com%2Foauth%2Fmetadata%3Fparam%3Dvalue%26other%3Dtest'
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
      const fetchError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(fetchError);

      await expect(
        client._fetchRFC9728MetaData('https://example.com/.well-known/oauth-authorization-server')
      ).rejects.toThrow('Network error');
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
          expected: 'https%3A%2F%2Fsignin.mcp.shop%2F.well-known%2Foauth-authorization-server'
        },
        {
          input: 'https://api.linear.app/oauth/metadata',
          expected: 'https%3A%2F%2Fapi.linear.app%2Foauth%2Fmetadata'
        },
        {
          input: 'http://localhost:8080/auth/metadata',
          expected: 'http%3A%2F%2Flocalhost%3A8080%2Fauth%2Fmetadata'
        }
      ];

      for (const testCase of testCases) {
        await client._fetchRFC9728MetaData(testCase.input);
        
        expect(mockFetch).toHaveBeenCalledWith(
          `http://localhost:3000/api/mcp/automatic/discovery?server_uri=${testCase.expected}`
        );
      }
    });
  });

  describe('_fetchRFC8414AuthServerMetaData', () => {
    test('constructs correct proxy URL for auth server metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response);

      const authServerEndpoint = 'https://signin.mcp.shop/.well-known/oauth-authorization-server';
      
      await client._fetchRFC8414AuthServerMetaData(authServerEndpoint);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/mcp/automatic/discovery?server_uri=https%3A%2F%2Fsignin.mcp.shop%2F.well-known%2Foauth-authorization-server'
      );
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

    test('handles complex URLs in resource_metadata', () => {
      const input = 'resource_metadata="https://api.example.com/oauth/metadata?version=2&format=json"';
      const result = client._extractUrl(input);
      
      expect(result).toBe('https://api.example.com/oauth/metadata?version=2&format=json');
    });
  });
});