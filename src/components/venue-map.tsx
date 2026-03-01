"use client"
import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import markerIcon2xPng from "leaflet/dist/images/marker-icon-2x.png"
import markerShadowPng from "leaflet/dist/images/marker-shadow.png"
import type { VenueSearchResult } from "./venue-search"

type Props = {
  venues: VenueSearchResult[]
  center: [number, number]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function VenueMap({ venues, center, selectedId, onSelect }: Props) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: (markerIcon2xPng as { src: string }).src,
      iconUrl: (markerIconPng as { src: string }).src,
      shadowUrl: (markerShadowPng as { src: string }).src,
    })
  }, [])

  const selectedIcon = L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

  return (
    <MapContainer center={center} zoom={12} className="h-full w-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          position={[venue.lat, venue.lng]}
          icon={selectedId === venue.id ? selectedIcon : undefined}
          eventHandlers={{ click: () => onSelect(venue.id) }}
        >
          <Popup>
            <div className="text-sm">
              <Link
                href={`/venues/${venue.slug}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {venue.name}
              </Link>
              <div className="text-neutral-500">{venue.distance} mi away</div>
              {venue.teams.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {venue.teams.map((t) => (
                    <span
                      key={t.id}
                      className="rounded bg-neutral-100 px-1 py-0.5 text-xs text-neutral-700"
                    >
                      {t.abbreviation}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
