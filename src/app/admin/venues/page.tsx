import { db } from "@/lib/db"
import Link from "next/link"
import { toggleVenueStatusAction } from "./actions"

type Props = { searchParams: Promise<{ q?: string }> }

export default async function AdminVenuesPage({ searchParams }: Props) {
  const { q } = await searchParams

  const venues = await db.venue.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, slug: true, city: true, state: true, status: true,
      _count: { select: { watchEvents: true, reviews: true } },
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Venues</h1>
        <Link
          href="/admin/venues/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          + Add Venue
        </Link>
      </div>

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or city…"
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
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Location</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-400">Events / Reviews</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {venues.map((v) => {
              const bound = toggleVenueStatusAction.bind(null, v.id, v.status)
              return (
                <tr key={v.id} className="bg-white dark:bg-neutral-900">
                  <td className="px-4 py-3">
                    <Link href={`/venues/${v.slug}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                      {v.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{v.city}, {v.state}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${v.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {v._count.watchEvents} events · {v._count.reviews} reviews
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/venues/${v.id}/edit`} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                        Edit
                      </Link>
                      <form action={bound}>
                        <button type="submit" className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                          {v.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {venues.length === 0 && (
          <p className="px-4 py-6 text-sm text-neutral-500">No venues found.</p>
        )}
      </div>
    </div>
  )
}
