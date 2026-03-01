"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { RsvpStatus } from "@prisma/client"

export async function rsvpAction(watchEventId: string, status: RsvpStatus, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  await db.watchEventAttendee.upsert({
    where: { watchEventId_userId: { watchEventId, userId: session.user.id } },
    create: { watchEventId, userId: session.user.id, status },
    update: { status },
  })

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
