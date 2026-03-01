import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { submitReviewAction } from "./actions"

type Props = { searchParams: Promise<{ venueId?: string; gameId?: string; error?: string }> }

function RatingSelect({ name, label, defaultValue }: { name: string; label: string; defaultValue?: number | null }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label} <span className="text-neutral-400">(optional)</span>
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue?.toString() ?? ""}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
      >
        <option value="">—</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} — {["Poor", "Fair", "Good", "Great", "Excellent"][n - 1]}
          </option>
        ))}
      </select>
    </div>
  )
}

export default async function ReviewPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const { venueId, gameId, error } = await searchParams
  if (!venueId) redirect("/search")

  const venue = await db.venue.findUnique({
    where: { id: venueId },
    select: { id: true, name: true, slug: true },
  })
  if (!venue) notFound()

  const game = gameId
    ? await db.game.findUnique({
        where: { id: gameId },
        include: { homeTeam: true, awayTeam: true, league: true },
      })
    : null

  const existing = await db.review.findFirst({
    where: { venueId, userId: session.user.id, gameId: gameId ?? null },
  })

  const isUpdate = !!existing

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href={`/venues/${venue.slug}`} className="text-sm text-blue-600 hover:underline">
          ← Back to {venue.name}
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
          {isUpdate ? "Update your review" : "Leave a review"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {venue.name}
          {game && (
            <>
              {" · "}
              {game.awayTeam.city} {game.awayTeam.name} @ {game.homeTeam.city}{" "}
              {game.homeTeam.name}
              {" · "}
              {new Date(game.startTime).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </>
          )}
        </p>
      </div>

      {error === "invalid" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Please select an overall rating before submitting.
        </div>
      )}

      <form action={submitReviewAction} className="space-y-6">
        <input type="hidden" name="venueId" value={venue.id} />
        {game && <input type="hidden" name="gameId" value={game.id} />}

        {/* Overall rating — required */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Overall Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="flex cursor-pointer flex-col items-center gap-1">
                <input
                  type="radio"
                  name="overallRating"
                  value={n}
                  defaultChecked={existing?.overallRating === n}
                  required
                  className="sr-only"
                />
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                    existing?.overallRating === n
                      ? "border-yellow-500 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      : "border-neutral-300 bg-white text-neutral-600 hover:border-yellow-400 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {n}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Showed the game */}
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Did the venue show the game?
          </p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => {
              const label = val === "yes" ? "Yes" : "No"
              const isChecked =
                (val === "yes" && existing?.showedGame === true) ||
                (val === "no" && existing?.showedGame === false)
              return (
                <label key={val} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="showedGame"
                    value={val}
                    defaultChecked={isChecked}
                    className="accent-neutral-700"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* TV count */}
        <div>
          <label
            htmlFor="tvCount"
            className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            TVs showing the game <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="tvCount"
            name="tvCount"
            type="number"
            min="0"
            max="100"
            defaultValue={existing?.tvCount ?? ""}
            placeholder="e.g. 4"
            className="w-32 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        {/* Sound on */}
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Sound on? <span className="text-neutral-400">(optional)</span>
          </p>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((val) => {
              const label = val === "yes" ? "Yes" : "No"
              const isChecked =
                (val === "yes" && existing?.soundOn === true) ||
                (val === "no" && existing?.soundOn === false)
              return (
                <label key={val} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="soundOn"
                    value={val}
                    defaultChecked={isChecked}
                    className="accent-neutral-700"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Sub-ratings */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RatingSelect name="foodRating" label="Food Quality" defaultValue={existing?.foodRating} />
          <RatingSelect name="drinkRating" label="Drinks" defaultValue={existing?.drinkRating} />
          <RatingSelect name="valueRating" label="Value" defaultValue={existing?.valueRating} />
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor="comment"
            className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Comment <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            defaultValue={existing?.comment ?? ""}
            placeholder="What was your experience like?"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {isUpdate ? "Update Review" : "Submit Review"}
        </button>
      </form>
    </div>
  )
}
