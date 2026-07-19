import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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

        // Mock auth - replace with real database lookup later
        return {
          id: "1",
          email: credentials.email as string,
          name: "Admin User",
          role: "admin",
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
