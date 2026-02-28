import { NextResponse } from 'next/server'
import { syncTeamLogos, syncUpcomingGames } from '@/lib/sports-db'

export async function POST(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET
  if (!adminSecret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 401 })
  }

  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const logos = await syncTeamLogos()
  const games = await syncUpcomingGames()

  return NextResponse.json({ success: true, logos, games })
}
