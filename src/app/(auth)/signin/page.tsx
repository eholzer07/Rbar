import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { signInAction } from "./actions"

const errorMessages: Record<string, string> = {
  "missing-fields": "Please enter your email and password.",
  "invalid-credentials": "Invalid email or password.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect("/")

  const { error } = await searchParams

  return (
    <div className="w-full max-w-sm px-6">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          {errorMessages[error] ?? "An error occurred. Please try again."}
        </div>
      )}

      <form action={signInAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-3 py-2 rounded border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 rounded bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Sign in
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline hover:text-foreground">
          Sign up
        </Link>
      </p>
    </div>
  )
}
