import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        twoFactorToken: { label: '2FA Token', type: 'text', optional: true }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          }
        })

        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        if (user.twoFactorSecret) {
          const token = credentials.twoFactorToken
          if (!token) throw new Error('2FA_REQUIRED')
          const { authenticator } = await import('otplib')
          const isValid2FA = authenticator.verify({
            token,
            secret: user.twoFactorSecret
          })
          if (!isValid2FA) throw new Error('Invalid 2FA token')
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // ✅ CRITICAL FIX: This catches the client update() call
      if (trigger === 'update' && session?.email) {
        token.email = session.email
      }
      if (user) {
        token.role = user.role
        token.id = user.id
        token.createdAt = user.createdAt
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.createdAt = token.createdAt
        if (token.email) {
          session.user.email = token.email
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}
