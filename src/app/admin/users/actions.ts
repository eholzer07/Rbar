"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")
  return session.user.id
}

export async function makeAdminAction(targetUserId: string, _formData: FormData) {
  const adminId = await requireAdmin()
  if (targetUserId === adminId) return // can't change own role
  await db.user.update({ where: { id: targetUserId }, data: { role: "ADMIN" } })
  revalidatePath("/admin/users")
}

export async function removeAdminAction(targetUserId: string, _formData: FormData) {
  const adminId = await requireAdmin()
  if (targetUserId === adminId) return // can't demote yourself
  await db.user.update({ where: { id: targetUserId }, data: { role: "USER" } })
  revalidatePath("/admin/users")
}

export async function deleteUserAction(targetUserId: string, _formData: FormData) {
  const adminId = await requireAdmin()
  if (targetUserId === adminId) return // can't delete yourself
  await db.user.delete({ where: { id: targetUserId } })
  revalidatePath("/admin/users")
}
