import { syncTeamLogos, syncUpcomingGames } from '../src/lib/sports-db/sync'
import { db } from '../src/lib/db'

async function main() {
  console.log('=== Sports Data Sync ===\n')

  console.log('Syncing team logos and league IDs...')
  const logos = await syncTeamLogos()
  console.log(`  Leagues updated: ${logos.leaguesUpdated}`)
  console.log(`  Teams updated:   ${logos.teamsUpdated}`)
  if (logos.errors.length > 0) {
    console.log(`  Warnings (${logos.errors.length}):`)
    logos.errors.forEach((e) => console.log(`    - ${e}`))
  }

  console.log('\nSyncing upcoming games (14-day window)...')
  const games = await syncUpcomingGames()
  console.log(`  Games created: ${games.gamesCreated}`)
  console.log(`  Games updated: ${games.gamesUpdated}`)
  console.log(`  Leagues skipped: ${games.leaguesSkipped}`)
  if (games.errors.length > 0) {
    console.log(`  Warnings (${games.errors.length}):`)
    games.errors.forEach((e) => console.log(`    - ${e}`))
  }

  console.log('\nDone.')
}

main().finally(() => db.$disconnect())
