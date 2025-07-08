import { extractAndValidateServerUri, secureFetch } from '@/app/lib/security/url-validator';
import { getProxyConfig } from '@/app/lib/security/proxy-config';

export async function POST(request: Request) {
    // Extract and validate the server URI with SSRF protection
    const validation = await extractAndValidateServerUri(
        request, 
        'http://localhost:8080/mcp',
        getProxyConfig()
    );
    
    if (!validation.isValid) {
        console.error('SSRF Protection - Invalid URL:', validation.error);
        return new Response(`Invalid server URI: ${validation.error}`, { status: 400 });
    }
    
    const targetUrl = validation.url!;
  
    // Extract authorization header from incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Build headers for the proxied request
    const proxyHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    };
    
    // Add authorization header if present
    if (authHeader) {
      proxyHeaders.Authorization = authHeader;
      console.log('Forwarding Authorization header to:', targetUrl);
    }

    try {
      // Use secure fetch with SSRF protection
      const response = await secureFetch(targetUrl, {
        method: 'POST',
        headers: proxyHeaders,
      });

      if (!response.body) {
        return new Response('No upstream stream', { status: 502 });
      }
      
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        return new Response('Unauthorized', { status: 401, headers: response.headers });
      }

      // Proxy the response stream with proper headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        }
      });

    } catch (error) {
      console.error('Secure proxy error:', error);
      return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Extract and validate the server URI with SSRF protection
    const validation = await extractAndValidateServerUri(
        request, 
        'http://localhost:8080/mcp',
        getProxyConfig()
    );
    
    if (!validation.isValid) {
        console.error('SSRF Protection - Invalid URL:', validation.error);
        return new Response(`Invalid server URI: ${validation.error}`, { status: 400 });
    }
    
    const targetUrl = validation.url!;
    console.log('Proxying SSE request to validated URL:', targetUrl);
  
    // Extract authorization header from incoming request
    const authHeader = request.headers.get('Authorization');
    
    // Build headers for the proxied request
    const proxyHeaders: Record<string, string> = {
      Accept: 'text/event-stream',
    };
    
    // Add authorization header if present
    if (authHeader) {
      proxyHeaders.Authorization = authHeader;
      console.log('Forwarding Authorization header to:', targetUrl);
    }

    try {
      // Use secure fetch with SSRF protection
      const response = await secureFetch(targetUrl, {
        headers: proxyHeaders,
      });

      if (!response.body) {
        return new Response('No upstream stream', { status: 502 });
      }
      
      if (response.status === 401) {
        return new Response('Unauthorized', { status: 401, headers: response.headers });
      }

      // Proxy the response stream with proper SSE headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'GET',
          'Connection': 'keep-alive',
        }
      });

    } catch (error) {
      console.error('Secure SSE proxy error:', error);
      return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}