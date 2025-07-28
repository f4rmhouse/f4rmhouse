import { NextRequest, NextResponse } from 'next/server';
import MCPAuthHandler from '@/app/MCPAuthHandler';

export async function POST(request: NextRequest) {
  try {
    const base_url = (process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'https://app.f4rmhouse.com' : 'http://localhost:3000');
    const { code, provider, code_verifier, client_id, token_url } = await request.json();

    // Prepare token exchange request
    const body: any = {
      code: code,
      client_id: client_id,
      redirect_uri: base_url + "/callback/mcp/oauth",
      grant_type: "authorization_code"
    };

    // Add PKCE code_verifier if provided
    if (code_verifier) {
      body.code_verifier = code_verifier;
    }
    else {
      const envVarName = `GITHUB_CLIENT_SECRET`;
      const client_secret = process.env[envVarName];

      if (!client_secret) {
        console.error(`Client secret not found for provider: ${provider}. Expected environment variable: ${envVarName}`);
        
      }
      body.client_secret = client_secret
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
