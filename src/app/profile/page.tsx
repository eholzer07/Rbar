import { redirect } from "next/navigation"
import { auth, signOut } from "@/auth"
import { db } from "@/lib/db"
import { updateProfileAction } from "./actions"

const errorMessages: Record<string, string> = {
  "invalid-username": "Username must be 3–20 characters: lowercase letters, numbers, and underscores only.",
  "username-taken": "That username is already taken.",
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/signin")

  const { error, success } = await searchParams

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded border border-green-300 bg-green-50 text-green-700 text-sm">
          Profile updated.
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          {errorMessages[error] ?? "An error occurred. Please try again."}
        </div>
      )}

      <form action={updateProfileAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name ?? ""}
            className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={user.username ?? ""}
            placeholder="e.g. bears_fan_chicago"
            className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            3–20 characters. Lowercase letters, numbers, and underscores only.
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={user.bio ?? ""}
            className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div>
          <label htmlFor="homeCity" className="block text-sm font-medium mb-1">
            Home city
          </label>
          <input
            id="homeCity"
            name="homeCity"
            type="text"
            defaultValue={user.homeCity ?? ""}
            placeholder="e.g. Chicago, IL"
            className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
