import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

const getProvider = (pfp:string) => {
  if (pfp.includes("google")) {
    return "google"
  } 
  if (pfp.includes("github")) {
    return"github"
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google, GitHub],
  callbacks: {
    async jwt({token, account}) {
      if (account) {
        token = Object.assign({}, token, { access_token: account.access_token });
      }
      return token
    },
    async session({session, token}) {
      if(session) {
        session = Object.assign({}, session, {provider: getProvider(String(session.user.image)), access_token: token.access_token})
        //axios.post("http://localhost:8000/login/insert/token", {username:"filip", token: "123", validUntil: 123, provider: "github"}, {headers: {"Authorization": session.access_token}})
      }
      return session
    }

  }
})