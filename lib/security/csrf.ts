import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// No in-memory store – we verify directly from the cookie

export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function setCSRFToken(res: NextResponse): NextResponse {
  const token = generateCSRFToken()
  res.cookies.set('csrf_token', token, {
    httpOnly: false, // Must be false so document.cookie can read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/'
  })
  return res
}

export async function verifyCSRFToken(req: NextRequest): Promise<boolean> {
  // Get the token from the request header
  const headerToken = req.headers.get('x-csrf-token')
  // Get the token from the cookie
  const cookieToken = req.cookies.get('csrf_token')?.value
  
  // If either is missing, verification fails
  if (!headerToken || !cookieToken) {
    return false
  }
  
  // Compare the two tokens
  return headerToken === cookieToken
}
