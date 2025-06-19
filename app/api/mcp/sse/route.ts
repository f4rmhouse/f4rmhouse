export async function GET(request: Request) {
    // Get the URL from the request
    const { searchParams } = new URL(request.url);
    
    // Get the server_uri parameter and decode it
    const serverUri = searchParams.get('server_uri');
    const targetUrl = serverUri ? decodeURIComponent(serverUri) : 'http://localhost:8080/sse';
    const protectedResourceMetadata = serverUri ? decodeURIComponent(serverUri).replace("/sse", "/.well-known/oauth-protected-resource") : "";
    
    console.log('Proxying SSE request to:', targetUrl);
  
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
    });

    if (!response.body) {
      return new Response('SSE stream not available', { status: 404});
    }

    if(response.status == 401) {
      return new Response('Unauthorized', { status: 401, headers: response.headers});
    }

    // Proxy the response stream
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // Optional: allow client to reconnect
        'Access-Control-Allow-Origin': '*', // Only needed if the client is still on a different origin
      },
    });
  }