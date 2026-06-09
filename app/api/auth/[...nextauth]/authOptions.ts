import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter an email/username and password')
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.username },
              { username: credentials.username }
            ]
          }
        })

        if (!user || !user.password) {
          throw new Error('No user found with those credentials')
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) {
          throw new Error('Incorrect password')
        }

        if (user.banned) {
          throw new Error('This account has been suspended')
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial user login capture
      if (user) {
        token.id = user.id
        token.username = user.username
        token.email = user.email
        token.role = user.role
      }

      // This catches your client update call and silently updates the cookie!
      if (trigger === "update" && session?.email) {
        token.email = session.email
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.email = token.email as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}
