"use server"

import { signIn } from "@/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function signUpAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() || null
  const emailRaw = (formData.get("email") as string | null)?.trim() || null
  const password = (formData.get("password") as string | null) || null

  if (!name || !emailRaw || !password) {
    redirect("/signup?error=missing-fields")
  }

  const email = emailRaw.toLowerCase()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect("/signup?error=invalid-email")
  }

  if (password.length < 8) {
    redirect("/signup?error=password-too-short")
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    redirect("/signup?error=email-taken")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      emailVerified: new Date(),
    },
  })

  await signIn("credentials", { email, password, redirectTo: "/" })
}
