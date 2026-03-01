"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export async function submitClaimAction(venueId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const message = (formData.get("message") as string)?.trim() || null

  const venue = await db.venue.findUnique({ where: { id: venueId }, select: { id: true, ownerId: true } })
  if (!venue) redirect(`/claim-venue/${venueId}?error=not-found`)
  if (venue.ownerId === session.user.id) redirect(`/claim-venue/${venueId}?error=already-owner`)

  const existing = await db.venueOwnerClaim.findFirst({
    where: { venueId, userId: session.user.id, status: "PENDING" },
  })
  if (existing) redirect(`/claim-venue/${venueId}?error=already-pending`)

  await db.venueOwnerClaim.create({
    data: { venueId, userId: session.user.id, message, status: "PENDING" },
  })

  redirect(`/claim-venue/${venueId}?success=true`)
}
