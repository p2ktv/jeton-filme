import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";
import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Max Mustermann",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        const { username, password } = credentials;

        const user = await prisma.user.findUnique({
          where: {
            username,
            password,
          },
        });

        if (user) {
          return {
            id: `${user.id}`,
            name: user.username,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {},
};

export default NextAuth(authOptions);
