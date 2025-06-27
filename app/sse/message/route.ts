export async function POST(request: Request) {
    // Proxy the response stream
    
    // Get session_id from URL parameters
    const url = new URL(request.url);
    const session_id = url.searchParams.get("session_id");

    console.log("url: ", url)
    console.log("session_id: ", session_id)

    console.log("Handling message...")

    // Create fetch options with the required duplex property
    const fetchOptions: any = {
      method: 'POST',
      body: request.body,
      duplex: 'half', // Required when forwarding a request body
    };
    
    const response = await fetch("" + session_id, fetchOptions);
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  }