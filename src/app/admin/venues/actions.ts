"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")
}

export async function toggleVenueStatusAction(venueId: string, currentStatus: string, _formData: FormData) {
  await requireAdmin()
  const next = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
  await db.venue.update({ where: { id: venueId }, data: { status: next } })
  revalidatePath("/admin/venues")
}
