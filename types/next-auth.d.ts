import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    username?: string
    createdAt?: Date
  }

  interface Session {
    user: {
      id?: string
      role?: string
      username?: string
      createdAt?: Date
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    username?: string
    createdAt?: Date
  }
}
