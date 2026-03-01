"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { geocodeAddress } from "@/lib/geocoding"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")
}

export async function updateVenueAction(venueId: string, formData: FormData) {
  await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  const address = (formData.get("address") as string)?.trim()
  const city = (formData.get("city") as string)?.trim()
  const state = (formData.get("state") as string)?.trim()
  const zip = (formData.get("zip") as string)?.trim() || null
  const phone = (formData.get("phone") as string)?.trim() || null
  const website = (formData.get("website") as string)?.trim() || null
  const description = (formData.get("description") as string)?.trim() || null
  const status = (formData.get("status") as string) === "INACTIVE" ? "INACTIVE" : "ACTIVE"
  const regeocode = formData.get("regeocode") === "1"

  if (!name || !address || !city || !state) {
    redirect(`/admin/venues/${venueId}/edit?error=missing-fields`)
  }

  const updateData: Record<string, unknown> = { name, address, city, state, zip, phone, website, description, status }

  if (regeocode) {
    const geo = await geocodeAddress(address, city, state)
    if (!geo) {
      redirect(`/admin/venues/${venueId}/edit?error=geocode`)
    }
    updateData.lat = geo.lat
    updateData.lng = geo.lng
  }

  await db.venue.update({ where: { id: venueId }, data: updateData })

  revalidatePath("/admin/venues")
  revalidatePath(`/admin/venues/${venueId}/edit`)
  redirect("/admin/venues")
}
