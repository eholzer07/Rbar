import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function FeedPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const following = await db.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  })
  const followingIds = following.map((f) => f.followingId)

  const now = new Date()

  const feedEvents =
    followingIds.length > 0
      ? await db.watchEvent.findMany({
          where: {
            visibility: "PUBLIC",
            game: { startTime: { gte: now }, isCompleted: false },
            OR: [
              { createdById: { in: followingIds } },
              { attendees: { some: { userId: { in: followingIds }, status: "GOING" } } },
            ],
          },
          include: {
            game: { include: { homeTeam: true, awayTeam: true, league: true } },
            venue: { select: { name: true, slug: true } },
            createdBy: { select: { name: true, username: true } },
            attendees: {
              where: { userId: { in: followingIds }, status: "GOING" },
              include: { user: { select: { name: true, username: true } } },
            },
          },
          orderBy: { game: { startTime: "asc" } },
          take: 30,
        })
      : []

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
        Friends&apos; Activity
      </h1>

      {followingIds.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 p-8 text-center dark:border-neutral-700">
          <p className="text-neutral-500">You&apos;re not following anyone yet.</p>
          <p className="mt-1 text-sm text-neutral-400">
            Find fans by visiting venue watch events or searching.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Browse Venues
          </Link>
        </div>
      ) : feedEvents.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No upcoming watch events from people you follow. Check back closer to game day!
        </p>
      ) : (
        <ul className="space-y-3">
          {feedEvents.map((we) => {
            const goingFriends = we.attendees.map((a) => a.user)
            const isHostedByFriend = followingIds.includes(we.createdById)

            return (
              <li key={we.id}>
                <Link
                  href={`/watch-events/${we.id}`}
                  className="block rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
                >
                  {/* Who's involved */}
                  <p className="mb-1.5 text-xs text-neutral-500">
                    {isHostedByFriend && (
                      <span>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {we.createdBy.name ?? we.createdBy.username ?? "Someone"}
                        </span>{" "}
                        is hosting
                        {goingFriends.length > 0 && " · "}
                      </span>
                    )}
                    {goingFriends.length > 0 && (
                      <span>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {goingFriends
                            .slice(0, 2)
                            .map((u) => u.name ?? u.username ?? "Someone")
                            .join(", ")}
                          {goingFriends.length > 2 && ` +${goingFriends.length - 2} more`}
                        </span>{" "}
                        {goingFriends.length === 1 ? "is" : "are"} going
                      </span>
                    )}
                  </p>

                  {/* Event title */}
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {we.title ??
                      `${we.game.awayTeam.city} ${we.game.awayTeam.name} @ ${we.game.homeTeam.city} ${we.game.homeTeam.name}`}
                  </p>

                  {/* Details */}
                  <p className="mt-0.5 text-sm text-neutral-500">
                    <span className="text-blue-600 dark:text-blue-400">{we.venue.name}</span>
                    {" · "}
                    {new Date(we.game.startTime).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {we.game.league.shortName}
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
