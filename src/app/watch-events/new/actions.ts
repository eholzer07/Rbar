"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export async function createWatchEventAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const venueId = (formData.get("venueId") as string)?.trim()
  const gameId = (formData.get("gameId") as string)?.trim()
  const title = (formData.get("title") as string)?.trim() || null
  const description = (formData.get("description") as string)?.trim() || null
  const visibility = (formData.get("visibility") as string) === "PRIVATE" ? "PRIVATE" : "PUBLIC"

  if (!venueId || !gameId) redirect(`/watch-events/new?venueId=${venueId ?? ""}&error=missing-fields`)

  const event = await db.$transaction(async (tx) => {
    const ev = await tx.watchEvent.create({
      data: { venueId, gameId, createdById: session.user.id, title, description, visibility },
    })
    await tx.watchEventAttendee.create({
      data: { watchEventId: ev.id, userId: session.user.id, status: "GOING" },
    })
    return ev
  })

  redirect(`/watch-events/${event.id}`)
}
