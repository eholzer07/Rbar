import { PrismaClient, Sport } from '@prisma/client'

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// League definitions
// ---------------------------------------------------------------------------

const leagues = [
  { name: 'National Football League',   shortName: 'NFL', sport: Sport.AMERICAN_FOOTBALL },
  { name: 'National Basketball Association', shortName: 'NBA', sport: Sport.BASKETBALL },
  { name: 'Major League Baseball',      shortName: 'MLB', sport: Sport.BASEBALL },
  { name: 'National Hockey League',     shortName: 'NHL', sport: Sport.HOCKEY },
  { name: 'Major League Soccer',        shortName: 'MLS', sport: Sport.SOCCER },
]

// ---------------------------------------------------------------------------
// Team definitions per league
// ---------------------------------------------------------------------------

const teamsByLeague: Record<string, Array<{
  city: string; name: string; abbreviation: string;
  primaryColor: string; secondaryColor: string;
}>> = {
  NFL: [
    { city: 'Arizona',       name: 'Cardinals',  abbreviation: 'ARI', primaryColor: '#97233F', secondaryColor: '#000000' },
    { city: 'Atlanta',       name: 'Falcons',     abbreviation: 'ATL', primaryColor: '#A71930', secondaryColor: '#000000' },
    { city: 'Baltimore',     name: 'Ravens',      abbreviation: 'BAL', primaryColor: '#241773', secondaryColor: '#000000' },
    { city: 'Buffalo',       name: 'Bills',       abbreviation: 'BUF', primaryColor: '#00338D', secondaryColor: '#C60C30' },
    { city: 'Carolina',      name: 'Panthers',    abbreviation: 'CAR', primaryColor: '#0085CA', secondaryColor: '#101820' },
    { city: 'Chicago',       name: 'Bears',       abbreviation: 'CHI', primaryColor: '#0B162A', secondaryColor: '#C83803' },
    { city: 'Cincinnati',    name: 'Bengals',     abbreviation: 'CIN', primaryColor: '#FB4F14', secondaryColor: '#000000' },
    { city: 'Cleveland',     name: 'Browns',      abbreviation: 'CLE', primaryColor: '#311D00', secondaryColor: '#FF3C00' },
    { city: 'Dallas',        name: 'Cowboys',     abbreviation: 'DAL', primaryColor: '#003594', secondaryColor: '#041E42' },
    { city: 'Denver',        name: 'Broncos',     abbreviation: 'DEN', primaryColor: '#FB4F14', secondaryColor: '#002244' },
    { city: 'Detroit',       name: 'Lions',       abbreviation: 'DET', primaryColor: '#0076B6', secondaryColor: '#B0B7BC' },
    { city: 'Green Bay',     name: 'Packers',     abbreviation: 'GB',  primaryColor: '#203731', secondaryColor: '#FFB612' },
    { city: 'Houston',       name: 'Texans',      abbreviation: 'HOU', primaryColor: '#03202F', secondaryColor: '#A71930' },
    { city: 'Indianapolis',  name: 'Colts',       abbreviation: 'IND', primaryColor: '#002C5F', secondaryColor: '#A2AAAD' },
    { city: 'Jacksonville',  name: 'Jaguars',     abbreviation: 'JAX', primaryColor: '#006778', secondaryColor: '#9F792C' },
    { city: 'Kansas City',   name: 'Chiefs',      abbreviation: 'KC',  primaryColor: '#E31837', secondaryColor: '#FFB81C' },
    { city: 'Las Vegas',     name: 'Raiders',     abbreviation: 'LV',  primaryColor: '#000000', secondaryColor: '#A5ACAF' },
    { city: 'Los Angeles',   name: 'Chargers',    abbreviation: 'LAC', primaryColor: '#0080C6', secondaryColor: '#FFC20E' },
    { city: 'Los Angeles',   name: 'Rams',        abbreviation: 'LAR', primaryColor: '#003594', secondaryColor: '#FFA300' },
    { city: 'Miami',         name: 'Dolphins',    abbreviation: 'MIA', primaryColor: '#008E97', secondaryColor: '#FC4C02' },
    { city: 'Minnesota',     name: 'Vikings',     abbreviation: 'MIN', primaryColor: '#4F2683', secondaryColor: '#FFC62F' },
    { city: 'New England',   name: 'Patriots',    abbreviation: 'NE',  primaryColor: '#002244', secondaryColor: '#C60C30' },
    { city: 'New Orleans',   name: 'Saints',      abbreviation: 'NO',  primaryColor: '#D3BC8D', secondaryColor: '#101820' },
    { city: 'New York',      name: 'Giants',      abbreviation: 'NYG', primaryColor: '#0B2265', secondaryColor: '#A71930' },
    { city: 'New York',      name: 'Jets',        abbreviation: 'NYJ', primaryColor: '#125740', secondaryColor: '#000000' },
    { city: 'Philadelphia',  name: 'Eagles',      abbreviation: 'PHI', primaryColor: '#004C54', secondaryColor: '#A5ACAF' },
    { city: 'Pittsburgh',    name: 'Steelers',    abbreviation: 'PIT', primaryColor: '#FFB612', secondaryColor: '#101820' },
    { city: 'San Francisco', name: '49ers',       abbreviation: 'SF',  primaryColor: '#AA0000', secondaryColor: '#B3995D' },
    { city: 'Seattle',       name: 'Seahawks',    abbreviation: 'SEA', primaryColor: '#002244', secondaryColor: '#69BE28' },
    { city: 'Tampa Bay',     name: 'Buccaneers',  abbreviation: 'TB',  primaryColor: '#D50A0A', secondaryColor: '#FF7900' },
    { city: 'Tennessee',     name: 'Titans',      abbreviation: 'TEN', primaryColor: '#0C2340', secondaryColor: '#4B92DB' },
    { city: 'Washington',    name: 'Commanders',  abbreviation: 'WSH', primaryColor: '#5A1414', secondaryColor: '#FFB612' },
  ],
  NBA: [
    { city: 'Atlanta',       name: 'Hawks',          abbreviation: 'ATL', primaryColor: '#E03A3E', secondaryColor: '#C1D32F' },
    { city: 'Boston',        name: 'Celtics',        abbreviation: 'BOS', primaryColor: '#007A33', secondaryColor: '#BA9653' },
    { city: 'Brooklyn',      name: 'Nets',           abbreviation: 'BKN', primaryColor: '#000000', secondaryColor: '#FFFFFF' },
    { city: 'Charlotte',     name: 'Hornets',        abbreviation: 'CHA', primaryColor: '#1D1160', secondaryColor: '#00788C' },
    { city: 'Chicago',       name: 'Bulls',          abbreviation: 'CHI', primaryColor: '#CE1141', secondaryColor: '#000000' },
    { city: 'Cleveland',     name: 'Cavaliers',      abbreviation: 'CLE', primaryColor: '#860038', secondaryColor: '#FDBB30' },
    { city: 'Dallas',        name: 'Mavericks',      abbreviation: 'DAL', primaryColor: '#00538C', secondaryColor: '#002B5E' },
    { city: 'Denver',        name: 'Nuggets',        abbreviation: 'DEN', primaryColor: '#0E2240', secondaryColor: '#FEC524' },
    { city: 'Detroit',       name: 'Pistons',        abbreviation: 'DET', primaryColor: '#C8102E', secondaryColor: '#006BB6' },
    { city: 'Golden State',  name: 'Warriors',       abbreviation: 'GSW', primaryColor: '#1D428A', secondaryColor: '#FFC72C' },
    { city: 'Houston',       name: 'Rockets',        abbreviation: 'HOU', primaryColor: '#CE1141', secondaryColor: '#000000' },
    { city: 'Indiana',       name: 'Pacers',         abbreviation: 'IND', primaryColor: '#002D62', secondaryColor: '#FDBB30' },
    { city: 'Los Angeles',   name: 'Clippers',       abbreviation: 'LAC', primaryColor: '#C8102E', secondaryColor: '#1D428A' },
    { city: 'Los Angeles',   name: 'Lakers',         abbreviation: 'LAL', primaryColor: '#552583', secondaryColor: '#FDB927' },
    { city: 'Memphis',       name: 'Grizzlies',      abbreviation: 'MEM', primaryColor: '#5D76A9', secondaryColor: '#12173F' },
    { city: 'Miami',         name: 'Heat',           abbreviation: 'MIA', primaryColor: '#98002E', secondaryColor: '#F9A01B' },
    { city: 'Milwaukee',     name: 'Bucks',          abbreviation: 'MIL', primaryColor: '#00471B', secondaryColor: '#EEE1C6' },
    { city: 'Minnesota',     name: 'Timberwolves',   abbreviation: 'MIN', primaryColor: '#0C2340', secondaryColor: '#236192' },
    { city: 'New Orleans',   name: 'Pelicans',       abbreviation: 'NOP', primaryColor: '#0C2340', secondaryColor: '#C8102E' },
    { city: 'New York',      name: 'Knicks',         abbreviation: 'NYK', primaryColor: '#006BB6', secondaryColor: '#F58426' },
    { city: 'Oklahoma City', name: 'Thunder',        abbreviation: 'OKC', primaryColor: '#007AC1', secondaryColor: '#EF3B24' },
    { city: 'Orlando',       name: 'Magic',          abbreviation: 'ORL', primaryColor: '#0077C0', secondaryColor: '#C4CED4' },
    { city: 'Philadelphia',  name: '76ers',          abbreviation: 'PHI', primaryColor: '#006BB6', secondaryColor: '#ED174C' },
    { city: 'Phoenix',       name: 'Suns',           abbreviation: 'PHX', primaryColor: '#1D1160', secondaryColor: '#E56020' },
    { city: 'Portland',      name: 'Trail Blazers',  abbreviation: 'POR', primaryColor: '#E03A3E', secondaryColor: '#000000' },
    { city: 'Sacramento',    name: 'Kings',          abbreviation: 'SAC', primaryColor: '#5A2D81', secondaryColor: '#63727A' },
    { city: 'San Antonio',   name: 'Spurs',          abbreviation: 'SAS', primaryColor: '#C4CED4', secondaryColor: '#000000' },
    { city: 'Toronto',       name: 'Raptors',        abbreviation: 'TOR', primaryColor: '#CE1141', secondaryColor: '#000000' },
    { city: 'Utah',          name: 'Jazz',           abbreviation: 'UTA', primaryColor: '#002B5C', secondaryColor: '#00471B' },
    { city: 'Washington',    name: 'Wizards',        abbreviation: 'WAS', primaryColor: '#002B5C', secondaryColor: '#E31837' },
  ],
  MLB: [
    { city: 'Arizona',       name: 'Diamondbacks',   abbreviation: 'ARI', primaryColor: '#A71930', secondaryColor: '#E3D4AD' },
    { city: 'Atlanta',       name: 'Braves',         abbreviation: 'ATL', primaryColor: '#CE1141', secondaryColor: '#13274F' },
    { city: 'Baltimore',     name: 'Orioles',        abbreviation: 'BAL', primaryColor: '#DF4601', secondaryColor: '#000000' },
    { city: 'Boston',        name: 'Red Sox',        abbreviation: 'BOS', primaryColor: '#BD3039', secondaryColor: '#0D2B56' },
    { city: 'Chicago',       name: 'Cubs',           abbreviation: 'CHC', primaryColor: '#0E3386', secondaryColor: '#CC3433' },
    { city: 'Chicago',       name: 'White Sox',      abbreviation: 'CWS', primaryColor: '#27251F', secondaryColor: '#C4CED4' },
    { city: 'Cincinnati',    name: 'Reds',           abbreviation: 'CIN', primaryColor: '#C6011F', secondaryColor: '#000000' },
    { city: 'Cleveland',     name: 'Guardians',      abbreviation: 'CLE', primaryColor: '#00385D', secondaryColor: '#E50022' },
    { city: 'Colorado',      name: 'Rockies',        abbreviation: 'COL', primaryColor: '#33006F', secondaryColor: '#C4CED4' },
    { city: 'Detroit',       name: 'Tigers',         abbreviation: 'DET', primaryColor: '#0C2340', secondaryColor: '#FA4616' },
    { city: 'Houston',       name: 'Astros',         abbreviation: 'HOU', primaryColor: '#002D62', secondaryColor: '#EB6E1F' },
    { city: 'Kansas City',   name: 'Royals',         abbreviation: 'KC',  primaryColor: '#004687', secondaryColor: '#C09A5B' },
    { city: 'Los Angeles',   name: 'Angels',         abbreviation: 'LAA', primaryColor: '#BA0021', secondaryColor: '#003263' },
    { city: 'Los Angeles',   name: 'Dodgers',        abbreviation: 'LAD', primaryColor: '#005A9C', secondaryColor: '#EF3E42' },
    { city: 'Miami',         name: 'Marlins',        abbreviation: 'MIA', primaryColor: '#00A3E0', secondaryColor: '#EF3340' },
    { city: 'Milwaukee',     name: 'Brewers',        abbreviation: 'MIL', primaryColor: '#12284B', secondaryColor: '#FFC52F' },
    { city: 'Minnesota',     name: 'Twins',          abbreviation: 'MIN', primaryColor: '#002B5C', secondaryColor: '#D31145' },
    { city: 'New York',      name: 'Mets',           abbreviation: 'NYM', primaryColor: '#002D72', secondaryColor: '#FF5910' },
    { city: 'New York',      name: 'Yankees',        abbreviation: 'NYY', primaryColor: '#003087', secondaryColor: '#E4002C' },
    { city: 'Oakland',       name: 'Athletics',      abbreviation: 'OAK', primaryColor: '#003831', secondaryColor: '#EFB21E' },
    { city: 'Philadelphia',  name: 'Phillies',       abbreviation: 'PHI', primaryColor: '#E81828', secondaryColor: '#002D72' },
    { city: 'Pittsburgh',    name: 'Pirates',        abbreviation: 'PIT', primaryColor: '#27251F', secondaryColor: '#FDB827' },
    { city: 'San Diego',     name: 'Padres',         abbreviation: 'SD',  primaryColor: '#2F241D', secondaryColor: '#FFC425' },
    { city: 'San Francisco', name: 'Giants',         abbreviation: 'SF',  primaryColor: '#FD5A1E', secondaryColor: '#27251F' },
    { city: 'Seattle',       name: 'Mariners',       abbreviation: 'SEA', primaryColor: '#0C2C56', secondaryColor: '#005C5C' },
    { city: 'St. Louis',     name: 'Cardinals',      abbreviation: 'STL', primaryColor: '#C41E3A', secondaryColor: '#0C2340' },
    { city: 'Tampa Bay',     name: 'Rays',           abbreviation: 'TB',  primaryColor: '#092C5C', secondaryColor: '#8FBCE6' },
    { city: 'Texas',         name: 'Rangers',        abbreviation: 'TEX', primaryColor: '#003278', secondaryColor: '#C0111F' },
    { city: 'Toronto',       name: 'Blue Jays',      abbreviation: 'TOR', primaryColor: '#134A8E', secondaryColor: '#1D2D5C' },
    { city: 'Washington',    name: 'Nationals',      abbreviation: 'WSH', primaryColor: '#AB0003', secondaryColor: '#14225A' },
  ],
  NHL: [
    { city: 'Anaheim',       name: 'Ducks',          abbreviation: 'ANA', primaryColor: '#FC4C02', secondaryColor: '#85714D' },
    { city: 'Boston',        name: 'Bruins',         abbreviation: 'BOS', primaryColor: '#FFB81C', secondaryColor: '#000000' },
    { city: 'Buffalo',       name: 'Sabres',         abbreviation: 'BUF', primaryColor: '#003087', secondaryColor: '#FCB514' },
    { city: 'Calgary',       name: 'Flames',         abbreviation: 'CGY', primaryColor: '#D2001C', secondaryColor: '#FAAF19' },
    { city: 'Carolina',      name: 'Hurricanes',     abbreviation: 'CAR', primaryColor: '#CC0000', secondaryColor: '#000000' },
    { city: 'Chicago',       name: 'Blackhawks',     abbreviation: 'CHI', primaryColor: '#CF0A2C', secondaryColor: '#000000' },
    { city: 'Colorado',      name: 'Avalanche',      abbreviation: 'COL', primaryColor: '#6F263D', secondaryColor: '#236192' },
    { city: 'Columbus',      name: 'Blue Jackets',   abbreviation: 'CBJ', primaryColor: '#002654', secondaryColor: '#CE1126' },
    { city: 'Dallas',        name: 'Stars',          abbreviation: 'DAL', primaryColor: '#006847', secondaryColor: '#8F8F8C' },
    { city: 'Detroit',       name: 'Red Wings',      abbreviation: 'DET', primaryColor: '#CE1126', secondaryColor: '#FFFFFF' },
    { city: 'Edmonton',      name: 'Oilers',         abbreviation: 'EDM', primaryColor: '#FF4C00', secondaryColor: '#003087' },
    { city: 'Florida',       name: 'Panthers',       abbreviation: 'FLA', primaryColor: '#041E42', secondaryColor: '#C8102E' },
    { city: 'Los Angeles',   name: 'Kings',          abbreviation: 'LAK', primaryColor: '#111111', secondaryColor: '#A2AAAD' },
    { city: 'Minnesota',     name: 'Wild',           abbreviation: 'MIN', primaryColor: '#154734', secondaryColor: '#A6192E' },
    { city: 'Montreal',      name: 'Canadiens',      abbreviation: 'MTL', primaryColor: '#AF1E2D', secondaryColor: '#192168' },
    { city: 'Nashville',     name: 'Predators',      abbreviation: 'NSH', primaryColor: '#FFB81C', secondaryColor: '#041E42' },
    { city: 'New Jersey',    name: 'Devils',         abbreviation: 'NJD', primaryColor: '#CE1126', secondaryColor: '#000000' },
    { city: 'New York',      name: 'Islanders',      abbreviation: 'NYI', primaryColor: '#003087', secondaryColor: '#FC4C02' },
    { city: 'New York',      name: 'Rangers',        abbreviation: 'NYR', primaryColor: '#0038A8', secondaryColor: '#CE1126' },
    { city: 'Ottawa',        name: 'Senators',       abbreviation: 'OTT', primaryColor: '#C52032', secondaryColor: '#C69214' },
    { city: 'Philadelphia',  name: 'Flyers',         abbreviation: 'PHI', primaryColor: '#F74902', secondaryColor: '#000000' },
    { city: 'Pittsburgh',    name: 'Penguins',       abbreviation: 'PIT', primaryColor: '#FCB514', secondaryColor: '#000000' },
    { city: 'San Jose',      name: 'Sharks',         abbreviation: 'SJS', primaryColor: '#006D75', secondaryColor: '#EA7200' },
    { city: 'Seattle',       name: 'Kraken',         abbreviation: 'SEA', primaryColor: '#001628', secondaryColor: '#99D9D9' },
    { city: 'St. Louis',     name: 'Blues',          abbreviation: 'STL', primaryColor: '#002F87', secondaryColor: '#FCB514' },
    { city: 'Tampa Bay',     name: 'Lightning',      abbreviation: 'TBL', primaryColor: '#002868', secondaryColor: '#FFFFFF' },
    { city: 'Toronto',       name: 'Maple Leafs',    abbreviation: 'TOR', primaryColor: '#003E7E', secondaryColor: '#FFFFFF' },
    { city: 'Utah',          name: 'Hockey Club',    abbreviation: 'UTA', primaryColor: '#6CAEDF', secondaryColor: '#000000' },
    { city: 'Vancouver',     name: 'Canucks',        abbreviation: 'VAN', primaryColor: '#00205B', secondaryColor: '#00843D' },
    { city: 'Vegas',         name: 'Golden Knights', abbreviation: 'VGK', primaryColor: '#B4975A', secondaryColor: '#333F42' },
    { city: 'Washington',    name: 'Capitals',       abbreviation: 'WSH', primaryColor: '#041E42', secondaryColor: '#C8102E' },
    { city: 'Winnipeg',      name: 'Jets',           abbreviation: 'WPG', primaryColor: '#041E42', secondaryColor: '#004C97' },
  ],
  MLS: [
    { city: 'Atlanta',       name: 'United FC',      abbreviation: 'ATL',  primaryColor: '#80000A', secondaryColor: '#000000' },
    { city: 'Austin',        name: 'FC',             abbreviation: 'ATX',  primaryColor: '#00B140', secondaryColor: '#000000' },
    { city: 'Charlotte',     name: 'FC',             abbreviation: 'CLT',  primaryColor: '#1A85C8', secondaryColor: '#000000' },
    { city: 'Chicago',       name: 'Fire FC',        abbreviation: 'CHI',  primaryColor: '#CC0000', secondaryColor: '#003087' },
    { city: 'Colorado',      name: 'Rapids',         abbreviation: 'COL',  primaryColor: '#960A2C', secondaryColor: '#9CC3E5' },
    { city: 'Columbus',      name: 'Crew',           abbreviation: 'CLB',  primaryColor: '#FEDD00', secondaryColor: '#000000' },
    { city: 'D.C.',          name: 'United',         abbreviation: 'DC',   primaryColor: '#000000', secondaryColor: '#EF3E42' },
    { city: 'Cincinnati',    name: 'FC Cincinnati',  abbreviation: 'CIN',  primaryColor: '#003087', secondaryColor: '#FE5000' },
    { city: 'Frisco',        name: 'FC Dallas',      abbreviation: 'DAL',  primaryColor: '#BF0D3E', secondaryColor: '#0072CE' },
    { city: 'Houston',       name: 'Dynamo FC',      abbreviation: 'HOU',  primaryColor: '#FF6B00', secondaryColor: '#101820' },
    { city: 'Fort Lauderdale', name: 'Inter Miami CF', abbreviation: 'MIA', primaryColor: '#F7B5CD', secondaryColor: '#231F20' },
    { city: 'Los Angeles',   name: 'Galaxy',         abbreviation: 'LA',   primaryColor: '#00245D', secondaryColor: '#FFD200' },
    { city: 'Los Angeles',   name: 'FC',             abbreviation: 'LAFC', primaryColor: '#000000', secondaryColor: '#C39E6D' },
    { city: 'Minneapolis',   name: 'Minnesota United FC', abbreviation: 'MIN', primaryColor: '#8CD2F4', secondaryColor: '#231F20' },
    { city: 'Montreal',      name: 'CF Montréal',    abbreviation: 'MTL',  primaryColor: '#003DA5', secondaryColor: '#EF3E42' },
    { city: 'Nashville',     name: 'SC',             abbreviation: 'NSH',  primaryColor: '#ECE83A', secondaryColor: '#1F1646' },
    { city: 'Foxborough',    name: 'New England Revolution', abbreviation: 'NE', primaryColor: '#003087', secondaryColor: '#CE1126' },
    { city: 'New York',      name: 'City FC',        abbreviation: 'NYC',  primaryColor: '#6CAEDF', secondaryColor: '#00285E' },
    { city: 'Harrison',      name: 'New York Red Bulls', abbreviation: 'NYRB', primaryColor: '#ED1F24', secondaryColor: '#23166C' },
    { city: 'Orlando',       name: 'City SC',        abbreviation: 'ORL',  primaryColor: '#612B82', secondaryColor: '#FDE192' },
    { city: 'Philadelphia',  name: 'Union',          abbreviation: 'PHI',  primaryColor: '#071B2C', secondaryColor: '#B19B69' },
    { city: 'Portland',      name: 'Timbers',        abbreviation: 'POR',  primaryColor: '#004812', secondaryColor: '#EBE72B' },
    { city: 'Sandy',         name: 'Real Salt Lake', abbreviation: 'RSL',  primaryColor: '#B30838', secondaryColor: '#013A81' },
    { city: 'San Diego',     name: 'FC',             abbreviation: 'SDI',  primaryColor: '#005B99', secondaryColor: '#FFC72C' },
    { city: 'San Jose',      name: 'Earthquakes',    abbreviation: 'SJ',   primaryColor: '#193F6B', secondaryColor: '#E8001C' },
    { city: 'Seattle',       name: 'Sounders FC',    abbreviation: 'SEA',  primaryColor: '#5D9741', secondaryColor: '#003087' },
    { city: 'Kansas City',   name: 'Sporting KC',    abbreviation: 'SKC',  primaryColor: '#002F65', secondaryColor: '#91B0D5' },
    { city: 'St. Louis',     name: 'City SC',        abbreviation: 'STL',  primaryColor: '#B10C20', secondaryColor: '#CBCBCB' },
    { city: 'Toronto',       name: 'FC',             abbreviation: 'TOR',  primaryColor: '#AC1A2F', secondaryColor: '#313F6C' },
    { city: 'Vancouver',     name: 'Whitecaps FC',   abbreviation: 'VAN',  primaryColor: '#00245E', secondaryColor: '#9DC2E6' },
  ],
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Clearing existing league/team data...')
  await prisma.team.deleteMany()
  await prisma.league.deleteMany()

  console.log('Seeding leagues...')
  const leagueIds: Record<string, string> = {}

  for (const league of leagues) {
    const record = await prisma.league.create({
      data: {
        name: league.name,
        shortName: league.shortName,
        sport: league.sport,
      },
    })
    leagueIds[league.shortName] = record.id
    console.log(`  ${league.shortName}: ${record.id}`)
  }

  console.log('\nSeeding teams...')
  const counts: Record<string, number> = {}

  for (const [shortName, teams] of Object.entries(teamsByLeague)) {
    const leagueId = leagueIds[shortName]
    const sport = leagues.find((l) => l.shortName === shortName)!.sport

    const data = teams.map((t) => ({
      name: t.name,
      city: t.city,
      abbreviation: t.abbreviation,
      leagueId,
      sport,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
    }))

    await prisma.team.createMany({ data })
    counts[shortName] = data.length
    console.log(`  ${shortName}: ${data.length} teams`)
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  console.log(`\nTotal teams seeded: ${total}`)
  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
