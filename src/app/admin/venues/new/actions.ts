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

export async function createVenueAction(formData: FormData) {
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

  if (!name || !address || !city || !state) {
    redirect("/admin/venues/new?error=missing-fields")
  }

  const geo = await geocodeAddress(address, city, state)
  if (!geo) {
    redirect("/admin/venues/new?error=geocode")
  }

  const slug = await uniqueSlug(name)

  await db.venue.create({
    data: { name, slug, address, city, state, zip, phone, website, description, status, lat: geo.lat, lng: geo.lng },
  })

  revalidatePath("/admin/venues")
  redirect("/admin/venues")
}
