import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import VenueSearch from "@/components/venue-search"

export default async function SearchPage() {
  const session = await auth()
  if (!session) redirect("/signin")

  const teams = await db.team.findMany({
    include: { league: { select: { shortName: true } } },
    orderBy: [{ sport: "asc" }, { city: "asc" }],
  })

  return (
    <div className="h-[calc(100vh-4rem)]">
      <VenueSearch teams={teams} />
    </div>
  )
}
