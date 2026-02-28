export interface SportsDbTeam {
  idTeam: string
  idLeague: string
  strTeam: string
  strTeamShort: string
  strBadge: string
}

export interface SportsDbEvent {
  idEvent: string
  dateEvent: string
  strTime: string | null
  idHomeTeam: string
  strHomeTeam: string
  idAwayTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  strStatus: string
  intRound: string | null
}

export interface SportsDbTeamsResponse {
  teams: SportsDbTeam[] | null
}

export interface SportsDbEventsResponse {
  events: SportsDbEvent[] | null
}

export interface LeagueConfig {
  shortName: string
  externalId: string
  searchName: string
  searchSport?: string
}
