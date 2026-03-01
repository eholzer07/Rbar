"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")
}

export async function updateFeedbackStatusAction(feedbackId: string, formData: FormData) {
  await requireAdmin()
  const status = formData.get("status") as string
  if (!["OPEN", "IN_PROGRESS", "RESOLVED", "WONT_FIX"].includes(status)) return
  await db.feedback.update({
    where: { id: feedbackId },
    data: { status: status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "WONT_FIX" },
  })
  revalidatePath("/admin/feedback")
}

export async function deleteFeedbackAction(feedbackId: string, _formData: FormData) {
  await requireAdmin()
  await db.feedback.delete({ where: { id: feedbackId } })
  revalidatePath("/admin/feedback")
}
