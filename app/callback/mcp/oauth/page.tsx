"use client"
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MCPAuthHandler from '@/app/MCPAuthHandler';
import { useSession } from 'next-auth/react';
import User from '@/app/microstore/User';

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState('Processing authorization...');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if(session) {
      async function handleOAuthCallback() {
        try {
          // Extract authorization code and state from URL
          const code = searchParams.get('code');
          const state = searchParams.get('state');
          const error = searchParams.get('error');

          if (error) {
            setError(`Authorization failed: ${error}`);
            return;
          }
          
          if (!code) {
            setError('No authorization code received');
            return;
          }
          
          // Exchange the code for tokens using our API endpoint
          try {
            // Get PKCE code_verifier from localStorage
            const codeVerifier = localStorage.getItem('pkce_code_verifier');
            
            // Use state parameter to identify which client and get the correct client_id
            const clientIdentifier = state; // state contains the client ID
            const storageKey = `oauth_client_id_${clientIdentifier}`;
            let client_id = localStorage.getItem(storageKey);
            
            console.log('Retrieved PKCE code_verifier:', codeVerifier);
            console.log('Client identifier from state:', clientIdentifier);
            console.log('Storage key:', storageKey);
            console.log('Retrieved client_id:', client_id);
            
            if (!client_id) {
              client_id = "Ov23lisEYupHgMBdiir5"
            }
            
            const tokenResponse = await fetch('/api/oauth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                code, 
                provider: "mcp",
                code_verifier: codeVerifier,
                client_id: client_id,
                token_url: "https://github.com/login/oauth/access_token"
              })
            });
            
            const result = await tokenResponse.json();
            
            if (!result.success) {
              throw new Error(result.error || 'Failed to exchange token');
            }

            console.log("RESULT: ", result)

            if(state && state.length > 0) {
              await createToken(result.tokens.access_token, state)
            }
            
            if (window.opener) {
              console.log(window.location.origin);
            }
          } catch (tokenError) {
            console.error('Token exchange error:', tokenError);
            setError('Failed to exchange authorization code for tokens');
            return;
          } 
          // For now, just show success
          setAuthStatus('Authorization successful!');
          
          // Close this window if it was opened as a popup
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin);
          }
          
          // Start countdown timer
          setCountdown(5);
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev === null || prev <= 1) {
                clearInterval(timer);
                window.close();
                return null;
              }
              return prev - 1;
            });
          }, 100000);
        } catch (err) {
          console.error('OAuth callback error:', err);
          setError('Failed to process authorization');
        }
      }
      
      handleOAuthCallback();
    }
  }, [searchParams, session]);

  const createToken = async (access_code: string, server: string) => {
    // @ts-ignore
    if(access_code && session && session.user && session.provider && session.access_token) {
      // @ts-ignore
      let user = new User(String(session.user.email), String(session.provider), String(session.access_token))
      let token = {
        username: String(session.user.email),
        server: server,
        token: access_code,
        provider: server 
      }
      console.log("t: ", token)
      user.createToken(token).then(e => console.log(e))
    }
  } 
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">
        OAuth Authentication
      </h1>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md w-full max-w-md">
        {error ? (
          <div className="text-red-500">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-4">
              {authStatus}
              {authStatus === 'Authorization successful!' && ' 🎉'}
            </p>
            {countdown !== null && (
              <p className="text-sm text-gray-600 mt-2">
                This tab will close in {countdown}s
              </p>
            )}
            <div className="animate-pulse mt-4">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="h-2 bg-slate-200 rounded mt-2"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
