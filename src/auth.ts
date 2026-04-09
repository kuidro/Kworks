import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      nombre: string
      email: string
      rol: string
    }
  }
  interface User {
    id: string
    nombre: string
    email: string
    rol: string
  }
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email as string },
        })

        if (!usuario) {
          return null
        }

        const passwordValida = await bcrypt.compare(
          credentials.password as string,
          usuario.password
        )

        if (!passwordValida) {
          return null
        }

        return {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.nombre = user.nombre
        token.rol = user.rol
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.nombre = token.nombre as string
        session.user.rol = token.rol as string
      }
      return session
    },
  },
})
