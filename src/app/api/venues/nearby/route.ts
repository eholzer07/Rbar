import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

type NearbyVenueRow = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  distance: number
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const latStr = searchParams.get("lat")
  const lngStr = searchParams.get("lng")
  const teamIdsStr = searchParams.get("teamIds")
  const radiusStr = searchParams.get("radius") ?? "40234"

  if (!latStr || !lngStr || !teamIdsStr) {
    return NextResponse.json({ error: "lat, lng, and teamIds are required" }, { status: 400 })
  }

  const latNum = parseFloat(latStr)
  const lngNum = parseFloat(lngStr)
  const radiusNum = parseFloat(radiusStr)

  if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
    return NextResponse.json({ error: "Invalid numeric parameters" }, { status: 400 })
  }

  const teamIdsArray = teamIdsStr
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  if (teamIdsArray.length === 0) {
    return NextResponse.json({ venues: [] })
  }

  const rows = await db.$queryRaw<NearbyVenueRow[]>(Prisma.sql`
    SELECT DISTINCT ON (v.id)
      v.id, v.name, v.slug, v.address, v.city, v.state,
      ST_Distance(v.location, ST_SetSRID(ST_MakePoint(${lngNum}, ${latNum}), 4326)::geography) AS distance
    FROM "Venue" v
    JOIN "VenueTeam" vt ON vt."venueId" = v.id
    WHERE vt."teamId" = ANY(${teamIdsArray}::uuid[])
      AND v.status = 'ACTIVE'
      AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lngNum}, ${latNum}), 4326)::geography, ${radiusNum})
    ORDER BY v.id, distance
    LIMIT 10
  `)

  const venues = rows
    .sort((a, b) => Number(a.distance) - Number(b.distance))
    .map((v) => ({
      ...v,
      distance: Math.round((Number(v.distance) / 1609.344) * 10) / 10,
    }))

  return NextResponse.json({ venues })
}
