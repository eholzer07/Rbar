"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { geocodeAddress } from "@/lib/geocoding"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")
  return session.user.id
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

async function uniqueSlug(name: string): Promise<string> {
  const base = generateSlug(name)
  let slug = base
  let n = 1
  while (await db.venue.findUnique({ where: { slug } })) slug = `${base}-${n++}`
  return slug
}

export async function approveRecommendationAction(recId: string, _formData: FormData) {
  const adminId = await requireAdmin()

  const rec = await db.venueRecommendation.findUnique({ where: { id: recId } })
  if (!rec || rec.status !== "PENDING") {
    revalidatePath("/admin/recommendations")
    return
  }

  const geo = await geocodeAddress(rec.address, rec.city, rec.state)
  if (!geo) {
    redirect(`/admin/recommendations?error=geocode&rec=${recId}`)
  }

  const slug = await uniqueSlug(rec.name)

  const venue = await db.venue.create({
    data: {
      name: rec.name,
      slug,
      address: rec.address,
      city: rec.city,
      state: rec.state,
      phone: rec.phone ?? undefined,
      website: rec.website ?? undefined,
      description: rec.description ?? undefined,
      lat: geo.lat,
      lng: geo.lng,
      status: "ACTIVE",
    },
  })

  await db.venueRecommendation.update({
    where: { id: recId },
    data: {
      status: "APPROVED",
      approvedVenueId: venue.id,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
  })

  revalidatePath("/admin/recommendations")
}

export async function rejectRecommendationAction(recId: string, _formData: FormData) {
  const adminId = await requireAdmin()
  const reason = (_formData.get("reason") as string)?.trim() || null

  await db.venueRecommendation.update({
    where: { id: recId },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
  })

  revalidatePath("/admin/recommendations")
}
