import { NextRequest, NextResponse } from "next/server"
import { geocodeQuery } from "@/lib/geocoding"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")
  if (!q) return NextResponse.json({ error: "q is required" }, { status: 400 })
  const result = await geocodeQuery(q)
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(result)
}
