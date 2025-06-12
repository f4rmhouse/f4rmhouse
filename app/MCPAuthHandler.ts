export default class MCPAuthHandler {
    static oauth2(provider: string) {
        switch (provider) {
          case "google":
            return {
              redirect_uri: "http://localhost:3000/auth/google", 
              token_url: "https://accounts.google.com/o/oauth2/v2/auth",
            }
          case "github":
            return {
              redirect_uri: "http://localhost:3000/auth/google", 
              token_url: "https://accounts.google.com/o/oauth2/v2/auth",

            }
          case "linear":
            return {
              client_id: "87f7abc193eb00039e474aab7de0ff96",
              client_secret: process.env.LINEAR_CLIENT_SECRET,
              authorization_server: "https://linear.app/oauth/authorize",
              redirect_uri: "http://localhost:3000/callback/mcp/oauth", 
              token_url: "https://api.linear.app/oauth/token",
            }
          default:
            return {
              redirect_uri: "unknown", 
              token_url: "unknown",
            }
        }
    }
}
