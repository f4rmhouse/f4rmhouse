export async function POST(request: Request) {
    // Proxy the response stream
    
    // Get session_id from URL parameters
    const url = new URL(request.url);
    const session_id = url.searchParams.get("session_id");

    console.log("Handling message...")

    // Create fetch options with the required duplex property
    const fetchOptions: any = {
      method: 'POST',
      body: request.body,
      duplex: 'half', // Required when forwarding a request body
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6InNzb19vaWRjX2tleV9wYWlyXzAxSlRNMFBGNE02RU1ZMFJHUVZNTk5YUUhEIn0.eyJpc3MiOiJodHRwczovL3NpZ25pbi5tY3Auc2hvcCIsImF1ZCI6ImNsaWVudF8wMUpUTTBQRjZKVFdGMFA1NjBYRVpWRVE2QSIsInN1YiI6InVzZXJfMDFKWTRCODI0NVlBTU1YR1JHUTM3N1pCOEQiLCJzaWQiOiJhcHBfY29uc2VudF8wMUpZNlkwRzI0WUgzRzM5Q1RXQUo4TTBQMiIsImp0aSI6IjAxSlk2WTBIUzhGMzYxNkVEQ1o1RFRIVkU0IiwiZXhwIjoxNzUwNDM1NTc1LCJpYXQiOjE3NTA0MzE5NzV9.ExlZES7-NNqY0ah7i73AnUTFMwUcxv8UuQa2Tjav0Zel7Cz6ccpjqmL74N4AyF3uW_gQsv2yH7wPwNYBPAG4EDicsirnawkw0vU8WJoXimOlCtVA-kkhQDdon4LGlSFDc4lhE03a1kPHSuhBRRrC3NWOl4ohqMo443B6pHkJ852Zok5h8m8y78f94wOEpyxekbYzn6xC_rM2_dFjqHnMXfUt67-GSF4-nMHaRT-pcSlRjkjyaQgAj5b89-8WFkzy74ynnd1VI0fg9vANdqC15q1AQGanz_fHxKNcNe1CjRztpBQnqDutZY5O-Mx24bUfL92gScnJEQ0hOcuMr7Sjrw"
      },
    };
    
    const response = await fetch("https://mcp.linear.app/messages/?session_id=" + session_id, fetchOptions);
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  }