import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyCSRFToken } from '@/lib/security/csrf'

export async function requireCsrf(req: NextRequest) {
  const headerToken = req.headers.get('x-csrf-token')
  if (!headerToken || !(await verifyCSRFToken(req))) {
    return NextResponse.json({ error: 'CSRF token invalid' }, { status: 403 })
  }
  return null
}
