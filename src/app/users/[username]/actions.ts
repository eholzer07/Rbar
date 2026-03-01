"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function followAction(targetUserId: string, username: string, _formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || session.user.id === targetUserId) return

  await db.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    create: { followerId: session.user.id, followingId: targetUserId },
    update: {},
  })

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
