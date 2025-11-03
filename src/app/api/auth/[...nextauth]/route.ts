// ARQUIVO: src/app/api/auth/[...nextauth]/route.ts
// Handler do NextAuth para /api/auth/* – usa a configuração centralizada

import NextAuth from "next-auth";
import { authOptions } from "@/server/auth/options";

const handler = NextAuth({
  ...authOptions,
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
});

export { handler as GET, handler as POST };