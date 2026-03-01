"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export async function submitRecommendationAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const name = (formData.get("name") as string)?.trim()
  const address = (formData.get("address") as string)?.trim()
  const city = (formData.get("city") as string)?.trim()
  const state = (formData.get("state") as string)?.trim()
  const phone = (formData.get("phone") as string)?.trim() || null
  const website = (formData.get("website") as string)?.trim() || null
  const description = (formData.get("description") as string)?.trim() || null
  const teamIds = formData.getAll("teamIds") as string[]

  if (!name || !address || !city || !state) redirect("/recommend-venue?error=missing-fields")

  await db.$transaction(async (tx) => {
    const rec = await tx.venueRecommendation.create({
      data: { name, address, city, state, phone, website, description, submittedById: session.user.id },
    })
    if (teamIds.length > 0) {
      await tx.venueRecommendationTeam.createMany({
        data: teamIds.map((teamId) => ({ recommendationId: rec.id, teamId })),
        skipDuplicates: true,
      })
    }
  })

  redirect("/recommend-venue?success=true")
}
