"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function toggleFavoriteAction(teamId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const existing = await db.userFavoriteTeam.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  })
  if (existing) {
    await db.userFavoriteTeam.delete({ where: { id: existing.id } })
  } else {
    await db.userFavoriteTeam.create({ data: { userId: session.user.id, teamId } })
  }
  revalidatePath("/")
  revalidatePath("/teams")
  revalidatePath("/onboarding")
}
