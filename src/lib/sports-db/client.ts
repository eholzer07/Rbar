import type { SportsDbTeam, SportsDbEvent, SportsDbTeamsResponse, SportsDbEventsResponse } from './types'

const BASE_URL = process.env.SPORTS_DB_BASE_URL || 'https://www.thesportsdb.com/api/v1/json'
const API_KEY = process.env.SPORTS_DB_API_KEY || '123'

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchTeamsByLeague(
  searchName: string,
  searchSport?: string
): Promise<SportsDbTeam[] | null> {
  try {
    let url = `${BASE_URL}/${API_KEY}/search_all_teams.php?l=${encodeURIComponent(searchName)}`
    if (searchSport) url += `&s=${encodeURIComponent(searchSport)}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data: SportsDbTeamsResponse = await res.json()
    return data.teams
  } catch {
    return null
  }
}

export async function fetchEventsBySeason(leagueId: string, season: string): Promise<SportsDbEvent[] | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/${API_KEY}/eventsseason.php?id=${leagueId}&s=${encodeURIComponent(season)}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    const data: SportsDbEventsResponse = await res.json()
    return data.events
  } catch {
    return null
  }
}
