import { NextRequest, NextResponse } from 'next/server';
import MCPAuthHandler from '@/app/MCPAuthHandler';

export async function POST(request: NextRequest) {
  try {
    const { code, provider, code_verifier, client_id, token_url } = await request.json();

    // Prepare token exchange request
    const body: any = {
      code: code,
      client_id: client_id,
      redirect_uri: "http://localhost:3000/callback/mcp/oauth",
      grant_type: "authorization_code",
      client_secret: "b6bfefa35a41f4bc170b128bbbdd856a5b9180ac"
    };

    // Add PKCE code_verifier if provided
    if (code_verifier) {
      body.code_verifier = code_verifier;
    }

    // Make token exchange request to provider
    const response = await fetch(token_url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
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
