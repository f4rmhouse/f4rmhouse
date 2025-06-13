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
            const tokenResponse = await fetch('/api/oauth/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, provider: state })
            });
            
            const result = await tokenResponse.json();
            
            if (!result.success) {
              throw new Error(result.error || 'Failed to exchange token');
            }

            console.log(result)

            if(state && state.length > 0) {
              createToken(result.tokens.access_token, state)
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
          // Close the current tab after a short delay to show the success message
          setTimeout(() => window.close(), 4000);
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
    if(session && session.user && session.provider && session.access_token) {
      // @ts-ignore
      let user = new User(String(session.user.email), String(session.provider), String(session.access_token))
      let token = {
        username: String(session.user.email),
        server: server,
        token: access_code,
        provider: server 
      }
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
            <p className="text-xl mb-4">{authStatus}</p>
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
