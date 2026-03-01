"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export async function signInAction(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() || ""
  const password = (formData.get("password") as string | null) || ""

  if (!email || !password) {
    redirect("/signin?error=missing-fields")
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/signin?error=invalid-credentials")
    }
    throw error
  }
}
