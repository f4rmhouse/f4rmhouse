import MCPAuthHandler from '@/app/MCPAuthHandler';
import Store from '@/app/microstore/Store';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
      const { access_token, client_id, code_verifier, provider, uti} = await request.json();
  
      // Prepare token exchange request
      const body: any = {
        access_token: access_token,
      };

      let revocation_url: string = ""
      // let encodedCredentials: string = ""
  
      // Get secret and revocation url if provider is provided 
      if (provider) {
        const envVarName = `${provider.toUpperCase()}_CLIENT_SECRET`;
        const client_secret = process.env[envVarName];
        // encodedCredentials = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

        if (!client_secret) {
            console.error(`Client secret not found for provider: ${provider}. Expected environment variable: ${envVarName}`);
            
        }

        revocation_url = MCPAuthHandler.oauth2(provider).revocation_url ?? ""
  
        body.client_secret = client_secret
      }

      else {
        // TODO fix this
        let store = new Store()
        let product = await store.getProduct(uti)
        let responseFromServer = await fetch(product.Message.server.uri.split("/").slice(0, -1).join("/") + "/.well-known/oauth-authorization-server")
        let responseFromServerJson = await responseFromServer.json()
        if(responseFromServerJson.revocation_endpoint) {
            revocation_url = responseFromServerJson.revocation_endpoint
        }
        else {
            return NextResponse.json({ success: false, error: "No revocation endpoint found" });
        }
      }

      // Make token exchange request to provider
      console.log("access token: ", access_token)
      console.log("revocation url: ", revocation_url)
      console.log("body: ", body)

      // I get the revocation URL from https://mcp.linear.app/.well-known/oauth-authorization-server
      // revocation_url = https://mcp.linear.app/token
      const response = await fetch(revocation_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body)
      });
  
      // Get token response
      console.log("response status: ", response.status)
      console.log("response headers: ", response.headers)
      
      // Read the response body as text first
      const responseText = await response.text();
      console.log("response text: ", responseText);
      
      // Try to parse as JSON if there's content
      let response_body;
      if (responseText) {
        try {
          response_body = JSON.parse(responseText);
        } catch (error) {
          console.log("Response is not JSON, using text:", responseText);
          response_body = { message: responseText };
        }
      } else {
        response_body = { message: "Empty response" };
      }

      // Return tokens to client
      return NextResponse.json({ success: true, response_body });
    } catch (error) {
      console.error('Sign out failed', error);
      return NextResponse.json(
        { success: false, error: 'Failed to sign out' },
        { status: 500 }
      );
    }
  }