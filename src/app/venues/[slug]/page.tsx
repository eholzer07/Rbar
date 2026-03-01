import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"

type Props = { params: Promise<{ slug: string }> }

export default async function VenuePage({ params }: Props) {
  const { slug } = await params

  const session = await auth()

  const venue = await db.venue.findUnique({
    where: { slug },
    include: {
      venueTeams: { include: { team: { include: { league: true } } } },
      photos: { take: 8 },
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  })

  if (!venue) notFound()

  const teamIds = venue.venueTeams.map((vt) => vt.teamId)

  const existingClaim = session?.user?.id
    ? await db.venueOwnerClaim.findFirst({
        where: { venueId: venue.id, userId: session.user.id, status: "PENDING" },
      })
    : null

  const [upcomingGames, reviewStats, watchEvents] = await Promise.all([
    db.game.findMany({
      where: {
        OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
        startTime: { gte: new Date() },
        isCompleted: false,
      },
      include: { homeTeam: true, awayTeam: true, league: true },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    db.review.aggregate({
      where: { venueId: venue.id },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    }),
    db.watchEvent.findMany({
      where: {
        venueId: venue.id,
        game: { startTime: { gte: new Date() } },
      },
      include: {
        game: { include: { homeTeam: true, awayTeam: true } },
        createdBy: { select: { name: true } },
      },
      take: 5,
    }),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{venue.name}</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          {venue.address}, {venue.city}, {venue.state}
          {venue.zip ? ` ${venue.zip}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
          {venue.phone && <span>{venue.phone}</span>}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Website
            </a>
          )}
        </div>
        {venue.description && (
          <p className="mt-3 text-neutral-700 dark:text-neutral-300">{venue.description}</p>
        )}
        <div className="mt-3">
          {session && venue.ownerId === session.user.id ? (
            <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
              You own this venue
            </span>
          ) : session && existingClaim ? (
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Claim pending review
            </span>
          ) : session && !venue.ownerId && !existingClaim ? (
            <Link
              href={`/claim-venue/${venue.id}`}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Claim this venue
            </Link>
          ) : null}
        </div>
      </div>

      {/* Supported Teams */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
          Supported Teams
        </h2>
        {venue.venueTeams.length === 0 ? (
          <p className="text-sm text-neutral-400">No teams listed yet</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {venue.venueTeams.map((vt) => (
              <div
                key={vt.id}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {vt.team.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={vt.team.logoUrl} alt={vt.team.name} className="h-5 w-5 object-contain" />
                )}
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {vt.team.city} {vt.team.name}
                </span>
                <span className="text-xs text-neutral-400">{vt.team.league.shortName}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rating Summary */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Rating</h2>
        {reviewStats._count.overallRating === 0 ? (
          <p className="text-sm text-neutral-400">No reviews yet</p>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-neutral-900 dark:text-white">
              {reviewStats._avg.overallRating?.toFixed(1)}
            </span>
            <div>
              <div className="text-yellow-500">★★★★★</div>
              <div className="text-sm text-neutral-500">
                {reviewStats._count.overallRating} review
                {reviewStats._count.overallRating !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Upcoming Games */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
          Upcoming Games
        </h2>
        {upcomingGames.length === 0 ? (
          <p className="text-sm text-neutral-400">No upcoming games found</p>
        ) : (
          <ul className="space-y-2">
            {upcomingGames.map((game) => (
              <li
                key={game.id}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                  {game.awayTeam.city} {game.awayTeam.name} @ {game.homeTeam.city}{" "}
                  {game.homeTeam.name}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {new Date(game.startTime).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {game.league.shortName}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Watch Events */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
          Watch Events
        </h2>
        {watchEvents.length === 0 ? (
          <p className="text-sm text-neutral-400">No watch events yet</p>
        ) : (
          <ul className="space-y-2">
            {watchEvents.map((we) => (
              <li
                key={we.id}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <Link href={`/watch-events/${we.id}`} className="block hover:opacity-80">
                  <div className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
                    {we.title ?? `${we.game.awayTeam.name} @ ${we.game.homeTeam.name}`}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    Hosted by {we.createdBy.name ?? "Anonymous"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {session && (
          <div className="mt-3">
            <Link
              href={`/watch-events/new?venueId=${venue.id}`}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              + Host a Watch Event
            </Link>
          </div>
        )}
      </section>

      {/* Photos */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Photos</h2>
        {venue.photos.length === 0 ? (
          <p className="text-sm text-neutral-400">No photos yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {venue.photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.caption ?? venue.name}
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Reviews */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Reviews
          </h2>
          {session && (
            <Link
              href={`/review?venueId=${venue.id}`}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Write a Review
            </Link>
          )}
        </div>
        {venue.reviews.length === 0 ? (
          <p className="text-sm text-neutral-400">No reviews yet. Be the first to leave one!</p>
        ) : (
          <ul className="space-y-3">
            {venue.reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {review.user.name ?? "Anonymous"}
                  </span>
                  <span className="text-sm text-yellow-500">
                    {"★".repeat(review.overallRating)}
                    {"☆".repeat(5 - review.overallRating)}
                  </span>
                </div>
                {/* Game/venue experience badges */}
                {(review.showedGame !== null || review.soundOn !== null || review.tvCount !== null) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {review.showedGame === true && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                        Showed the game
                      </span>
                    )}
                    {review.showedGame === false && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                        Didn&apos;t show game
                      </span>
                    )}
                    {review.soundOn === true && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Sound on
                      </span>
                    )}
                    {review.soundOn === false && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                        Muted
                      </span>
                    )}
                    {review.tvCount !== null && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                        {review.tvCount} TV{review.tvCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
                {/* Sub-ratings */}
                {(review.foodRating || review.drinkRating || review.valueRating) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
                    {review.foodRating && <span>Food: {review.foodRating}/5</span>}
                    {review.drinkRating && <span>Drinks: {review.drinkRating}/5</span>}
                    {review.valueRating && <span>Value: {review.valueRating}/5</span>}
                  </div>
                )}
                {review.comment && (
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {review.comment}
                  </p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <Link href="/search" className="text-sm text-blue-600 hover:underline">
          ← Back to search
        </Link>
      </div>
    </div>
  )
}
