import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

const navLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/recommendations", label: "Recommendations" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/feedback", label: "Feedback" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-44 shrink-0 border-r border-neutral-200 bg-neutral-50 px-3 py-6 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
          Admin
        </p>
        <nav className="flex flex-col gap-0.5">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2 py-1.5 text-sm text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto px-8 py-6">{children}</main>
    </div>
  )
}
