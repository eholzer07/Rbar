import { db } from "@/lib/db"
import Link from "next/link"
import { approveClaimAction, rejectClaimAction } from "./actions"

export default async function AdminClaimsPage() {
  const pending = await db.venueOwnerClaim.findMany({
    where: { status: "PENDING" },
    include: {
      venue: { select: { id: true, name: true, slug: true, ownerId: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
        Venue Owner Claims
        {pending.length > 0 && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-sm font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            {pending.length} pending
          </span>
        )}
      </h1>

      {pending.length === 0 ? (
        <p className="text-sm text-neutral-500">No pending claims.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map((c) => {
            const boundApprove = approveClaimAction.bind(null, c.id)
            const boundReject = rejectClaimAction.bind(null, c.id)
            return (
              <li key={c.id} className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-700">
                <div className="mb-3">
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    <Link href={`/venues/${c.venue.slug}`} className="text-blue-600 hover:underline dark:text-blue-400">
                      {c.venue.name}
                    </Link>
                  </p>
                  {c.venue.ownerId && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">⚠ Venue already has an owner</p>
                  )}
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Claimed by {c.user.name ?? c.user.email}
                  </p>
                  {c.message && (
                    <p className="mt-1 text-sm text-neutral-500 italic">&ldquo;{c.message}&rdquo;</p>
                  )}
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={boundApprove}>
                    <button type="submit" className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                      Approve
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
