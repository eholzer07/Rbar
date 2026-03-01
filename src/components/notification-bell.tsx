import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function NotificationBell() {
  const session = await auth()
  if (!session?.user?.id) return null

  const unreadCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  })

  return (
    <Link
      href="/notifications"
      className="relative flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
    >
      <span>Alerts</span>
      {unreadCount > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
