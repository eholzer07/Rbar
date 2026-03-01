import { db } from "@/lib/db"
import Link from "next/link"

export default async function AdminOverviewPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    userCount,
    venueCount,
    pendingRecs,
    pendingClaims,
    checkInsWeek,
    reviewsWeek,
    watchEventsTotal,
  ] = await Promise.all([
    db.user.count(),
    db.venue.count({ where: { status: "ACTIVE" } }),
    db.venueRecommendation.count({ where: { status: "PENDING" } }),
    db.venueOwnerClaim.count({ where: { status: "PENDING" } }),
    db.watchEventAttendee.count({ where: { checkedInAt: { not: null }, updatedAt: { gte: sevenDaysAgo } } }),
    db.review.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.watchEvent.count(),
  ])

  const stats = [
    { label: "Total Users", value: userCount, href: "/admin/users" },
    { label: "Active Venues", value: venueCount, href: "/admin/venues" },
    { label: "Pending Recommendations", value: pendingRecs, href: "/admin/recommendations", alert: pendingRecs > 0 },
    { label: "Pending Claims", value: pendingClaims, href: "/admin/claims", alert: pendingClaims > 0 },
    { label: "Check-ins (7d)", value: checkInsWeek, href: null },
    { label: "Reviews (7d)", value: reviewsWeek, href: "/admin/reviews" },
    { label: "Total Watch Events", value: watchEventsTotal, href: null },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-lg border p-4 ${s.alert ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950" : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"}`}
          >
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{s.value}</p>
            <p className="mt-1 text-xs text-neutral-500">{s.label}</p>
            {s.href && (
              <Link href={s.href} className="mt-2 block text-xs text-blue-600 hover:underline dark:text-blue-400">
                View →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
