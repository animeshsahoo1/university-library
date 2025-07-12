import NextAuth, {Session, User } from "next-auth";
import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import type { JWT } from "next-auth/jwt";


export const authOptions = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or passsword");
        }

        try {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email.toString()))
            .limit(1);
          if (user.length === 0) return null;

          const isPasswordValid = await compare(
            credentials.password.toString(),
            user[0].password
          );

          if (!isPasswordValid) return null;


          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].fullName,
          } as User;
        } catch (error: any) {
          console.error("auth error", error.message);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }:{ token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      return token;
    },
    async session({ session, token }:{session: Session, token:JWT}) {
      if (session.user) {
        //@ts-ignore
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET!,
});
