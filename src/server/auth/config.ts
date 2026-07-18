import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import { db } from "~/server/db";


declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const authConfig = {
  providers: [
    Credentials({
      name: "Dev Login",
      credentials: { email: { label: "Email", type: "email" } },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        if (!email) return null;
        const user = await db.user.findUnique({ where: { email } });
        return user ?? null;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
      },
    }),
  },
  // callbacks: {
  //   session: ({ session, token }) => ({
  //     ...session,
  //     user: {
  //       ...session.user,
  //       id: token.sub!,
  //     },
  //   }),
  // },
} satisfies NextAuthConfig;