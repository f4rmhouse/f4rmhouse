import { NextRequest, NextResponse } from 'next/server';
import MCPAuthHandler from '@/app/MCPAuthHandler';

export async function POST(request: NextRequest) {
  try {
    const { code, provider, code_verifier, client_id } = await request.json();

    let redirect_uri = "http://localhost:3000/callback/mcp/oauth"
    
    // Get provider configuration
    const authHandler = MCPAuthHandler.oauth2(provider);

    const TOKEN_URL = "https://mcp.linear.app/token"

    console.log("CODE: ", code)
    console.log("CODE_VERIFIER: ", code_verifier)
    
    // Prepare token exchange request
    const body: any = {
      code: code,
      client_id: client_id,
      redirect_uri: "http://localhost:3000/callback/mcp/oauth",
      grant_type: "authorization_code",
    };

    // Add PKCE code_verifier if provided
    if (code_verifier) {
      body.code_verifier = code_verifier;
      console.log("Added PKCE code_verifier to token request");
    }

    console.log("Token request body:", body);
    console.log("Token URL:", TOKEN_URL);
    console.log("Token body:", new URLSearchParams(body));

    // Make token exchange request to provider
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(body)
    });

    // Get token response
    const tokens = await response.json();

    console.log("Token: ", tokens)
    
    // Return tokens to client
    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}
