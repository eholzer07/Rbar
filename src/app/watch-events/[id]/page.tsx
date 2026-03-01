import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { rsvpAction, checkInAction } from "./actions"

type Props = { params: Promise<{ id: string }> }

export default async function WatchEventPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const event = await db.watchEvent.findUnique({
    where: { id },
    include: {
      game: { include: { homeTeam: true, awayTeam: true, league: true } },
      venue: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { name: true } },
      attendees: {
        where: { status: { in: ["GOING", "INTERESTED"] } },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!event) notFound()
  if (event.visibility === "PRIVATE" && event.createdById !== session?.user?.id) notFound()

  const myAttendance = session?.user?.id
    ? await db.watchEventAttendee.findUnique({
        where: { watchEventId_userId: { watchEventId: event.id, userId: session.user.id } },
      })
    : null

  const now = new Date()
  const windowStart = new Date(event.game.startTime.getTime() - 30 * 60 * 1000)
  const windowEnd = new Date(event.game.startTime.getTime() + 4 * 60 * 60 * 1000)
  const inGameWindow = now >= windowStart && now <= windowEnd
  const gameOver = now > windowEnd

  const existingReview =
    session?.user?.id && myAttendance?.checkedInAt && gameOver
      ? await db.review.findFirst({
          where: {
            venueId: event.venue.id,
            userId: session.user.id,
            gameId: event.gameId,
          },
        })
      : null

  const boundRsvpGoing = rsvpAction.bind(null, event.id, "GOING")
  const boundRsvpInterested = rsvpAction.bind(null, event.id, "INTERESTED")
  const boundRsvpNotGoing = rsvpAction.bind(null, event.id, "NOT_GOING")
  const boundCheckIn = checkInAction.bind(null, event.id)

  const goingList = event.attendees.filter((a) => a.status === "GOING")
  const interestedList = event.attendees.filter((a) => a.status === "INTERESTED")

  const eventTitle =
    event.title ??
    `${event.game.awayTeam.city} ${event.game.awayTeam.name} @ ${event.game.homeTeam.city} ${event.game.homeTeam.name}`

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
          {event.game.league.shortName}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{eventTitle}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {new Date(event.game.startTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        {event.description && (
          <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">{event.description}</p>
        )}
      </div>

      {/* Venue + Host */}
      <div className="mb-6 rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-neutral-500">
            Venue:{" "}
            <Link
              href={`/venues/${event.venue.slug}`}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              {event.venue.name}
            </Link>
          </div>
          <div className="text-sm text-neutral-500">
            Hosted by:{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {event.createdBy.name ?? "Anonymous"}
            </span>
          </div>
          {event.visibility === "PRIVATE" && (
            <div className="mt-1 inline-flex w-fit items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              Private event
            </div>
          )}
        </div>
      </div>

      {/* RSVP */}
      {session?.user?.id && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Your RSVP
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={boundRsvpGoing}>
              <button
                type="submit"
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  myAttendance?.status === "GOING"
                    ? "bg-green-600 text-white"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                Going
              </button>
            </form>
            <form action={boundRsvpInterested}>
              <button
                type="submit"
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  myAttendance?.status === "INTERESTED"
                    ? "bg-yellow-500 text-white"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                Interested
              </button>
            </form>
            <form action={boundRsvpNotGoing}>
              <button
                type="submit"
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  myAttendance?.status === "NOT_GOING"
                    ? "bg-neutral-600 text-white"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                }`}
              >
                Not Going
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Check-in */}
      {session?.user?.id &&
        myAttendance?.status === "GOING" &&
        inGameWindow &&
        !myAttendance.checkedInAt && (
          <div className="mb-6">
            <form action={boundCheckIn}>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Check In
              </button>
            </form>
            <p className="mt-1 text-xs text-neutral-400">You&apos;re at the venue? Check in now!</p>
          </div>
        )}
      {myAttendance?.checkedInAt && (
        <div className="mb-6 rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
          Checked in at{" "}
          {new Date(myAttendance.checkedInAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      )}

      {/* Attendees */}
      <div className="mb-8 space-y-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Going ({goingList.length})
          </h2>
          {goingList.length === 0 ? (
            <p className="text-sm text-neutral-400">No one yet — be the first!</p>
          ) : (
            <ul className="space-y-1">
              {goingList.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <span>{a.user.name ?? "Anonymous"}</span>
                  {a.checkedInAt && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                      Checked in
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {interestedList.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Interested ({interestedList.length})
            </h2>
            <ul className="space-y-1">
              {interestedList.map((a) => (
                <li key={a.id} className="text-sm text-neutral-700 dark:text-neutral-300">
                  {a.user.name ?? "Anonymous"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Post-game review prompt */}
      {myAttendance?.checkedInAt && gameOver && (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            How was your experience at {event.venue.name}?
          </p>
          {existingReview ? (
            <p className="mt-1 text-sm text-neutral-500">
              You already left a review.{" "}
              <Link
                href={`/review?venueId=${event.venue.id}&gameId=${event.gameId}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Update it →
              </Link>
            </p>
          ) : (
            <Link
              href={`/review?venueId=${event.venue.id}&gameId=${event.gameId}`}
              className="mt-2 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Leave a Review →
            </Link>
          )}
        </div>
      )}

      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <Link
          href={`/venues/${event.venue.slug}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to {event.venue.name}
        </Link>
      </div>
    </div>
  )
}
