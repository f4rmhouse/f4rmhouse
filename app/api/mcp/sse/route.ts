export async function GET(request: Request) {
    // Get the URL from the request
    const { searchParams } = new URL(request.url);
    
    // Get the server_uri parameter and decode it
    const serverUri = searchParams.get('server_uri');
    const targetUrl = serverUri ? decodeURIComponent(serverUri) : 'http://localhost:8080/sse';
    
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
      const response = await fetch(targetUrl, {
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

      if (!response.body) {
        return new Response('SSE stream not available', { status: 404 });
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
        },
      });

    } catch (error) {
      console.error('SSE Proxy error:', error);
      return new Response(`Proxy error: ${error}`, { status: 500 });
    }
}