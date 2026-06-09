import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId || !/^\d+$/.test(userId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }

    // 1. First, visit the main page to get cookies
    const mainPage = await fetch('https://pay.neteasegames.com/WhereWindsMeet/topup?from=home', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    })

    const cookies = mainPage.headers.get('set-cookie') || ''

    // 2. Simulate clicking "Log In" – send a POST request with the roleid
    const loginResponse = await fetch('https://pay.neteasegames.com/gameclub/wherewindsmeet/-1/login-role', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        'Cookie': cookies,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://pay.neteasegames.com/WhereWindsMeet/topup?from=home',
      },
      // The endpoint expects roleid as a query parameter
    })

    // Actually, the endpoint we saw earlier used roleid as a query param, not a POST body.
    // Let's use the correct URL format from your dev tools:
    const deviceid = '208134903493853424'
    const traceid = crypto.randomUUID()
    const timestamp = Date.now()
    const finalUrl = `https://pay.neteasegames.com/gameclub/wherewindsmeet/-1/login-role?deviceid=${deviceid}&traceid=${traceid}&timestamp=${timestamp}&gc_client_version=1.13.18&roleid=${userId}&client_type=gameclub`

    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
        'Cookie': cookies,
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://pay.neteasegames.com/WhereWindsMeet/topup?from=home',
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const json = await response.json()

    if (json.code === '0000' && json.data && json.data.rolename) {
      return NextResponse.json({ username: json.data.rolename })
    } else {
      return NextResponse.json({ username: `Player_${userId}` })
    }

  } catch (error) {
    console.error('Username fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch username' }, { status: 500 })
  }
}
