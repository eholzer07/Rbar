"use client"

import { useEffect, useState } from "react"

type VenueResult = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  distance: number
}

type Status =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "loading" }
  | { kind: "loaded"; venues: VenueResult[] }
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "unsupported" }

export default function NearbyVenues({ teamIds }: { teamIds: string[] }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  const teamIdsKey = teamIds.join(",")

  useEffect(() => {
    if (teamIds.length === 0) return

    if (!("geolocation" in navigator)) {
      setStatus({ kind: "unsupported" })
      return
    }

    setStatus({ kind: "requesting" })
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus({ kind: "loading" })
        try {
          const params = new URLSearchParams({
            lat: String(pos.coords.latitude),
            lng: String(pos.coords.longitude),
            teamIds: teamIdsKey,
          })
          const res = await fetch(`/api/venues/nearby?${params}`)
          const data = await res.json()
          setStatus(
            data.venues.length > 0
              ? { kind: "loaded", venues: data.venues }
              : { kind: "empty" }
          )
        } catch {
          setStatus({ kind: "error", message: "Failed to load nearby venues." })
        }
      },
      () => setStatus({ kind: "error", message: "Enable location to see nearby venues." })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdsKey])

  if (teamIds.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
        Venues Near You
      </h2>

      {status.kind === "idle" && null}

      {status.kind === "requesting" && (
        <p className="text-sm text-neutral-500">Waiting for location permission…</p>
      )}

      {status.kind === "loading" && (
        <p className="text-sm text-neutral-500">Finding nearby venues…</p>
      )}

      {status.kind === "unsupported" && (
        <p className="text-sm text-neutral-500">
          Your browser doesn&apos;t support geolocation.
        </p>
      )}

      {status.kind === "error" && (
        <p className="text-sm text-neutral-500">{status.message}</p>
      )}

      {status.kind === "empty" && (
        <p className="text-sm text-neutral-500">
          No venues found near your location. More venues are coming soon!
        </p>
      )}

      {status.kind === "loaded" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {status.venues.map((venue) => (
            <div
              key={venue.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <p className="font-medium text-neutral-900 dark:text-white">{venue.name}</p>
              <p className="text-sm text-neutral-500">
                {venue.city}, {venue.state}
              </p>
              <p className="mt-1 text-xs text-neutral-400">{venue.distance} mi away</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
