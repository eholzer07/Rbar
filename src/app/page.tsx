import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import NearbyVenues from "@/components/nearby-venues"

function formatGameTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date)
}

export default async function Home() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const favoriteTeams = await db.userFavoriteTeam.findMany({
    where: { userId: session.user.id },
    include: { team: { include: { league: true } } },
    orderBy: { createdAt: "asc" },
  })

  if (favoriteTeams.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Welcome to Rbar!
        </h1>
        <p className="mt-2 text-neutral-500">
          Pick your favorite teams to see their upcoming games and nearby venues.
        </p>
        <Link
          href="/teams"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Add your teams →
        </Link>
      </div>
    )
  }

  const favoriteTeamIds = favoriteTeams.map((f) => f.teamId)

  const now = new Date()
  const todayStart = new Date(now.toDateString())
  const todayEnd = new Date(todayStart.getTime() + 86400000 - 1)

  const [upcomingGames, tonightGames, myWatchEvents] = await Promise.all([
    db.game.findMany({
      where: {
        OR: [
          { homeTeamId: { in: favoriteTeamIds } },
          { awayTeamId: { in: favoriteTeamIds } },
        ],
        startTime: { gte: now },
        isCompleted: false,
      },
      include: { homeTeam: true, awayTeam: true, league: true },
      orderBy: { startTime: "asc" },
      take: 10,
    }),
    db.game.findMany({
      where: {
        OR: [
          { homeTeamId: { in: favoriteTeamIds } },
          { awayTeamId: { in: favoriteTeamIds } },
        ],
        startTime: { gte: todayStart, lte: todayEnd },
        isCompleted: false,
      },
      include: { homeTeam: true, awayTeam: true, league: true },
      orderBy: { startTime: "asc" },
    }),
    db.watchEvent.findMany({
      where: {
        OR: [
          { createdById: session.user.id },
          {
            attendees: {
              some: { userId: session.user.id, status: { in: ["GOING", "INTERESTED"] } },
            },
          },
        ],
        game: { startTime: { gte: now }, isCompleted: false },
      },
      include: {
        game: { include: { homeTeam: true, awayTeam: true } },
        venue: { select: { name: true, slug: true } },
      },
      orderBy: { game: { startTime: "asc" } },
      take: 5,
    }),
  ])

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Favorite teams bar */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">My Teams</h2>
          <Link
            href="/teams"
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Edit →
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {favoriteTeams.map(({ team }) => (
            <div
              key={team.id}
              className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={team.logoUrl ?? ""}
                alt={`${team.city} ${team.name}`}
                className="h-5 w-5 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {team.city} {team.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Watch Tonight */}
      {tonightGames.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
            Watch Tonight
          </h2>
          <div className="space-y-2">
            {tonightGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {game.awayTeam.city} {game.awayTeam.name} @{" "}
                    {game.homeTeam.city} {game.homeTeam.name}
                  </p>
                  <p className="text-sm text-neutral-500">{game.league.name}</p>
                </div>
                <p className="text-sm text-neutral-500">{formatGameTime(game.startTime)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Games */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
          Upcoming Games
        </h2>
        {upcomingGames.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No upcoming games found. Games will appear here once the schedule is updated.
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {game.awayTeam.city} {game.awayTeam.name} @{" "}
                    {game.homeTeam.city} {game.homeTeam.name}
                  </p>
                  <p className="text-sm text-neutral-500">{game.league.name}</p>
                </div>
                <p className="text-sm text-neutral-500">{formatGameTime(game.startTime)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Watch Events */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
          My Watch Events
        </h2>
        {myWatchEvents.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No upcoming watch events.{" "}
            <Link href="/search" className="text-blue-600 hover:underline">
              Browse venues
            </Link>{" "}
            to find one or host your own.
          </p>
        ) : (
          <div className="space-y-2">
            {myWatchEvents.map((we) => (
              <Link
                key={we.id}
                href={`/watch-events/${we.id}`}
                className="block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
              >
                <p className="font-medium text-neutral-900 dark:text-white">
                  {we.title ??
                    `${we.game.awayTeam.city} ${we.game.awayTeam.name} @ ${we.game.homeTeam.city} ${we.game.homeTeam.name}`}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  at{" "}
                  <span className="text-blue-600 dark:text-blue-400">{we.venue.name}</span>
                  {" · "}
                  {formatGameTime(we.game.startTime)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Nearby Venues */}
      <NearbyVenues teamIds={favoriteTeamIds} />
    </div>
  )
}
