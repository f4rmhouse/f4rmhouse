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
        return new Response(`Invalid server URI: ${validation.error}`, { status: 400 });
    }
    
    const targetUrl = validation.url!;
    console.log('Proxying SSE request to validated URL:', targetUrl);
    
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
      // Use secure fetch with SSRF protection
      const response = await secureFetch(targetUrl, {
        headers: proxyHeaders,
      });

      if (!response.body) {
        return new Response('No upstream stream', { status: 502 });
      }
      
      if (!response.ok) {
        return new Response(`Upstream error: ${response.status} ${response.statusText}`, { 
          status: response.status 
        });
      }

      if (response.status === 401) {
        return new Response('Unauthorized', { status: 401, headers: response.headers });
      }

      // Proxy the response stream with proper SSE headers
      return response

    } catch (error) {
      console.error('Secure SSE proxy error:', error);
      return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}