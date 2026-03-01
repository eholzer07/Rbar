"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")
  return session.user.id
}

export async function approveClaimAction(claimId: string, _formData: FormData) {
  const adminId = await requireAdmin()

  const claim = await db.venueOwnerClaim.findUnique({
    where: { id: claimId },
    select: { venueId: true, userId: true, status: true },
  })
  if (!claim || claim.status !== "PENDING") {
    revalidatePath("/admin/claims")
    return
  }

  await db.$transaction([
    db.venue.update({ where: { id: claim.venueId }, data: { ownerId: claim.userId } }),
    db.venueOwnerClaim.update({
      where: { id: claimId },
      data: { status: "APPROVED", reviewedById: adminId, reviewedAt: new Date() },
    }),
  ])

  revalidatePath("/admin/claims")
}

export async function rejectClaimAction(claimId: string, _formData: FormData) {
  const adminId = await requireAdmin()
  const reason = (_formData.get("reason") as string)?.trim() || null

  await db.venueOwnerClaim.update({
    where: { id: claimId },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
  })

  revalidatePath("/admin/claims")
}
