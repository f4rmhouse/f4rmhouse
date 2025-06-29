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
    
    // Build headers for the proxied request
    const proxyHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
    };

    // Add authorization header if present
    if (authHeader) {
      proxyHeaders.Authorization = authHeader;
    }

    console.log("body: ", bodyJson)

    try {
      // Use secure fetch with SSRF protection
      const response = await secureFetch(targetUrl, {
        method: 'POST',
        headers: proxyHeaders,
        body: bodyText,
        duplex: 'half',
      } as RequestInit & { duplex: 'half' });

      if (response.status === 401) {
        return new Response('Unauthorized', { status: 401, headers: response.headers });
      }

      if (!response.body) {
        return new Response('No upstream server', { status: 502 });
      }

      // Read and log the response body for debugging
      const responseText = await response.text();
      let responseJson = {};
      try {
        if(responseText.length > 0) {
          responseJson = JSON.parse(responseText);
        }
      } catch (e) {
        console.log("Response body is not valid JSON:", e);
      }

      // Proxy the response stream with proper headers
      return new Response(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        }
      });

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
      Accept: 'text/event-stream',
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

      if (response.status === 401) {
        return new Response('Unauthorized', { status: 401, headers: response.headers });
      }

      if (!response.body) {
        return new Response('No upstream stream', { status: 502 });
      }

      console.log("Response body: ", response.body)

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
        },
      });

    } catch (error) {
      console.error('Secure streamable SSE proxy error:', error);
      return new Response(`Proxy error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
    }
}