import { extractAndValidateServerUri, secureFetch } from '@/app/lib/security/url-validator';
import { getProxyConfig } from '@/app/lib/security/proxy-config';

export async function POST(request: Request) {
    // Extract and validate the server URI with SSRF protection
    const validation = await extractAndValidateServerUri(
        request, 
        'http://localhost:8081/mcp',
        getProxyConfig()
    );
    
    if (!validation.isValid) {
        console.error('SSRF Protection - Invalid URL:', validation.error);
        return new Response(`Invalid server URI: ${validation.error}`, { status: 400 });
    }
    
    const targetUrl = validation.url!;
    console.log('Proxying streamable POST request to validated URL:', targetUrl);

    // Read and log the request body for debugging
    const bodyText = await request.text();
    
    let bodyJson = null;
    try {
      bodyJson = JSON.parse(bodyText);
    } catch (e) {
      console.error("Body is not valid JSON:", e);
    }

    // Extract authorization header from incoming request
    const authHeader = request.headers.get('Authorization');
    const mcpSessionId = request.headers.get('mcp-session-id');
    console.log("MCP Session ID: ", mcpSessionId)

    // Build headers for the proxied request
    const proxyHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    };

    // Add authorization header if present
    if (authHeader) {
      proxyHeaders.Authorization = authHeader;
    }

    if (mcpSessionId) {
      proxyHeaders['mcp-session-id'] = mcpSessionId;
    }

    try {
      // Use secure fetch with SSRF protection
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: proxyHeaders,
        body: bodyText,
        duplex: 'half',
      } as RequestInit & { duplex: 'half' });

      // Proxy the response stream with proper headers
      return response;

    } catch (error) {
      console.error('Secure streamable proxy error:', error);
      return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Extract and validate the server URI with SSRF protection

    const validation = await extractAndValidateServerUri(
        request, 
        'http://localhost:8081/mcp',
        getProxyConfig()
    );

    const mcpSessionId = request.headers.get('mcp-session-id');

    if (!validation.isValid) {
        console.error('SSRF Protection - Invalid URL:', validation.error);
        return new Response(`Invalid server URI: ${validation.error}`, { status: 400 });
    }
    
    const targetUrl = validation.url!;
    console.log('Proxying streamable GET request to validated URL:', targetUrl);
    
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

    if (mcpSessionId) {
      proxyHeaders['mcp-session-id'] = mcpSessionId;
    }

    try {
      // Use secure fetch with SSRF protection but no timeout for streaming
      const response = await secureFetch(targetUrl, {
        method: 'GET',
        headers: proxyHeaders,
      })
      console.log("response: ", response)

      if (!response.body) {
        return new Response('No upstream stream', { status: 502, statusText: "No upstream stream" });
      }

      // if (response.status === 401) {
      //   return new Response(response.body, { status: 401, statusText: "Unauthorized", headers: response.headers });
      // }

      // Proxy the response stream with proper SSE headers
      return response 

    } catch (error) {
      console.error('Secure streamable SSE proxy error:', error);
      return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}