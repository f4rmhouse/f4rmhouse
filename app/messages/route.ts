export async function POST(request: Request) {
    // Proxy the response stream
    
    // Get session_id from URL parameters
    const url = new URL(request.url);
    const session_id = url.searchParams.get("session_id");

    // Create fetch options with the required duplex property
    const fetchOptions: any = {
      method: 'POST',
      body: request.body,
      duplex: 'half', // Required when forwarding a request body
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = await fetch("http://localhost:8080/messages/?session_id=" + session_id, fetchOptions);
    
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