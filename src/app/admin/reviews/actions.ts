"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")
}

export async function deleteReviewAction(reviewId: string, _formData: FormData) {
  await requireAdmin()
  await db.review.delete({ where: { id: reviewId } })
  revalidatePath("/admin/reviews")
}
