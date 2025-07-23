import { extractAndValidateServerUri, secureFetch } from '@/app/lib/security/url-validator';
import { getProxyConfig } from '@/app/lib/security/proxy-config';

export async function GET(request: Request) {
    // Extract and validate the server URI with SSRF protection
    const validation = await extractAndValidateServerUri(
        request, 
        'http://localhost:8080/sse',
        getProxyConfig()
    );
    
    if (!validation.isValid) {
        console.error('SSRF Protection - Invalid SSE URL:', validation.error);
        return new Response(`Invalid server URI: ${validation.error}`, { 
            status: 400,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }
    
    const targetUrl = validation.url!;
    
    // Extract authorization header from incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Build headers for the proxied request
    const proxyHeaders: Record<string, string> = {
      Accept: 'text/event-stream, application/json',
    };
    
    // Add authorization header if present
    if (authHeader) {
      proxyHeaders.Authorization = authHeader;
    }

    try {
      // Create a new fetch with no timeout and proper SSE headers
      const response = await fetch(targetUrl, {
        headers: proxyHeaders,
        signal: request.signal, // Use request signal for proper cancellation
        method: 'GET',
      });

      // Create a new Response with proper SSE headers
      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      };

      // If we have a response body, proxy it
      if (response.body) {
        return response 
      }

      // If no body, return empty SSE stream
      return new Response('', {
        headers,
        status: 200,
      });

    } catch (error) {
      return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
}