-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('AMERICAN_FOOTBALL', 'BASKETBALL', 'BASEBALL', 'HOCKEY', 'SOCCER');

-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_REVIEW');

-- CreateEnum
CREATE TYPE "WatchEventVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('GOING', 'INTERESTED', 'NOT_GOING');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "username" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "homeCity" TEXT,
    "emailVerified" TIMESTAMP(3),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "logoUrl" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "sport" "Sport" NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavoriteTeam" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavoriteTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT,
    "lat" DECIMAL(65,30) NOT NULL,
    "lng" DECIMAL(65,30) NOT NULL,
    "location" geography(Point, 4326),
    "phone" TEXT,
    "website" TEXT,
    "googlePlaceId" TEXT,
    "status" "VenueStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenuePhoto" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenuePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueTeam" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenueTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "season" TEXT NOT NULL,
    "week" INTEGER,
    "broadcastChannels" TEXT[],
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "gameId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "visibility" "WatchEventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchEventAttendee" (
    "id" TEXT NOT NULL,
    "watchEventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RsvpStatus" NOT NULL,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchEventAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameId" TEXT,
    "showedGame" BOOLEAN,
    "tvCount" INTEGER,
    "soundOn" BOOLEAN,
    "foodRating" INTEGER,
    "drinkRating" INTEGER,
    "valueRating" INTEGER,
    "overallRating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueRecommendation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "description" TEXT,
    "submittedById" TEXT,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "approvedVenueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenueRecommendationTeam" (
    "recommendationId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "VenueRecommendationTeam_pkey" PRIMARY KEY ("recommendationId","teamId")
);

-- CreateTable
CREATE TABLE "VenueOwnerClaim" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueOwnerClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteTeam_userId_teamId_key" ON "UserFavoriteTeam"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

-- CreateIndex
CREATE INDEX "Venue_status_idx" ON "Venue"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VenueTeam_venueId_teamId_key" ON "VenueTeam"("venueId", "teamId");

-- CreateIndex
CREATE INDEX "Game_startTime_idx" ON "Game"("startTime");

-- CreateIndex
CREATE INDEX "Game_leagueId_startTime_idx" ON "Game"("leagueId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "WatchEventAttendee_watchEventId_userId_key" ON "WatchEventAttendee"("watchEventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_venueId_userId_gameId_key" ON "Review"("venueId", "userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteTeam" ADD CONSTRAINT "UserFavoriteTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavoriteTeam" ADD CONSTRAINT "UserFavoriteTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePhoto" ADD CONSTRAINT "VenuePhoto_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePhoto" ADD CONSTRAINT "VenuePhoto_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTeam" ADD CONSTRAINT "VenueTeam_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueTeam" ADD CONSTRAINT "VenueTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchEvent" ADD CONSTRAINT "WatchEvent_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchEvent" ADD CONSTRAINT "WatchEvent_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchEvent" ADD CONSTRAINT "WatchEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchEventAttendee" ADD CONSTRAINT "WatchEventAttendee_watchEventId_fkey" FOREIGN KEY ("watchEventId") REFERENCES "WatchEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchEventAttendee" ADD CONSTRAINT "WatchEventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRecommendation" ADD CONSTRAINT "VenueRecommendation_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRecommendation" ADD CONSTRAINT "VenueRecommendation_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRecommendation" ADD CONSTRAINT "VenueRecommendation_approvedVenueId_fkey" FOREIGN KEY ("approvedVenueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRecommendationTeam" ADD CONSTRAINT "VenueRecommendationTeam_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "VenueRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueRecommendationTeam" ADD CONSTRAINT "VenueRecommendationTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueOwnerClaim" ADD CONSTRAINT "VenueOwnerClaim_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueOwnerClaim" ADD CONSTRAINT "VenueOwnerClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenueOwnerClaim" ADD CONSTRAINT "VenueOwnerClaim_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
