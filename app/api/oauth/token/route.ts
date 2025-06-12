import { NextRequest, NextResponse } from 'next/server';
import MCPAuthHandler from '@/app/MCPAuthHandler';

export async function POST(request: NextRequest) {
  try {
    const { code, provider } = await request.json();
    
    // Get provider configuration
    const authHandler = MCPAuthHandler.oauth2(provider);
    
    // Prepare token exchange request
    const body = {
      code: code,
      client_id: String(authHandler.client_id),
      client_secret: process.env.LINEAR_CLIENT_SECRET || '',
      redirect_uri: authHandler.redirect_uri,
      grant_type: 'authorization_code'
    };

    // Make token exchange request to provider
    const response = await fetch(authHandler.token_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
