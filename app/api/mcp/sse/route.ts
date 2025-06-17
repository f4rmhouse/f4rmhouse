export async function GET() {
    const targetUrl = 'http://localhost:8080/sse'; // Your downstream SSE server
  
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
    });
  
    if (!response.body) {
      return new Response('SSE stream not available', { status: 500 });
    }

    // Proxy the response stream
    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // Optional: allow client to reconnect
        'Access-Control-Allow-Origin': '*', // Only needed if the client is still on a different origin
      },
    });
  }