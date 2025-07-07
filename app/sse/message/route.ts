export async function POST(request: Request) {
    // Proxy the response stream
    
    // Get session_id from URL parameters
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    // Create fetch options with the required duplex property
    const fetchOptions: any = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: request.body,
      duplex: 'half', // Required when forwarding a request body
    };
    
    const response = await fetch("https://mcp.deepwiki.com/sse/message?sessionId=" + sessionId, fetchOptions);

    console.log("Response: ", response)
    
    return response; 
  }