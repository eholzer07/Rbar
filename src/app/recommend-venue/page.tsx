import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { submitRecommendationAction } from "./actions"

type Props = { searchParams: Promise<{ success?: string; error?: string }> }

export default async function RecommendVenuePage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const { success, error } = await searchParams

  const teams = await db.team.findMany({
    include: { league: { select: { shortName: true } } },
    orderBy: [{ sport: "asc" }, { city: "asc" }],
  })

  // Group teams by sport
  const bySport: Record<string, typeof teams> = {}
  for (const team of teams) {
    if (!bySport[team.sport]) bySport[team.sport] = []
    bySport[team.sport].push(team)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">Recommend a Venue</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        Know a great sports bar we&apos;re missing? Submit it and our team will review it.
      </p>

      {success === "true" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          Your recommendation has been submitted. Our team will review it shortly.
        </div>
      )}

      {error === "missing-fields" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Please fill in all required fields.
        </div>
      )}

      {success !== "true" && (
        <form action={submitRecommendationAction} className="space-y-5">
          {/* Required fields */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder="e.g. McFadden's Saloon"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              name="address"
              type="text"
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                City <span className="text-red-500">*</span>
              </label>
              <input
                name="city"
                type="text"
                required
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                placeholder="Chicago"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                State <span className="text-red-500">*</span>
              </label>
              <input
                name="state"
                type="text"
                required
                maxLength={2}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                placeholder="IL"
              />
            </div>
          </div>

          {/* Optional fields */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Phone
            </label>
            <input
              name="phone"
              type="tel"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder="(312) 555-0100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Website
            </label>
            <input
              name="website"
              type="url"
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder="Tell us a bit about this venue..."
            />
          </div>

          {/* Teams */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Teams shown (optional)
            </p>
            <div className="space-y-2">
              {Object.entries(bySport).map(([sport, sportTeams]) => (
                <details key={sport} open className="rounded-md border border-neutral-200 dark:border-neutral-700">
                  <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {sport}
                  </summary>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-3 pb-3 pt-1 sm:grid-cols-3">
                    {sportTeams.map((team) => (
                      <label key={team.id} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <input
                          type="checkbox"
                          name="teamIds"
                          value={team.id}
                          className="h-4 w-4 rounded border-neutral-300 accent-blue-600"
                        />
                        <span>
                          {team.city} {team.name}
                          <span className="ml-1 text-xs text-neutral-400">({team.league.shortName})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Recommendation
          </button>
        </form>
      )}
    </div>
  )
}
