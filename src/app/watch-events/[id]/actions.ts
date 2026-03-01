"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { RsvpStatus } from "@prisma/client"

export async function rsvpAction(watchEventId: string, status: RsvpStatus, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  // Check existing status before upsert (for notification dedup)
  const existing = await db.watchEventAttendee.findUnique({
    where: { watchEventId_userId: { watchEventId, userId: session.user.id } },
  })

  await db.watchEventAttendee.upsert({
    where: { watchEventId_userId: { watchEventId, userId: session.user.id } },
    create: { watchEventId, userId: session.user.id, status },
    update: { status },
  })

  // Notify event creator only when someone newly becomes GOING
  if (status === "GOING" && existing?.status !== "GOING") {
    const event = await db.watchEvent.findUnique({
      where: { id: watchEventId },
      include: { game: { include: { homeTeam: true, awayTeam: true } } },
    })
    if (event && event.createdById !== session.user.id) {
      const rsvper = await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      })
      await db.notification.create({
        data: {
          userId: event.createdById,
          type: "WATCH_EVENT_RSVP",
          title: `${rsvper?.name ?? "Someone"} is going to your watch event`,
          body: event.title ?? `${event.game.awayTeam.name} @ ${event.game.homeTeam.name}`,
          referenceUrl: `/watch-events/${watchEventId}`,
        },
      })
    }
  }

  revalidatePath(`/watch-events/${watchEventId}`)
}

export async function checkInAction(watchEventId: string, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const attendee = await db.watchEventAttendee.findUnique({
    where: { watchEventId_userId: { watchEventId, userId: session.user.id } },
    include: { watchEvent: { include: { game: true } } },
  })

  if (!attendee || attendee.status !== "GOING") {
    revalidatePath(`/watch-events/${watchEventId}`)
    return
  }

  const game = attendee.watchEvent.game
  const now = new Date()
  const windowStart = new Date(game.startTime.getTime() - 30 * 60 * 1000)
  const windowEnd = new Date(game.startTime.getTime() + 4 * 60 * 60 * 1000)

  if (now < windowStart || now > windowEnd) {
    revalidatePath(`/watch-events/${watchEventId}`)
    return
  }

  await db.watchEventAttendee.update({
    where: { watchEventId_userId: { watchEventId, userId: session.user.id } },
    data: { checkedInAt: now },
  })

  revalidatePath(`/watch-events/${watchEventId}`)
}
