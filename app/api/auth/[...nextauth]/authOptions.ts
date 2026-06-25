import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function upsertOAuthUser(params: {
  email: string
  name?: string | null
  image?: string | null
  provider: string
  providerAccountId: string
  account: Record<string, unknown>
}) {
  let user = await prisma.user.findUnique({ where: { email: params.email } })

  if (!user) {
    const base = (params.name || params.email.split('@')[0]).replace(/\W/g, '').slice(0, 20) || 'user'
    let username = base
    let n = 1
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${base}${n++}`
    }
    user = await prisma.user.create({
      data: {
        email: params.email,
        username,
        password: null,
        image: params.image || null,
        isVerified: true,
      },
    })
  }

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: params.provider,
        providerAccountId: params.providerAccountId,
      },
    },
    create: {
      userId: user.id,
      type: 'oauth',
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      access_token: (params.account.access_token as string) || null,
      refresh_token: (params.account.refresh_token as string) || null,
      expires_at: (params.account.expires_at as number) || null,
      token_type: (params.account.token_type as string) || null,
      scope: (params.account.scope as string) || null,
      id_token: (params.account.id_token as string) || null,
    },
    update: {
      access_token: (params.account.access_token as string) || null,
      refresh_token: (params.account.refresh_token as string) || null,
      expires_at: (params.account.expires_at as number) || null,
    },
  })

  return user
}

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      username: { label: 'Username or Email', type: 'text' },
      password: { label: 'Password', type: 'password' },
      twoFactorToken: { label: '2FA Token', type: 'text', optional: true },
    },
    async authorize(credentials) {
      if (!credentials?.username || !credentials?.password) return null

      const identifier = credentials.username.trim()

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: { equals: identifier, mode: 'insensitive' } },
            { email: { equals: identifier, mode: 'insensitive' } },
          ],
        },
      })

      if (!user || !user.password) return null

      const isValid = await bcrypt.compare(credentials.password, user.password)
      if (!isValid) return null

      if (user.twoFactorSecret) {
        const token = credentials.twoFactorToken
        if (!token) throw new Error('2FA_REQUIRED')
        const { authenticator } = await import('otplib')
        const isValid2FA = authenticator.verify({
          token,
          secret: user.twoFactorSecret,
        })
        if (!isValid2FA) throw new Error('Invalid 2FA token')
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider === 'credentials') return true
      const email = user.email || (profile as { email?: string })?.email
      if (!email) return false

      const dbUser = await upsertOAuthUser({
        email,
        name: user.name,
        image: user.image,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        account: account as unknown as Record<string, unknown>,
      })

      user.id = dbUser.id
      user.username = dbUser.username
      user.role = dbUser.role
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session?.email) {
        token.email = session.email
      }
      if (user) {
        token.role = user.role
        token.id = user.id
        token.username = user.username
        token.email = user.email
        token.createdAt = user.createdAt
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.id = token.id
        session.user.username = token.username
        session.user.createdAt = token.createdAt
        if (token.email) {
          session.user.email = token.email
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
