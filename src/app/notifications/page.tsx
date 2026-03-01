import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  // Auto-mark all unread as read on visit
  const hasUnread = notifications.some((n) => !n.isRead)
  if (hasUnread) {
    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 p-8 text-center dark:border-neutral-700">
          <p className="text-neutral-500">No notifications yet.</p>
          <p className="mt-1 text-sm text-neutral-400">
            You&apos;ll be notified when someone follows you or RSVPs to your watch events.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id}>
              {n.referenceUrl ? (
                <Link
                  href={n.referenceUrl}
                  className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                >
                  <NotificationItem notification={n} wasUnread={!n.isRead} />
                </Link>
              ) : (
                <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
                  <NotificationItem notification={n} wasUnread={!n.isRead} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function NotificationItem({
  notification,
  wasUnread,
}: {
  notification: { title: string; body: string | null; createdAt: Date; type: string }
  wasUnread: boolean
}) {
  const typeIcon: Record<string, string> = {
    FOLLOW: "👤",
    WATCH_EVENT_RSVP: "✅",
  }

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-lg" aria-hidden>
        {typeIcon[notification.type] ?? "🔔"}
      </span>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${wasUnread ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}`}
        >
          {notification.title}
        </p>
        {notification.body && (
          <p className="mt-0.5 text-xs text-neutral-500 truncate">{notification.body}</p>
        )}
        <p className="mt-1 text-xs text-neutral-400">
          {new Date(notification.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
      {wasUnread && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-hidden />
      )}
    </div>
  )
}
