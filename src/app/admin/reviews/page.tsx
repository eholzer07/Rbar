import { db } from "@/lib/db"
import Link from "next/link"
import { deleteReviewAction } from "./actions"

type Props = { searchParams: Promise<{ q?: string }> }

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { q } = await searchParams

  const reviews = await db.review.findMany({
    where: q
      ? { OR: [{ venue: { name: { contains: q, mode: "insensitive" } } }, { user: { email: { contains: q, mode: "insensitive" } } }] }
      : undefined,
    include: {
      venue: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Reviews</h1>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by venue or user…"
          className="w-72 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
        />
        <button type="submit" className="ml-2 rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700">
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Venue</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">User</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Rating</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Comment</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {reviews.map((r) => {
              const bound = deleteReviewAction.bind(null, r.id)
              return (
                <tr key={r.id} className="bg-white dark:bg-neutral-900">
                  <td className="px-4 py-3">
                    <Link href={`/venues/${r.venue.slug}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                      {r.venue.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {r.user.name ?? r.user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-neutral-900 dark:text-white">{r.overallRating}/5</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 max-w-xs truncate">
                    {r.comment ?? <span className="italic text-neutral-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <form action={bound}>
                      <button type="submit" className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="px-4 py-6 text-sm text-neutral-500">No reviews found.</p>
        )}
      </div>
    </div>
  )
}
