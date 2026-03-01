import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

type SearchVenueRow = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  lat: number
  lng: number
  distance: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const latStr = searchParams.get("lat")
  const lngStr = searchParams.get("lng")
  const radiusStr = searchParams.get("radius") ?? "40234"
  const teamId = searchParams.get("teamId")

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 })
  }

  const lat = parseFloat(latStr)
  const lng = parseFloat(lngStr)
  const radius = parseFloat(radiusStr)

  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    return NextResponse.json({ error: "Invalid numeric parameters" }, { status: 400 })
  }

  let rows: SearchVenueRow[]

  if (teamId) {
    rows = await db.$queryRaw<SearchVenueRow[]>(Prisma.sql`
      SELECT DISTINCT ON (v.id)
        v.id, v.name, v.slug, v.address, v.city, v.state,
        v.lat::float8, v.lng::float8,
        ST_Distance(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS distance
      FROM "Venue" v
      JOIN "VenueTeam" vt ON vt."venueId" = v.id
      WHERE vt."teamId" = ${teamId}::uuid
        AND v.status = 'ACTIVE'
        AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})
      ORDER BY v.id, distance
      LIMIT 20
    `)
  } else {
    rows = await db.$queryRaw<SearchVenueRow[]>(Prisma.sql`
      SELECT DISTINCT ON (v.id)
        v.id, v.name, v.slug, v.address, v.city, v.state,
        v.lat::float8, v.lng::float8,
        ST_Distance(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) AS distance
      FROM "Venue" v
      WHERE v.status = 'ACTIVE'
        AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radius})
      ORDER BY v.id, distance
      LIMIT 20
    `)
  }

  const venueIds = rows.map((r) => r.id)

  const [venueTeams, ratings] = await Promise.all([
    db.venueTeam.findMany({
      where: { venueId: { in: venueIds } },
      include: {
        team: {
          select: { id: true, name: true, city: true, abbreviation: true, sport: true },
        },
      },
    }),
    db.review.groupBy({
      by: ["venueId"],
      where: { venueId: { in: venueIds } },
      _avg: { overallRating: true },
      _count: { overallRating: true },
    }),
  ])

  const teamsByVenue = new Map<string, typeof venueTeams>()
  for (const vt of venueTeams) {
    const existing = teamsByVenue.get(vt.venueId) ?? []
    existing.push(vt)
    teamsByVenue.set(vt.venueId, existing)
  }

  const ratingByVenue = new Map(ratings.map((r) => [r.venueId, r]))

  const venues = rows
    .sort((a, b) => Number(a.distance) - Number(b.distance))
    .map((v) => {
      const vts = teamsByVenue.get(v.id) ?? []
      const rating = ratingByVenue.get(v.id)
      return {
        id: v.id,
        name: v.name,
        slug: v.slug,
        address: v.address,
        city: v.city,
        state: v.state,
        lat: Number(v.lat),
        lng: Number(v.lng),
        distance: Math.round((Number(v.distance) / 1609.344) * 10) / 10,
        teams: vts.map((vt) => vt.team),
        avgRating: rating?._avg.overallRating ?? null,
        reviewCount: rating?._count.overallRating ?? 0,
      }
    })

  return NextResponse.json({ venues })
}
