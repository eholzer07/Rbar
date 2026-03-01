"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function followAction(targetUserId: string, username: string, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.id === targetUserId) return

  // Check if already following (avoid duplicate notification)
  const existing = await db.follow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
  })

  await db.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    create: { followerId: session.user.id, followingId: targetUserId },
    update: {},
  })

  // Notify target user only on new follow
  if (!existing) {
    const follower = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, username: true },
    })
    await db.notification.create({
      data: {
        userId: targetUserId,
        type: "FOLLOW",
        title: `${follower?.name ?? "Someone"} started following you`,
        referenceUrl: follower?.username ? `/users/${follower.username}` : null,
      },
    })
  }

  revalidatePath(`/users/${username}`)
}

export async function unfollowAction(targetUserId: string, username: string, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return

  await db.follow.deleteMany({
    where: { followerId: session.user.id, followingId: targetUserId },
  })

  revalidatePath(`/users/${username}`)
}
