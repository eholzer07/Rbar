import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { submitClaimAction } from "./actions"

type Props = { params: Promise<{ venueId: string }>; searchParams: Promise<{ success?: string; error?: string }> }

export default async function ClaimVenuePage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const { venueId } = await params
  const { success, error } = await searchParams

  const venue = await db.venue.findUnique({
    where: { id: venueId },
    select: { id: true, name: true, slug: true, ownerId: true },
  })
  if (!venue) notFound()

  const existingClaim = await db.venueOwnerClaim.findFirst({
    where: { venueId: venue.id, userId: session.user.id, status: "PENDING" },
  })

  const boundAction = submitClaimAction.bind(null, venue.id)

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold text-neutral-900 dark:text-white">Claim This Venue</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        <Link href={`/venues/${venue.slug}`} className="text-blue-600 hover:underline">
          {venue.name}
        </Link>
      </p>

      {success === "true" && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          Your claim has been submitted. We&apos;ll review it and get back to you.
          <div className="mt-2">
            <Link href={`/venues/${venue.slug}`} className="font-medium underline">
              Back to venue
            </Link>
          </div>
        </div>
      )}

      {error === "not-found" && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          Venue not found.
        </div>
      )}

      {error === "already-owner" && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          You already own this venue.
        </div>
      )}

      {error === "already-pending" && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
          You already have a pending claim for this venue.
        </div>
      )}

      {success !== "true" && venue.ownerId === session.user.id && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">You already own this venue.</p>
          <Link href={`/venues/${venue.slug}`} className="mt-2 block text-sm text-blue-600 hover:underline">
            Back to venue
          </Link>
        </div>
      )}

      {success !== "true" && venue.ownerId !== session.user.id && existingClaim && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">Your claim is currently under review.</p>
          <Link href={`/venues/${venue.slug}`} className="mt-2 block text-sm text-blue-600 hover:underline">
            Back to venue
          </Link>
        </div>
      )}

      {success !== "true" && venue.ownerId !== session.user.id && !existingClaim && (
        <form action={boundAction} className="space-y-5">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Are you the owner or manager of <strong>{venue.name}</strong>? Submit a claim and our team will
            verify it.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Message (optional)
            </label>
            <textarea
              name="message"
              rows={4}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder="Tell us a bit about your connection to this venue..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Claim
          </button>

          <div>
            <Link href={`/venues/${venue.slug}`} className="text-sm text-neutral-500 hover:underline">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
