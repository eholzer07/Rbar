"use client"
import dynamic from "next/dynamic"
import { useState, useEffect, useCallback } from "react"
import { Team, Sport } from "@prisma/client"
import Link from "next/link"

const VenueMap = dynamic(() => import("./venue-map"), { ssr: false })

export type VenueSearchResult = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  lat: number
  lng: number
  distance: number
  teams: { id: string; name: string; city: string; abbreviation: string; sport: Sport }[]
  avgRating: number | null
  reviewCount: number
}

type LocationState =
  | { kind: "none" }
  | { kind: "requesting" }
  | { kind: "set"; lat: number; lng: number; label: string }
  | { kind: "error"; message: string }

type Props = {
  teams: (Team & { league: { shortName: string } })[]
}

const RADIUS_OPTIONS = [
  { label: "5 mi", value: 8047 },
  { label: "10 mi", value: 16093 },
  { label: "25 mi", value: 40234 },
  { label: "50 mi", value: 80467 },
]

const SPORT_ORDER: Sport[] = [
  "AMERICAN_FOOTBALL",
  "BASKETBALL",
  "BASEBALL",
  "HOCKEY",
  "SOCCER",
]

export default function VenueSearch({ teams }: Props) {
  const [locationState, setLocationState] = useState<LocationState>({ kind: "none" })
  const [cityInput, setCityInput] = useState("")
  const [teamId, setTeamId] = useState("")
  const [radius, setRadius] = useState(40234)
  const [venues, setVenues] = useState<VenueSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const runSearch = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          radius: String(radius),
        })
        if (teamId) params.set("teamId", teamId)
        const res = await fetch(`/api/venues/search?${params}`)
        const data = await res.json()
        setVenues(data.venues ?? [])
      } finally {
        setLoading(false)
      }
    },
    [teamId, radius]
  )

  useEffect(() => {
    if (locationState.kind === "set") {
      runSearch(locationState.lat, locationState.lng)
    }
  }, [locationState, runSearch])

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setLocationState({ kind: "error", message: "Geolocation not supported" })
      return
    }
    setLocationState({ kind: "requesting" })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationState({
          kind: "set",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Current location",
        })
      },
      () => {
        setLocationState({ kind: "error", message: "Location access denied" })
      }
    )
  }

  async function handleCitySearch(e: React.FormEvent) {
    e.preventDefault()
    if (!cityInput.trim()) return
    setLocationState({ kind: "requesting" })
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(cityInput)}`)
    if (!res.ok) {
      setLocationState({ kind: "error", message: "Location not found — try a different query" })
      return
    }
    const data = await res.json()
    setLocationState({ kind: "set", lat: data.lat, lng: data.lng, label: data.displayName })
  }

  const teamsBySport = SPORT_ORDER.map((sport) => ({
    sport,
    teams: teams.filter((t) => t.sport === sport),
  })).filter((g) => g.teams.length > 0)

  const sportLabel: Record<Sport, string> = {
    AMERICAN_FOOTBALL: "Football",
    BASKETBALL: "Basketball",
    BASEBALL: "Baseball",
    HOCKEY: "Hockey",
    SOCCER: "Soccer",
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left panel */}
      <aside className="flex w-2/5 flex-col overflow-hidden border-r border-neutral-200 dark:border-neutral-800">
        {/* Filter bar */}
        <div className="shrink-0 space-y-3 border-b border-neutral-200 p-4 dark:border-neutral-800">
          {/* Location input */}
          <form onSubmit={handleCitySearch} className="flex gap-2">
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="City, zip, or address..."
              className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={locationState.kind === "requesting"}
              className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
            >
              Go
            </button>
            <button
              type="button"
              onClick={handleGeolocate}
              disabled={locationState.kind === "requesting"}
              title="Use my location"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              📍
            </button>
          </form>

          {/* Location status */}
          {locationState.kind === "requesting" && (
            <p className="text-xs text-neutral-500">Getting location...</p>
          )}
          {locationState.kind === "set" && (
            <p className="truncate text-xs text-neutral-500">{locationState.label}</p>
          )}
          {locationState.kind === "error" && (
            <p className="text-xs text-red-500">{locationState.message}</p>
          )}

          {/* Team filter */}
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          >
            <option value="">All Teams</option>
            {teamsBySport.map(({ sport, teams: sportTeams }) => (
              <optgroup key={sport} label={sportLabel[sport]}>
                {sportTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.city} {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Radius segmented control */}
          <div className="flex gap-1">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRadius(opt.value)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                  radius === opt.value
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Venue list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-400">
              Searching...
            </div>
          ) : venues.length === 0 && locationState.kind === "set" ? (
            <div className="flex h-32 items-center justify-center text-sm text-neutral-400">
              No venues found in this area
            </div>
          ) : venues.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-center text-sm text-neutral-400 px-4">
              Set your location above to find nearby venues
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {venues.map((venue) => (
                <li
                  key={venue.id}
                  onClick={() => setSelectedId(venue.id)}
                  className={`cursor-pointer p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                    selectedId === venue.id
                      ? "border-l-2 border-blue-600 bg-blue-50 dark:bg-blue-900/10"
                      : "border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/venues/${venue.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-neutral-900 hover:underline dark:text-white"
                      >
                        {venue.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {venue.address}, {venue.city}, {venue.state}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {venue.distance} mi
                    </span>
                  </div>

                  {venue.teams.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {venue.teams.map((t) => (
                        <span
                          key={t.id}
                          className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {t.abbreviation}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-1.5 text-xs text-neutral-400">
                    {venue.avgRating !== null
                      ? `★ ${venue.avgRating.toFixed(1)} (${venue.reviewCount} review${venue.reviewCount !== 1 ? "s" : ""})`
                      : "No reviews yet"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Right panel — map */}
      <main className="relative w-3/5">
        {locationState.kind === "set" ? (
          <VenueMap
            venues={venues}
            center={[locationState.lat, locationState.lng]}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Set your location to see venues on the map
          </div>
        )}
      </main>
    </div>
  )
}
