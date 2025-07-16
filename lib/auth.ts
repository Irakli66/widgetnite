import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Upsert user record into Postgres via Kysely
      await db
        .insertInto("users")
        .values({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          created_at: new Date().toISOString(),
          faceit: null,
          faceitId: null,
          twitch: null,
          kick: null,
        })
        .onConflict((oc) =>
          oc.column("email").doUpdateSet({
            name: user.name ?? null,
            image: user.image ?? null,
          })
        )
        .execute();

      return true;
    },

    async session({ session }) {
      // Optionally enrich session with extra user info here
      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
}; 