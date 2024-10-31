import { useServerSession } from "@/lib/hooks/use-session.server";
import { createClient } from "@/lib/supabase/server";
import NextAuth from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import InstagramProvider from "next-auth/providers/instagram";
import TwitterProvider from "next-auth/providers/twitter";

const options = {
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const supabase = await createClient();
      const { session } = await useServerSession();
      const userMetadata = session?.user_metadata;
      console.log("㊙️ jwt ㊙️", token, account);

      if (account && userMetadata) {
        const user = {
          name: token.name,
          email: token.email,
          picture: token.picture,
        };
        token[account.provider] = {
          ...user,
          access_token: account.access_token,
          expires_at: account.expires_at,
        };

        if (!userMetadata[account.provider]) {
          userMetadata[account.provider] = user;

          supabase.auth.updateUser({
            data: userMetadata,
          });
        }
      }

      return token;
    },
    async session({ session, token }) {
      const user = {
        name: token.name,
        email: token.email,
        picture: token.picture,
        access_token: token.access_token,
      };

      if (token.facebook) {
        session.user.facebook = user;
      } else if (token.twitter) {
        session.user.twitter = user;
      } else if (token.instagram) {
        session.user.instagram = user;
      }

      return session;
    },
  },
};

const handler = await NextAuth(options);

export { handler as GET, handler as POST };
