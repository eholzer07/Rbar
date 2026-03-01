"use client"

import { useState, useTransition } from "react"
import { Team, League, Sport } from "@prisma/client"
import { toggleFavoriteAction } from "@/app/teams/actions"
import { Star, Check } from "lucide-react"
import Link from "next/link"

type TeamWithFavorite = Team & { league: League; isFavorite: boolean }
type Props = { teams: TeamWithFavorite[]; onboarding?: boolean }

const SPORT_LABELS: Record<Sport, string> = {
  AMERICAN_FOOTBALL: "NFL",
  BASKETBALL: "NBA",
  BASEBALL: "MLB",
  HOCKEY: "NHL",
  SOCCER: "Soccer",
}

export default function TeamBrowser({ teams, onboarding }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(teams.filter((t) => t.isFavorite).map((t) => t.id))
  )
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState("")
  const [sport, setSport] = useState<Sport | "ALL">("ALL")
  const [, startTransition] = useTransition()

  const sports = Array.from(new Set(teams.map((t) => t.sport))) as Sport[]

  const filtered = teams.filter(
    (t) =>
      (sport === "ALL" || t.sport === sport) &&
      (!query ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.city.toLowerCase().includes(query.toLowerCase()))
  )

  function handleToggle(teamId: string) {
    setFavorites((prev) => {
      const n = new Set(prev)
      if (n.has(teamId)) {
        n.delete(teamId)
      } else {
        n.add(teamId)
      }
      return n
    })
    setPending((prev) => new Set(prev).add(teamId))
    startTransition(async () => {
      await toggleFavoriteAction(teamId)
      setPending((prev) => {
        const n = new Set(prev)
        n.delete(teamId)
        return n
      })
    })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search teams or cities..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
      />

      {/* Sport tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSport("ALL")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            sport === "ALL"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
          }`}
        >
          All
        </button>
        {sports.map((s) => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              sport === s
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            }`}
          >
            {SPORT_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((team) => {
          const isFav = favorites.has(team.id)
          const isPending = pending.has(team.id)
          return (
            <div
              key={team.id}
              className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                isFav
                  ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800"
                  : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={team.logoUrl ?? ""}
                alt={`${team.city} ${team.name} logo`}
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <div className="text-center">
                <p className="text-xs font-medium leading-tight text-neutral-900 dark:text-white">
                  {team.city}
                </p>
                <p className="text-xs leading-tight text-neutral-600 dark:text-neutral-400">
                  {team.name}
                </p>
                <span className="mt-1 inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400">
                  {team.league.shortName}
                </span>
              </div>
              <button
                onClick={() => handleToggle(team.id)}
                disabled={isPending}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                  isFav
                    ? "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {isFav ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Star className="h-3 w-3" />
                )}
                {isFav ? "Saved" : "Save"}
              </button>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-neutral-500">No teams found.</p>
      )}

      {/* Onboarding actions */}
      {onboarding && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Done →
          </Link>
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Skip
          </Link>
        </div>
      )}
    </div>
  )
}
