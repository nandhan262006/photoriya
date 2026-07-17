import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, String(credentials.email)),
        });

        if (!user || !user.password) return null;

        const isValid = await compare(
          String(credentials.password),
          user.password
        );
        if (!isValid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const t = token as { role?: string; id?: string };
      if (user) {
        t.role = (user as { role?: string }).role;
        t.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const u = session.user as { role?: string; id?: string };
      const t = token as { role?: string; id?: string };
      if (u) {
        u.role = t.role ?? "";
        u.id = t.id ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});
