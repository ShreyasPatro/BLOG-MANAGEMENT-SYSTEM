import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findOne, logActivity, updateRowById } from "./sheets";
import type { User } from "@/types";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 }, // 12h
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) return null;
        const user = await findOne<User>(
          "Users",
          (u) => u.email.toLowerCase() === creds.email.toLowerCase()
        );
        if (!user) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;
        // update lastLogin (fire-and-forget; don't block auth)
        updateRowById("Users", user.id, { lastLogin: new Date().toISOString() })
          .catch(() => {});
        logActivity({
          userEmail: user.email,
          action: "login",
          entityType: "auth",
          entityId: user.id,
        }).catch(() => {});
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as never;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: string }).role;
        token.uid = (user as unknown as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { role: string }).role = token.role as string;
        (session.user as unknown as { id: string }).id = token.uid as string;
      }
      return session;
    },
  },
};