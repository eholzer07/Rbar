"use server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

export async function submitReviewAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect("/signin")

  const venueId = (formData.get("venueId") as string)?.trim()
  const gameId = (formData.get("gameId") as string)?.trim() || null
  const overallRatingVal = formData.get("overallRating") as string | null
  const overallRating = overallRatingVal ? parseInt(overallRatingVal, 10) : 0

  if (!venueId || overallRating < 1 || overallRating > 5) {
    redirect(`/review?venueId=${venueId ?? ""}&gameId=${gameId ?? ""}&error=invalid`)
  }

  const showedGameVal = formData.get("showedGame") as string | null
  const showedGame =
    showedGameVal === "yes" ? true : showedGameVal === "no" ? false : null

  const tvCountVal = formData.get("tvCount") as string | null
  const tvCount = tvCountVal && tvCountVal !== "" ? parseInt(tvCountVal, 10) : null

  const soundOnVal = formData.get("soundOn") as string | null
  const soundOn = soundOnVal === "yes" ? true : soundOnVal === "no" ? false : null

  const foodRatingVal = formData.get("foodRating") as string | null
  const foodRating = foodRatingVal && foodRatingVal !== "" ? parseInt(foodRatingVal, 10) : null

  const drinkRatingVal = formData.get("drinkRating") as string | null
  const drinkRating = drinkRatingVal && drinkRatingVal !== "" ? parseInt(drinkRatingVal, 10) : null

  const valueRatingVal = formData.get("valueRating") as string | null
  const valueRating = valueRatingVal && valueRatingVal !== "" ? parseInt(valueRatingVal, 10) : null

  const comment = (formData.get("comment") as string)?.trim() || null

  const venue = await db.venue.findUnique({
    where: { id: venueId },
    select: { slug: true },
  })
  if (!venue) redirect("/search")

  const existing = await db.review.findFirst({
    where: { venueId, userId: session.user.id, gameId: gameId ?? null },
  })

  if (existing) {
    await db.review.update({
      where: { id: existing.id },
      data: { showedGame, tvCount, soundOn, foodRating, drinkRating, valueRating, overallRating, comment },
    })
  } else {
    await db.review.create({
      data: {
        venueId,
        userId: session.user.id,
        gameId,
        showedGame,
        tvCount,
        soundOn,
        foodRating,
        drinkRating,
        valueRating,
        overallRating,
        comment,
      },
    })
  }

  redirect(`/venues/${venue.slug}`)
}
