import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createWatchEventAction } from "./actions"

type Props = { searchParams: Promise<{ venueId?: string; error?: string }> }

export default async function NewWatchEventPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const { venueId, error } = await searchParams
  if (!venueId) redirect("/search")

  const venue = await db.venue.findUnique({
    where: { id: venueId },
    select: {
      id: true,
      name: true,
      slug: true,
      venueTeams: { select: { teamId: true } },
    },
  })
  if (!venue) notFound()

  const teamIds = venue.venueTeams.map((vt) => vt.teamId)

  const games = await db.game.findMany({
    where: {
      OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
      startTime: { gte: new Date() },
      isCompleted: false,
    },
    include: { homeTeam: true, awayTeam: true, league: true },
    orderBy: { startTime: "asc" },
    take: 20,
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/venues/${venue.slug}`} className="text-sm text-blue-600 hover:underline">
          ← Back to {venue.name}
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
          Host a Watch Event
        </h1>
        <p className="mt-1 text-sm text-neutral-500">at {venue.name}</p>
      </div>

      {error === "missing-fields" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Please select a game before submitting.
        </div>
      )}

      {games.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 p-6 text-center dark:border-neutral-700">
          <p className="text-neutral-500">No upcoming games found for this venue&apos;s teams.</p>
          <p className="mt-1 text-sm text-neutral-400">
            Games appear here once the schedule is synced.
          </p>
        </div>
      ) : (
        <form action={createWatchEventAction} className="space-y-5">
          <input type="hidden" name="venueId" value={venue.id} />

          {/* Game picker */}
          <div>
            <label
              htmlFor="gameId"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Game <span className="text-red-500">*</span>
            </label>
            <select
              id="gameId"
              name="gameId"
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            >
              <option value="">Select a game…</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.awayTeam.city} {game.awayTeam.name} @{" "}
                  {game.homeTeam.city} {game.homeTeam.name} —{" "}
                  {new Date(game.startTime).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {game.league.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Optional title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Event Title <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Bears watch party!"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          {/* Optional description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Description <span className="text-neutral-400">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Any details fans should know…"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            />
          </div>

          {/* Visibility */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Visibility
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  defaultChecked
                  className="mt-0.5"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  <strong>Public</strong> — visible to all fans
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="radio" name="visibility" value="PRIVATE" className="mt-0.5" />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  <strong>Private</strong> — only visible to you until invite support is added
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Create Watch Event
          </button>
        </form>
      )}
    </div>
  )
}
