import { db } from "@/lib/db"
import { approveRecommendationAction, rejectRecommendationAction } from "./actions"

type Props = { searchParams: Promise<{ error?: string; rec?: string }> }

export default async function AdminRecommendationsPage({ searchParams }: Props) {
  const { error, rec } = await searchParams

  const pending = await db.venueRecommendation.findMany({
    where: { status: "PENDING" },
    include: {
      submittedBy: { select: { name: true, email: true } },
      teams: { include: { team: { include: { league: true } } } },
    },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
        Venue Recommendations
        {pending.length > 0 && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            {pending.length} pending
          </span>
        )}
      </h1>

      {error === "geocode" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Geocoding failed for recommendation {rec}. Check the address and try again, or create the venue manually.
        </div>
      )}

      {pending.length === 0 ? (
        <p className="text-sm text-neutral-500">No pending recommendations.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map((r) => {
            const boundApprove = approveRecommendationAction.bind(null, r.id)
            const boundReject = rejectRecommendationAction.bind(null, r.id)
            return (
              <li key={r.id} className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-700">
                <div className="mb-3">
                  <p className="font-semibold text-neutral-900 dark:text-white">{r.name}</p>
                  <p className="text-sm text-neutral-500">
                    {r.address}, {r.city}, {r.state}
                  </p>
                  {r.phone && <p className="text-sm text-neutral-500">{r.phone}</p>}
                  {r.website && (
                    <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {r.website}
                    </a>
                  )}
                  {r.description && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{r.description}</p>}
                  {r.teams.length > 0 && (
                    <p className="mt-1 text-xs text-neutral-400">
                      Teams: {r.teams.map((t) => `${t.team.city} ${t.team.name}`).join(", ")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-neutral-400">
                    Submitted by {r.submittedBy?.name ?? r.submittedBy?.email ?? "Anonymous"} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={boundApprove}>
                    <button type="submit" className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                      Approve &amp; Create Venue
                    </button>
                  </form>
                  <form action={boundReject} className="flex gap-2">
                    <input
                      name="reason"
                      placeholder="Rejection reason (optional)"
                      className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                    />
                    <button type="submit" className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950">
                      Reject
                    </button>
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
