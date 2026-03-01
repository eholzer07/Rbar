import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import TeamBrowser from "@/components/team-browser"

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const favoriteCount = await db.userFavoriteTeam.count({
    where: { userId: session.user.id },
  })
  if (favoriteCount > 0) redirect("/")

  const [teams, userFavorites] = await Promise.all([
    db.team.findMany({
      include: { league: true },
      orderBy: [{ sport: "asc" }, { city: "asc" }],
    }),
    db.userFavoriteTeam.findMany({
      where: { userId: session.user.id },
      select: { teamId: true },
    }),
  ])

  const favoriteIds = new Set(userFavorites.map((f) => f.teamId))
  const teamsWithFavorites = teams.map((t) => ({ ...t, isFavorite: favoriteIds.has(t.id) }))

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Pick your teams</h1>
        <p className="mt-1 text-sm text-neutral-500">
          We&apos;ll show you their upcoming games and nearby venues.
        </p>
      </div>
      <TeamBrowser teams={teamsWithFavorites} onboarding={true} />
    </div>
  )
}
