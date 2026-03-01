import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import TeamBrowser from "@/components/team-browser"

export default async function TeamsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

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
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">Your Teams</h1>
      <TeamBrowser teams={teamsWithFavorites} />
    </div>
  )
}
