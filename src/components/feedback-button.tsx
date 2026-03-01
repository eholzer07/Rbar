import { auth } from "@/auth"
import Link from "next/link"

export default async function FeedbackButton() {
  const session = await auth()
  if (!session?.user?.id) return null

  return (
    <Link
      href="/feedback"
      title="Send feedback"
      className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 shadow-md hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
    >
      ?
    </Link>
  )
}
