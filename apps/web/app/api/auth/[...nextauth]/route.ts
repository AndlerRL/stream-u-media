import { instagramFetchInterceptor } from "@/lib/auth/instagram-fetch.interceptor";
import { useServerSession } from "@/lib/hooks/use-session.server";
import { createClient } from "@/lib/supabase/server";
import NextAuth, { NextAuthOptions } from "next-auth";
import FacebookProvider from "next-auth/providers/facebook";
import InstagramProvider from "next-auth/providers/instagram";
import TwitterProvider from "next-auth/providers/twitter";
import { NextRequest, NextResponse } from "next/server";

const originalFetch = fetch;

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email?: string;
      image?: string;
      facebook?: {
        name?: string;
        email?: string;
        picture?: string;
        access_token?: string;
        expires_at?: number;
      };
      twitter?: {
        name?: string;
        email?: string;
        picture?: string;
        access_token?: string;
        expires_at?: number;
      };
      instagram?: {
        name?: string;
        email?: string;
        picture?: string;
        access_token?: string;
        expires_at?: number;
      };
    };
  }
}

const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || '',
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: '2.0'
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
      // authorization: 'https://api.instagram.com/oauth/authorize?scope=business_basic%2Cbusiness_content_publish',
      authorization: 'https://api.instagram.com/oauth/authorize?scope=user_profile,user_media',
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
      session.user = {
        ...session.user,
        facebook: undefined,
        twitter: undefined,
        instagram: undefined,
      };
      const user = {
        name: token.name ?? undefined,
        email: token.email ?? undefined,
        picture: token.picture ?? undefined,
        access_token: token.access_token as string,
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

export { handler as POST };

  // ? Shouldn't this be POST instead? 🤔
export async function GET(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const url = new URL(req.url);

  if (url.pathname === "/api/auth/callback/instagram") {
    const { session } = await useServerSession();
    if (!session) {
      /* Prevent user creation for instagram access token */
      const signInUrl = new URL("/?modal=sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }

     /* Intercept the fetch request to patch access_token request to be oauth compliant */
    global.fetch = instagramFetchInterceptor(originalFetch);
    const response = await GET(req, res);
    global.fetch = originalFetch;
    return response;
  }

  return await handler(req, res) as NextResponse;
}
