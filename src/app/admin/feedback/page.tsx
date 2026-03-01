import { db } from "@/lib/db"
import { updateFeedbackStatusAction, deleteFeedbackAction } from "./actions"

type Props = { searchParams: Promise<{ status?: string }> }

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  IN_PROGRESS: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  RESOLVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  WONT_FIX: "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400",
}

const TYPE_LABELS: Record<string, string> = {
  BUG_REPORT: "Bug",
  FEATURE_REQUEST: "Feature",
  GENERAL: "General",
}

export default async function AdminFeedbackPage({ searchParams }: Props) {
  const { status } = await searchParams
  const filter = status && ["OPEN", "IN_PROGRESS", "RESOLVED", "WONT_FIX"].includes(status) ? status : undefined

  const items = await db.feedback.findMany({
    where: filter ? { status: filter as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX" } : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Feedback</h1>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {[undefined, "OPEN", "IN_PROGRESS", "RESOLVED", "WONT_FIX"].map((s) => (
          <a
            key={s ?? "all"}
            href={s ? `/admin/feedback?status=${s}` : "/admin/feedback"}
            className={`rounded-full px-3 py-1 border ${(!filter && !s) || filter === s ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900" : "border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"}`}
          >
            {s ? s.replace("_", " ") : "All"}
          </a>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">No feedback found.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const boundUpdateStatus = updateFeedbackStatusAction.bind(null, item.id)
            const boundDelete = deleteFeedbackAction.bind(null, item.id)
            return (
              <li key={item.id} className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-700">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{item.body}</p>
                  </div>
                  <div className="text-right text-xs text-neutral-400 shrink-0">
                    <p>{item.user?.name ?? item.user?.email ?? "Anonymous"}</p>
                    <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <form action={boundUpdateStatus} className="flex items-center gap-2">
                    <select name="status" defaultValue={item.status} className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-600 dark:bg-neutral-800 dark:text-white">
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="WONT_FIX">Won&apos;t Fix</option>
                    </select>
                    <button type="submit" className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                      Update
                    </button>
                  </form>
                  <form action={boundDelete}>
                    <button type="submit" className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400">
                      Delete
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
