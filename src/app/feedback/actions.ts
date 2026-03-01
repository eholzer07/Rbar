"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

const RATE_LIMIT = 5
const WINDOW_MS = 24 * 60 * 60 * 1000

export async function submitFeedbackAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const type = formData.get("type") as string
  const title = (formData.get("title") as string)?.trim()
  const body = (formData.get("body") as string)?.trim()

  if (!type || !title || !body) {
    redirect("/feedback?error=missing-fields")
  }

  if (!["BUG_REPORT", "FEATURE_REQUEST", "GENERAL"].includes(type)) {
    redirect("/feedback?error=missing-fields")
  }

  // Rate limit: max 5 submissions per user per 24 hours
  const since = new Date(Date.now() - WINDOW_MS)
  const recentCount = await db.feedback.count({
    where: { userId: session.user.id, createdAt: { gte: since } },
  })
  if (recentCount >= RATE_LIMIT) {
    redirect("/feedback?error=rate-limit")
  }

  await db.feedback.create({
    data: {
      userId: session.user.id,
      type: type as "BUG_REPORT" | "FEATURE_REQUEST" | "GENERAL",
      title,
      body,
    },
  })

  redirect("/feedback?success=1")
}
