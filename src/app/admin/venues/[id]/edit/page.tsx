import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { updateVenueAction } from "./actions"

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }

export default async function AdminEditVenuePage({ params, searchParams }: Props) {
  const { id } = await params
  const { error } = await searchParams

  const venue = await db.venue.findUnique({
    where: { id },
    select: { id: true, name: true, address: true, city: true, state: true, zip: true, phone: true, website: true, description: true, status: true },
  })
  if (!venue) notFound()

  const bound = updateVenueAction.bind(null, venue.id)

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Edit Venue</h1>

      {error === "missing-fields" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Name, address, city, and state are required.
        </div>
      )}
      {error === "geocode" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          Geocoding failed. Uncheck &ldquo;Re-geocode&rdquo; to save without updating coordinates.
        </div>
      )}

      <form action={bound} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name *</label>
          <input name="name" required defaultValue={venue.name} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Address *</label>
          <input name="address" required defaultValue={venue.address} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">City *</label>
            <input name="city" required defaultValue={venue.city} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">State *</label>
            <input name="state" required maxLength={2} defaultValue={venue.state} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">ZIP</label>
          <input name="zip" defaultValue={venue.zip ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
          <input name="phone" type="tel" defaultValue={venue.phone ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Website</label>
          <input name="website" type="url" defaultValue={venue.website ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
          <textarea name="description" rows={3} defaultValue={venue.description ?? ""} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
          <select name="status" defaultValue={venue.status} className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="regeocode" value="1" id="regeocode" />
          <label htmlFor="regeocode" className="text-sm text-neutral-600 dark:text-neutral-400">
            Re-geocode address (updates lat/lng)
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
            Save Changes
          </button>
          <a href="/admin/venues" className="rounded-md border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
