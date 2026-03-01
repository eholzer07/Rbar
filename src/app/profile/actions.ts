"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const name = (formData.get("name") as string | null)?.trim() || null
  const username = (formData.get("username") as string | null)?.trim() || null
  const bio = (formData.get("bio") as string | null)?.trim() || null
  const homeCity = (formData.get("homeCity") as string | null)?.trim() || null

  if (username) {
    const usernameRegex = /^[a-z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      redirect("/profile?error=invalid-username")
    }

    const taken = await db.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
    })
    if (taken) {
      redirect("/profile?error=username-taken")
    }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name, username, bio, homeCity },
  })

  redirect("/profile?success=true")
}
