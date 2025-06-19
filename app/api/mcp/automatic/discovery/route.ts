export async function GET(request: Request) {
    // Get the URL from the request
    const { searchParams } = new URL(request.url);
    
    // Get the server_uri parameter and decode it
    const serverUri = searchParams.get('server_uri');
    const targetUrl = serverUri ? decodeURIComponent(serverUri) : '';

    if(!targetUrl) {
      return new Response('Server URI not provided', { status: 404});
    }
    
    const response = await fetch(targetUrl)

    if (!response.ok) {
      return new Response('Discovery not available', { status: response.status});
    }

    // Read and parse the JSON response
    const data = await response.json();

    // Return the JSON data
    return Response.json(data, {
      status: response.status,
    });
  }