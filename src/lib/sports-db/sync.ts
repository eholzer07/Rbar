import { db } from '../db'
import { fetchTeamsByLeague, fetchEventsBySeason, delay } from './client'
import type { LeagueConfig } from './types'

const LEAGUE_CONFIGS: LeagueConfig[] = [
  { shortName: 'NFL', externalId: '4391', searchName: 'NFL' },
  { shortName: 'NBA', externalId: '4387', searchName: 'NBA' },
  { shortName: 'MLB', externalId: '4424', searchName: 'MLB' },
  { shortName: 'NHL', externalId: '4380', searchName: 'NHL' },
  { shortName: 'MLS', externalId: '4346', searchName: 'American Major League Soccer' },
]

export function getCurrentSeason(shortName: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-based

  if (shortName === 'NBA' || shortName === 'NHL') {
    return month <= 6 ? `${year - 1}-${year}` : `${year}-${year + 1}`
  }
  if (shortName === 'NFL') {
    return month <= 6 ? `${year - 1}` : `${year}`
  }
  // MLB, MLS: current calendar year
  return `${year}`
}

export async function syncTeamLogos(): Promise<{
  leaguesUpdated: number
  teamsUpdated: number
  errors: string[]
}> {
  const errors: string[] = []
  let leaguesUpdated = 0
  let teamsUpdated = 0

  const dbLeagues = await db.league.findMany()
  const dbTeams = await db.team.findMany({
    select: { id: true, name: true, city: true, leagueId: true },
  })

  for (const config of LEAGUE_CONFIGS) {
    const league = dbLeagues.find((l) => l.shortName === config.shortName)
    if (!league) {
      errors.push(`League not found in DB: ${config.shortName}`)
      await delay(200)
      continue
    }

    // Update league externalId
    await db.league.update({
      where: { id: league.id },
      data: { externalId: config.externalId },
    })
    leaguesUpdated++

    // Fetch teams from API
    const apiTeams = await fetchTeamsByLeague(config.searchName, config.searchSport)
    if (!apiTeams) {
      errors.push(`Failed to fetch teams for ${config.shortName}`)
      await delay(200)
      continue
    }

    const leagueDbTeams = dbTeams.filter((t) => t.leagueId === league.id)

    for (const apiTeam of apiTeams) {
      const fullName = apiTeam.strTeam?.toLowerCase() ?? ''
      const shortCode = apiTeam.strTeamShort?.toLowerCase() ?? ''

      let match = leagueDbTeams.find(
        (t) => shortCode && shortCode === t.name.toLowerCase()
      )
      if (!match) {
        match = leagueDbTeams.find(
          (t) => fullName === `${t.city} ${t.name}`.toLowerCase()
        )
      }
      if (!match) {
        match = leagueDbTeams.find(
          (t) => fullName.includes(t.name.toLowerCase())
        )
      }

      if (!match) {
        errors.push(`No DB match for API team: ${apiTeam.strTeam} (${config.shortName})`)
        continue
      }

      await db.team.update({
        where: { id: match.id },
        data: {
          externalId: apiTeam.idTeam,
          logoUrl: apiTeam.strBadge || null,
        },
      })
      teamsUpdated++
    }

    await delay(200)
  }

  return { leaguesUpdated, teamsUpdated, errors }
}

export async function syncUpcomingGames(): Promise<{
  gamesCreated: number
  gamesUpdated: number
  leaguesSkipped: number
  errors: string[]
}> {
  const errors: string[] = []
  let gamesCreated = 0
  let gamesUpdated = 0
  let leaguesSkipped = 0

  const now = new Date()
  const windowEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  // Only sync leagues that have externalId (logo sync ran first)
  const dbLeagues = await db.league.findMany({
    where: { externalId: { not: null } },
  })

  // Build team name lookup map: "city name" (lowercase) -> teamId
  const dbTeams = await db.team.findMany({
    select: { id: true, name: true, city: true, leagueId: true },
  })
  const teamByName = new Map<string, string>()
  for (const t of dbTeams) {
    const key = `${t.city} ${t.name}`.toLowerCase()
    teamByName.set(key, t.id)
  }

  for (const league of dbLeagues) {
    const config = LEAGUE_CONFIGS.find((c) => c.externalId === league.externalId)
    if (!config) {
      leaguesSkipped++
      await delay(200)
      continue
    }

    const season = getCurrentSeason(config.shortName)
    const apiEvents = await fetchEventsBySeason(league.externalId!, season)
    if (!apiEvents) {
      errors.push(`Failed to fetch events for ${config.shortName} season ${season}`)
      await delay(200)
      continue
    }

    // Filter to 14-day window
    const windowEvents = (apiEvents ?? []).filter((e) => {
      if (!e.dateEvent) return false
      const timeStr = e.strTime && e.strTime.trim() ? e.strTime : '12:00:00+00:00'
      const startTime = new Date(`${e.dateEvent}T${timeStr}`)
      return startTime >= now && startTime <= windowEnd
    })

    for (const event of windowEvents) {
      const timeStr = event.strTime && event.strTime.trim() ? event.strTime : '12:00:00+00:00'
      const startTime = new Date(`${event.dateEvent}T${timeStr}`)

      // Match teams by full name (works for "City Name" format)
      const homeTeamId = teamByName.get(event.strHomeTeam?.toLowerCase() ?? '')
      const awayTeamId = teamByName.get(event.strAwayTeam?.toLowerCase() ?? '')

      if (!homeTeamId || !awayTeamId) {
        errors.push(
          `Could not match teams for event ${event.idEvent}: "${event.strHomeTeam}" vs "${event.strAwayTeam}"`
        )
        continue
      }

      const homeScore =
        event.intHomeScore != null ? parseInt(event.intHomeScore, 10) : null
      const awayScore =
        event.intAwayScore != null ? parseInt(event.intAwayScore, 10) : null
      const isCompleted = ['Match Finished', 'Final', 'FT'].includes(event.strStatus)

      const gameData = {
        externalId: event.idEvent,
        leagueId: league.id,
        homeTeamId,
        awayTeamId,
        startTime,
        season,
        homeScore,
        awayScore,
        isCompleted,
        broadcastChannels: [] as string[],
      }

      const existing = await db.game.findFirst({
        where: { externalId: event.idEvent },
      })

      if (existing) {
        await db.game.update({ where: { id: existing.id }, data: gameData })
        gamesUpdated++
      } else {
        await db.game.create({ data: gameData })
        gamesCreated++
      }
    }

    await delay(200)
  }

  return { gamesCreated, gamesUpdated, leaguesSkipped, errors }
}
