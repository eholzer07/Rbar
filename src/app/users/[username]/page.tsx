import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { followAction, unfollowAction } from "./actions"

type Props = { params: Promise<{ username: string }> }

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params
  const session = await auth()

  const profile = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      homeCity: true,
      avatarUrl: true,
      createdAt: true,
      favoriteTeams: {
        include: { team: { include: { league: true } } },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { followers: true, following: true },
      },
    },
  })

  if (!profile) notFound()

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const isOwnProfile = session?.user?.id === profile.id

  const [isFollowing, upcomingEvents, recentCheckIns] = await Promise.all([
    session?.user?.id && !isOwnProfile
      ? db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: profile.id,
            },
          },
        })
      : Promise.resolve(null),
    db.watchEvent.findMany({
      where: {
        attendees: { some: { userId: profile.id, status: { in: ["GOING", "INTERESTED"] } } },
        game: { startTime: { gte: now }, isCompleted: false },
        ...(isOwnProfile ? {} : { visibility: "PUBLIC" }),
      },
      include: {
        game: { include: { homeTeam: true, awayTeam: true, league: true } },
        venue: { select: { name: true, slug: true } },
        attendees: { where: { userId: profile.id } },
      },
      orderBy: { game: { startTime: "asc" } },
      take: 5,
    }),
    db.watchEventAttendee.findMany({
      where: {
        userId: profile.id,
        checkedInAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        watchEvent: {
          include: {
            game: { include: { homeTeam: true, awayTeam: true } },
            venue: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { checkedInAt: "desc" },
      take: 5,
    }),
  ])

  const boundFollow = session?.user?.id
    ? followAction.bind(null, profile.id, profile.username!)
    : null
  const boundUnfollow = session?.user?.id
    ? unfollowAction.bind(null, profile.id, profile.username!)
    : null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Profile header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-2xl font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
          {profile.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            {profile.name ?? profile.username}
          </h1>
          <p className="text-sm text-neutral-500">@{profile.username}</p>
          {profile.homeCity && (
            <p className="mt-0.5 text-sm text-neutral-500">{profile.homeCity}</p>
          )}
          {profile.bio && (
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{profile.bio}</p>
          )}
          <div className="mt-2 flex gap-4 text-sm text-neutral-500">
            <span>
              <strong className="text-neutral-900 dark:text-white">
                {profile._count.followers}
              </strong>{" "}
              followers
            </span>
            <span>
              <strong className="text-neutral-900 dark:text-white">
                {profile._count.following}
              </strong>{" "}
              following
            </span>
          </div>
        </div>
        {/* Follow / Unfollow button */}
        {session?.user?.id && !isOwnProfile && (
          <div className="shrink-0">
            {isFollowing ? (
              <form action={boundUnfollow!}>
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  Unfollow
                </button>
              </form>
            ) : (
              <form action={boundFollow!}>
                <button
                  type="submit"
                  className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Follow
                </button>
              </form>
            )}
          </div>
        )}
        {isOwnProfile && (
          <Link
            href="/profile"
            className="shrink-0 rounded-md border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Edit Profile
          </Link>
        )}
      </div>

      {/* Favorite teams */}
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
          Favorite Teams
        </h2>
        {profile.favoriteTeams.length === 0 ? (
          <p className="text-sm text-neutral-400">No favorite teams yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile.favoriteTeams.map(({ team }) => (
              <div
                key={team.id}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {team.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={team.logoUrl} alt={team.name} className="h-4 w-4 object-contain" />
                )}
                <span className="text-sm text-neutral-800 dark:text-neutral-200">
                  {team.city} {team.name}
                </span>
                <span className="text-xs text-neutral-400">{team.league.shortName}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming watch events */}
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
          Upcoming Watch Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-neutral-400">No upcoming events</p>
        ) : (
          <ul className="space-y-2">
            {upcomingEvents.map((we) => {
              const myAttendance = we.attendees[0]
              return (
                <li key={we.id}>
                  <Link
                    href={`/watch-events/${we.id}`}
                    className="block rounded-lg border border-neutral-200 p-3 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                  >
                    <div className="text-sm font-medium text-neutral-900 dark:text-white">
                      {we.title ??
                        `${we.game.awayTeam.city} ${we.game.awayTeam.name} @ ${we.game.homeTeam.city} ${we.game.homeTeam.name}`}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {we.venue.name}
                      {" · "}
                      {new Date(we.game.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {myAttendance && (
                        <>
                          {" · "}
                          <span
                            className={
                              myAttendance.status === "GOING"
                                ? "text-green-600 dark:text-green-400"
                                : "text-yellow-600 dark:text-yellow-400"
                            }
                          >
                            {myAttendance.status === "GOING" ? "Going" : "Interested"}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Recent check-ins */}
      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-white">
          Recent Check-Ins
        </h2>
        {recentCheckIns.length === 0 ? (
          <p className="text-sm text-neutral-400">No recent check-ins</p>
        ) : (
          <ul className="space-y-2">
            {recentCheckIns.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/watch-events/${a.watchEventId}`}
                  className="block rounded-lg border border-neutral-200 p-3 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                >
                  <div className="text-sm font-medium text-neutral-900 dark:text-white">
                    {`${a.watchEvent.game.awayTeam.city} ${a.watchEvent.game.awayTeam.name} @ ${a.watchEvent.game.homeTeam.city} ${a.watchEvent.game.homeTeam.name}`}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {a.watchEvent.venue.name}
                    {" · Checked in "}
                    {new Date(a.checkedInAt!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
