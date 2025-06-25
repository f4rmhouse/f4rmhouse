export async function POST(request: Request) {
    // Get the URL from the request
    const { searchParams } = new URL(request.url);
    
    // Get the server_uri parameter and decode it
    const serverUri = searchParams.get('server_uri');
    const targetUrl = serverUri ? decodeURIComponent(serverUri) : 'http://localhost:8080/mcp';

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

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: proxyHeaders,
        body: bodyText,
        duplex: 'half',
      } as RequestInit & { duplex: 'half' });

      if (!response.body) {
        return new Response('No upstream server', { status: 502 });
      }
      
      if (!response.body) {
        return new Response('Stremable http not available', { status: 404 });
      }

      if (response.status === 401) {
        return new Response('Unauthorized', { status: 401, headers: response.headers });
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

      // Proxy the response stream with proper SSE headers
      return new Response(responseText, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
        }
      });

    } catch (error) {
      console.error('SSE Proxy error:', error);
      return new Response(`Proxy error: ${error}`, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Get the URL from the request
    const { searchParams } = new URL(request.url);
    
    // Get the server_uri parameter and decode it
    const serverUri = searchParams.get('server_uri');
    const targetUrl = serverUri ? decodeURIComponent(serverUri) : 'http://localhost:8080/mcp';
    
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