import F4Session from "../components/types/F4Session";

export async function handleSignOut(session: F4Session|undefined) {
  const accessToken = session?.access_token;

  // Revoke the access token
  if (accessToken) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}