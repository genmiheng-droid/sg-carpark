import { SearchLocation, LocationCategory, Carpark } from '../types';

export interface KnownLocationItem {
  name: string;
  area: string;
  category: LocationCategory;
  lat: number;
  lng: number;
  aliases?: string[];
  road?: string;
}

export const SINGAPORE_ROADS_AND_BUILDINGS: KnownLocationItem[] = [
  // ==========================================
  // CBD & DOWNTOWN ROADS & BUILDINGS
  // ==========================================
  {
    name: 'Shenton Way',
    area: 'CBD / Downtown Core',
    category: 'Road',
    lat: 1.2787,
    lng: 103.8493,
    aliases: ['shenton', 'shenton way cbd', 'sgx centre shenton way'],
    road: 'Shenton Way',
  },
  {
    name: 'Robinson Road',
    area: 'CBD / Downtown Core',
    category: 'Road',
    lat: 1.2801,
    lng: 103.8505,
    aliases: ['robinson rd', 'robinson', '77 robinson road', '120 robinson road'],
    road: 'Robinson Road',
  },
  {
    name: 'Cecil Street',
    area: 'CBD / Downtown Core',
    category: 'Road',
    lat: 1.2818,
    lng: 103.8501,
    aliases: ['cecil st', 'cecil', 'prudential tower cecil street'],
    road: 'Cecil Street',
  },
  {
    name: 'Anson Road',
    area: 'Tanjong Pagar / CBD',
    category: 'Road',
    lat: 1.2748,
    lng: 103.8458,
    aliases: ['anson rd', 'anson', 'springleaf tower anson road', 'fuji xerox towers'],
    road: 'Anson Road',
  },
  {
    name: 'Cross Street',
    area: 'CBD / Chinatown',
    category: 'Road',
    lat: 1.2831,
    lng: 103.8488,
    aliases: ['cross st', 'cross st exchange', 'china square central cross street'],
    road: 'Cross Street',
  },
  {
    name: 'Collyer Quay',
    area: 'Downtown Core',
    category: 'Road',
    lat: 1.2842,
    lng: 103.8532,
    aliases: ['collyer', 'ocean financial centre collyer quay'],
    road: 'Collyer Quay',
  },
  {
    name: 'Raffles Place',
    area: 'Downtown Core',
    category: 'Business',
    lat: 1.2830,
    lng: 103.8513,
    aliases: ['raffles place mrt', 'one raffles place', 'republic plaza', 'uob plaza'],
    road: 'Raffles Place',
  },
  {
    name: 'Raffles Quay',
    area: 'Downtown Core / Marina Bay',
    category: 'Road',
    lat: 1.2808,
    lng: 103.8524,
    aliases: ['one raffles quay', 'orq', 'raffles quay'],
    road: 'Raffles Quay',
  },
  {
    name: 'Marina Boulevard',
    area: 'Marina Bay',
    category: 'Road',
    lat: 1.2798,
    lng: 103.8546,
    aliases: ['mbfc', 'marina bay financial centre', 'marina blvd'],
    road: 'Marina Boulevard',
  },
  {
    name: 'Temasek Boulevard',
    area: 'Marina Centre',
    category: 'Road',
    lat: 1.2934,
    lng: 103.8588,
    aliases: ['temasek blvd', 'suntec city temasek blvd', 'fountain of wealth'],
    road: 'Temasek Boulevard',
  },
  {
    name: 'Raffles Avenue',
    area: 'Marina Centre',
    category: 'Road',
    lat: 1.2898,
    lng: 103.8569,
    aliases: ['esplanade raffles ave', 'raffles ave', 'the float at marina bay'],
    road: 'Raffles Avenue',
  },
  {
    name: 'Bras Basah Road',
    area: 'City Hall / Museum',
    category: 'Road',
    lat: 1.2972,
    lng: 103.8519,
    aliases: ['bras basah rd', 'bras basah', 'chijmes', 'smu bras basah'],
    road: 'Bras Basah Road',
  },
  {
    name: 'Victoria Street',
    area: 'Bugis / City Hall',
    category: 'Road',
    lat: 1.2995,
    lng: 103.8546,
    aliases: ['victoria st', 'national library victoria street', 'bugis junction victoria street'],
    road: 'Victoria Street',
  },
  {
    name: 'North Bridge Road',
    area: 'Bugis / City Hall',
    category: 'Road',
    lat: 1.2982,
    lng: 103.8533,
    aliases: ['north bridge rd', 'funan north bridge road', 'peninsula plaza'],
    road: 'North Bridge Road',
  },
  {
    name: 'South Bridge Road',
    area: 'Chinatown / Clarke Quay',
    category: 'Road',
    lat: 1.2845,
    lng: 103.8468,
    aliases: ['south bridge rd', 'sri mariamman south bridge road'],
    road: 'South Bridge Road',
  },
  {
    name: 'Beach Road',
    area: 'Kallang / Bugis',
    category: 'Road',
    lat: 1.3005,
    lng: 103.8601,
    aliases: ['beach rd', 'duo tower beach road', 'golden mile beach road', 'the concourse'],
    road: 'Beach Road',
  },
  {
    name: 'Nicoll Highway',
    area: 'Marina / Kallang',
    category: 'Road',
    lat: 1.2989,
    lng: 103.8622,
    aliases: ['nicoll hwy', 'suntec nicoll highway'],
    road: 'Nicoll Highway',
  },
  {
    name: 'Stamford Road',
    area: 'City Hall',
    category: 'Road',
    lat: 1.2941,
    lng: 103.8521,
    aliases: ['stamford rd', 'capitol piazza stamford road', 'national museum'],
    road: 'Stamford Road',
  },
  {
    name: 'Hill Street',
    area: 'City Hall / Clarke Quay',
    category: 'Road',
    lat: 1.2915,
    lng: 103.8492,
    aliases: ['hill st', 'old hill street police station', 'central fire station'],
    road: 'Hill Street',
  },
  {
    name: 'Bencoolen Street',
    area: 'Bugis / Rochor',
    category: 'Road',
    lat: 1.3001,
    lng: 103.8512,
    aliases: ['bencoolen st', 'nafa bencoolen', 'bencoolen mrt'],
    road: 'Bencoolen Street',
  },
  {
    name: 'Middle Road',
    area: 'Bugis / Rochor',
    category: 'Road',
    lat: 1.2998,
    lng: 103.8542,
    aliases: ['middle rd', 'bugis+ middle road'],
    road: 'Middle Road',
  },
  {
    name: 'Tanjong Pagar Road',
    area: 'Tanjong Pagar',
    category: 'Road',
    lat: 1.2778,
    lng: 103.8441,
    aliases: ['tanjong pagar rd', 'guoco tower tanjong pagar', 'tanjong pagar centre'],
    road: 'Tanjong Pagar Road',
  },
  {
    name: 'Cantonment Road',
    area: 'Tanjong Pagar / Outram',
    category: 'Road',
    lat: 1.2764,
    lng: 103.8398,
    aliases: ['cantonment rd', 'the pinnacle@duxton cantonment road'],
    road: 'Cantonment Road',
  },
  {
    name: 'Eu Tong Sen Street',
    area: 'Chinatown / Clarke Quay',
    category: 'Road',
    lat: 1.2858,
    lng: 103.8449,
    aliases: ['eu tong sen st', 'chinatown point eu tong sen st', 'clarke quay the central'],
    road: 'Eu Tong Sen Street',
  },
  {
    name: 'New Bridge Road',
    area: 'Chinatown',
    category: 'Road',
    lat: 1.2842,
    lng: 103.8438,
    aliases: ['new bridge rd', 'people\'s park complex new bridge road'],
    road: 'New Bridge Road',
  },

  // ==========================================
  // ORCHARD, NEWTON, NOVENA & TANGLIN
  // ==========================================
  {
    name: 'Orchard Road',
    area: 'Orchard',
    category: 'Road',
    lat: 1.3048,
    lng: 103.8318,
    aliases: ['orchard rd', 'orchard', 'tang plaza', 'wheelock place'],
    road: 'Orchard Road',
  },
  {
    name: 'Scotts Road',
    area: 'Orchard / Newton',
    category: 'Road',
    lat: 1.3072,
    lng: 103.8327,
    aliases: ['scotts rd', 'shaw centre scotts road', 'far east plaza scotts road', 'grand hyatt'],
    road: 'Scotts Road',
  },
  {
    name: 'Somerset Road',
    area: 'Orchard',
    category: 'Road',
    lat: 1.3008,
    lng: 103.8385,
    aliases: ['somerset rd', '313 somerset', 'orchard gateway somerset road', 'tripleone somerset'],
    road: 'Somerset Road',
  },
  {
    name: 'Orchard Turn',
    area: 'Orchard',
    category: 'Road',
    lat: 1.3040,
    lng: 103.8320,
    aliases: ['ion orchard turn', 'orchard turn'],
    road: 'Orchard Turn',
  },
  {
    name: 'Paterson Road',
    area: 'Orchard',
    category: 'Road',
    lat: 1.3041,
    lng: 103.8298,
    aliases: ['paterson rd', 'paterson hill'],
    road: 'Paterson Road',
  },
  {
    name: 'Grange Road',
    area: 'Orchard',
    category: 'Road',
    lat: 1.3012,
    lng: 103.8344,
    aliases: ['grange rd', 'scap carpark grange road'],
    road: 'Grange Road',
  },
  {
    name: 'Bideford Road',
    area: 'Orchard',
    category: 'Road',
    lat: 1.3042,
    lng: 103.8361,
    aliases: ['bideford rd', 'paragon bideford road', 'the paragon'],
    road: 'Bideford Road',
  },
  {
    name: 'Tanglin Road',
    area: 'Tanglin / Orchard',
    category: 'Road',
    lat: 1.3055,
    lng: 103.8242,
    aliases: ['tanglin rd', 'tanglin mall', 'tanglin shopping centre'],
    road: 'Tanglin Road',
  },
  {
    name: 'Cavenagh Road',
    area: 'Newton / Orchard',
    category: 'Road',
    lat: 1.3082,
    lng: 103.8415,
    aliases: ['cavenagh rd', 'cavenagh'],
    road: 'Cavenagh Road',
  },
  {
    name: 'Newton Road',
    area: 'Newton',
    category: 'Road',
    lat: 1.3142,
    lng: 103.8398,
    aliases: ['newton rd', 'newton food centre', 'newton circus'],
    road: 'Newton Road',
  },
  {
    name: 'Thomson Road',
    area: 'Novena / Thomson',
    category: 'Road',
    lat: 1.3215,
    lng: 103.8432,
    aliases: ['thomson rd', 'velocity novena thomson road', 'novena square', 'united square'],
    road: 'Thomson Road',
  },
  {
    name: 'Bukit Timah Road',
    area: 'Bukit Timah / Newton',
    category: 'Road',
    lat: 1.3201,
    lng: 103.8268,
    aliases: ['bukit timah rd', 'bt timah road', 'dunearn road', 'newton rochor canal'],
    road: 'Bukit Timah Road',
  },
  {
    name: 'Dunearn Road',
    area: 'Bukit Timah',
    category: 'Road',
    lat: 1.3235,
    lng: 103.8221,
    aliases: ['dunearn rd', 'coronation plaza dunearn road'],
    road: 'Dunearn Road',
  },

  // ==========================================
  // WEST: JURONG, CLEMENTI, BUKIT BATOK
  // ==========================================
  {
    name: 'Jurong Gateway Road',
    area: 'Jurong East',
    category: 'Road',
    lat: 1.3335,
    lng: 103.7431,
    aliases: ['jurong gateway rd', 'jem jurong gateway', 'westgate jurong gateway', 'jcube'],
    road: 'Jurong Gateway Road',
  },
  {
    name: 'Boon Lay Way',
    area: 'Jurong / Boon Lay',
    category: 'Road',
    lat: 1.3348,
    lng: 103.7445,
    aliases: ['boon lay way', 'imm boon lay way', 'jurong east mrt boon lay way'],
    road: 'Boon Lay Way',
  },
  {
    name: 'Toh Guan Road',
    area: 'Jurong East',
    category: 'Road',
    lat: 1.3385,
    lng: 103.7482,
    aliases: ['toh guan rd', 'imm carpark toh guan road'],
    road: 'Toh Guan Road',
  },
  {
    name: 'Jurong East Central',
    area: 'Jurong East',
    category: 'Road',
    lat: 1.3338,
    lng: 103.7422,
    aliases: ['jurong east central', 'jurong east bus interchange'],
    road: 'Jurong East Central',
  },
  {
    name: 'Clementi Avenue 3',
    area: 'Clementi',
    category: 'Road',
    lat: 1.3151,
    lng: 103.7654,
    aliases: ['clementi ave 3', 'the clementi mall', 'clementi central'],
    road: 'Clementi Avenue 3',
  },
  {
    name: 'Commonwealth Avenue',
    area: 'Queenstown / Buona Vista',
    category: 'Road',
    lat: 1.3021,
    lng: 103.7905,
    aliases: ['commonwealth ave', 'star vista buona vista', 'one-north'],
    road: 'Commonwealth Avenue',
  },
  {
    name: 'Bukit Batok Central',
    area: 'Bukit Batok',
    category: 'Road',
    lat: 1.3498,
    lng: 103.7495,
    aliases: ['bukit batok central', 'west mall bukit batok'],
    road: 'Bukit Batok Central',
  },

  // ==========================================
  // EAST: TAMPINES, BEDOK, PASIR RIS, CHANGI
  // ==========================================
  {
    name: 'Tampines Avenue 4',
    area: 'Tampines',
    category: 'Road',
    lat: 1.3535,
    lng: 103.9442,
    aliases: ['tampines ave 4', 'tampines mall ave 4', 'our tampines hub ave 4'],
    road: 'Tampines Avenue 4',
  },
  {
    name: 'Tampines Central 1',
    area: 'Tampines',
    category: 'Road',
    lat: 1.3528,
    lng: 103.9451,
    aliases: ['tampines central 1', 'tampines 1 central', 'century square'],
    road: 'Tampines Central 1',
  },
  {
    name: 'Tampines Avenue 5',
    area: 'Tampines',
    category: 'Road',
    lat: 1.3548,
    lng: 103.9412,
    aliases: ['tampines ave 5', 'our tampines hub'],
    road: 'Tampines Avenue 5',
  },
  {
    name: 'Bedok North Street 1',
    area: 'Bedok',
    category: 'Road',
    lat: 1.3255,
    lng: 103.9302,
    aliases: ['bedok north st 1', 'bedok mall', 'bedok interchange hawker centre'],
    road: 'Bedok North Street 1',
  },
  {
    name: 'Changi Road',
    area: 'Geylang Serai / Eunos',
    category: 'Road',
    lat: 1.3182,
    lng: 103.9015,
    aliases: ['changi rd', 'geylang serai market changi road', 'wisma geylang serai'],
    road: 'Changi Road',
  },
  {
    name: 'Geylang Road',
    area: 'Geylang / Kallang',
    category: 'Road',
    lat: 1.3134,
    lng: 103.8821,
    aliases: ['geylang rd', 'lorong geylang', 'plq mall paya lebar'],
    road: 'Geylang Road',
  },
  {
    name: 'Paya Lebar Road',
    area: 'Paya Lebar',
    category: 'Road',
    lat: 1.3185,
    lng: 103.8925,
    aliases: ['paya lebar rd', 'paya lebar square', 'singpost centre paya lebar'],
    road: 'Paya Lebar Road',
  },
  {
    name: 'Marine Parade Road',
    area: 'Marine Parade',
    category: 'Road',
    lat: 1.3025,
    lng: 103.9052,
    aliases: ['marine parade rd', 'parkway parade marine parade road'],
    road: 'Marine Parade Road',
  },
  {
    name: 'Airport Boulevard',
    area: 'Changi',
    category: 'Road',
    lat: 1.3602,
    lng: 103.9898,
    aliases: ['airport blvd', 'jewel changi airport boulevard', 'changi terminal 1 2 3'],
    road: 'Airport Boulevard',
  },
  {
    name: 'Pasir Ris Drive 3',
    area: 'Pasir Ris',
    category: 'Road',
    lat: 1.3725,
    lng: 103.9492,
    aliases: ['pasir ris dr 3', 'white sands pasir ris dr 3', 'downtown east'],
    road: 'Pasir Ris Drive 3',
  },

  // ==========================================
  // NORTH & CENTRAL: ANG MO KIO, BISHAN, TOA PAYOH, WOODLANDS, YISHUN
  // ==========================================
  {
    name: 'Ang Mo Kio Avenue 3',
    area: 'Ang Mo Kio',
    category: 'Road',
    lat: 1.3692,
    lng: 103.8498,
    aliases: ['ang mo kio ave 3', 'amk hub', 'amk ave 3', 'ang mo kio central'],
    road: 'Ang Mo Kio Avenue 3',
  },
  {
    name: 'Ang Mo Kio Avenue 6',
    area: 'Ang Mo Kio',
    category: 'Road',
    lat: 1.3752,
    lng: 103.8471,
    aliases: ['amk ave 6', 'ang mo kio ave 6', 'yio chu kang'],
    road: 'Ang Mo Kio Avenue 6',
  },
  {
    name: 'Bishan Street 13',
    area: 'Bishan',
    category: 'Road',
    lat: 1.3508,
    lng: 103.8488,
    aliases: ['bishan st 13', 'junction 8 bishan st 13', 'bishan bus interchange'],
    road: 'Bishan Street 13',
  },
  {
    name: 'Toa Payoh Central',
    area: 'Toa Payoh',
    category: 'Road',
    lat: 1.3325,
    lng: 103.8482,
    aliases: ['toa payoh central', 'hdb hub toa payoh', 'toa payoh bus interchange'],
    road: 'Toa Payoh Central',
  },
  {
    name: 'Woodlands Square',
    area: 'Woodlands',
    category: 'Road',
    lat: 1.4365,
    lng: 103.7865,
    aliases: ['woodlands sq', 'causeway point woodlands square', 'woods square'],
    road: 'Woodlands Square',
  },
  {
    name: 'Woodlands Avenue 2',
    area: 'Woodlands',
    category: 'Road',
    lat: 1.4385,
    lng: 103.7882,
    aliases: ['woodlands ave 2', 'woodlands civic centre'],
    road: 'Woodlands Avenue 2',
  },
  {
    name: 'Yishun Avenue 2',
    area: 'Yishun',
    category: 'Road',
    lat: 1.4295,
    lng: 103.8355,
    aliases: ['yishun ave 2', 'northpoint city yishun ave 2', 'yishun central'],
    road: 'Yishun Avenue 2',
  },
  {
    name: 'Serangoon Central',
    area: 'Serangoon',
    category: 'Road',
    lat: 1.3505,
    lng: 103.8732,
    aliases: ['serangoon central', 'nex mall serangoon central', 'serangoon bus interchange'],
    road: 'Serangoon Central',
  },
  {
    name: 'Punggol Central',
    area: 'Punggol',
    category: 'Road',
    lat: 1.4042,
    lng: 103.9021,
    aliases: ['punggol central', 'waterway point punggol central'],
    road: 'Punggol Central',
  },
  {
    name: 'Sengkang Square',
    area: 'Sengkang',
    category: 'Road',
    lat: 1.3918,
    lng: 103.8955,
    aliases: ['sengkang sq', 'compass one sengkang square', 'sengkang bus interchange'],
    road: 'Sengkang Square',
  },

  // ==========================================
  // MAJOR BUILDINGS & SHOPPING COMPLEXES
  // ==========================================
  {
    name: 'ION Orchard',
    area: 'Orchard',
    category: 'Building',
    lat: 1.3040,
    lng: 103.8320,
    aliases: ['ion', 'ion carpark', 'orchard turn'],
    road: '2 Orchard Turn',
  },
  {
    name: 'Takashimaya / Ngee Ann City',
    area: 'Orchard',
    category: 'Building',
    lat: 1.3025,
    lng: 103.8348,
    aliases: ['takashimaya', 'ngee ann city', 'taka'],
    road: '391 Orchard Road',
  },
  {
    name: 'Paragon Shopping Centre',
    area: 'Orchard',
    category: 'Building',
    lat: 1.3039,
    lng: 103.8358,
    aliases: ['paragon', 'paragon medical'],
    road: '290 Orchard Road',
  },
  {
    name: '313@Somerset',
    area: 'Orchard',
    category: 'Building',
    lat: 1.3009,
    lng: 103.8383,
    aliases: ['313 somerset', '313', 'somerset mall'],
    road: '313 Orchard Road',
  },
  {
    name: 'Marina Bay Sands (MBS)',
    area: 'Marina Bay',
    category: 'Building',
    lat: 1.2838,
    lng: 103.8591,
    aliases: ['mbs', 'marina bay sands hotel', 'the shoppes at mbs', 'mbs casino'],
    road: '10 Bayfront Avenue',
  },
  {
    name: 'Suntec City',
    area: 'Marina Centre',
    category: 'Building',
    lat: 1.2935,
    lng: 103.8572,
    aliases: ['suntec', 'suntec convention centre', 'suntec tower'],
    road: '3 Temasek Boulevard',
  },
  {
    name: 'VivoCity & HarbourFront Centre',
    area: 'HarbourFront',
    category: 'Building',
    lat: 1.2644,
    lng: 103.8222,
    aliases: ['vivocity', 'vivo', 'harbourfront centre', 'sentosa gateway'],
    road: '1 HarbourFront Walk',
  },
  {
    name: 'JEM & Westgate',
    area: 'Jurong East',
    category: 'Building',
    lat: 1.3331,
    lng: 103.7436,
    aliases: ['jem', 'westgate', 'jem shopping mall', 'jurong gateway mall'],
    road: '50 Jurong Gateway Road',
  },
  {
    name: 'Tampines Mall & Century Square',
    area: 'Tampines',
    category: 'Building',
    lat: 1.3532,
    lng: 103.9452,
    aliases: ['tampines mall', 'century square', 'tampines 1'],
    road: '4 Tampines Central 5',
  },
  {
    name: 'Guoco Tower (Tanjong Pagar)',
    area: 'Tanjong Pagar',
    category: 'Building',
    lat: 1.2768,
    lng: 103.8458,
    aliases: ['guoco tower', 'tanjong pagar centre', 'wallich residence'],
    road: '1 Wallich Street',
  },
  {
    name: 'Capital Tower',
    area: 'CBD / Tanjong Pagar',
    category: 'Building',
    lat: 1.2775,
    lng: 103.8475,
    aliases: ['capital tower robinson road', 'gic capital tower'],
    road: '168 Robinson Road',
  },
  {
    name: 'One Raffles Place',
    area: 'Raffles Place / CBD',
    category: 'Building',
    lat: 1.2842,
    lng: 103.8512,
    aliases: ['one raffles place', 'oubh building', 'orp'],
    road: '1 Raffles Place',
  },
  {
    name: 'Bugis Junction & Bugis+',
    area: 'Bugis',
    category: 'Building',
    lat: 1.3006,
    lng: 103.8553,
    aliases: ['bugis junction', 'bugis+', 'bugis street'],
    road: '200 Victoria Street',
  },
  {
    name: 'Jewel Changi Airport',
    area: 'Changi',
    category: 'Building',
    lat: 1.3602,
    lng: 103.9898,
    aliases: ['jewel', 'jewel changi', 'vortex waterfall changi'],
    road: '78 Airport Boulevard',
  },
];

/**
 * Normalizes Singapore road queries and common abbreviations
 */
export function normalizeSingaporeRoadQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/\bave\b/g, 'avenue')
    .replace(/\brd\b/g, 'road')
    .replace(/\bst\b/g, 'street')
    .replace(/\bdr\b/g, 'drive')
    .replace(/\bcres\b/g, 'crescent')
    .replace(/\bcl\b/g, 'close')
    .replace(/\bpl\b/g, 'place')
    .replace(/\bct\b/g, 'court')
    .replace(/\bsq\b/g, 'square')
    .replace(/\bjln\b/g, 'jalan')
    .replace(/\blor\b/g, 'lorong')
    .replace(/\bbt\b/g, 'bukit')
    .replace(/\bhwy\b/g, 'highway')
    .replace(/\bblvd\b/g, 'boulevard')
    .replace(/\s+/g, ' ');
}

/**
 * Fast synchronous search across Singapore roads, buildings, and carpark addresses
 */
export function searchLocalSingaporeLocations(
  rawQuery: string,
  carparks: Carpark[] = []
): SearchLocation[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const normalized = normalizeSingaporeRoadQuery(rawQuery);
  const results: SearchLocation[] = [];
  const seenIds = new Set<string>();

  // 1. Search known Singapore roads and buildings
  for (const item of SINGAPORE_ROADS_AND_BUILDINGS) {
    const nameLower = item.name.toLowerCase();
    const areaLower = item.area.toLowerCase();
    const roadLower = (item.road || '').toLowerCase();
    const normalizedName = normalizeSingaporeRoadQuery(item.name);
    const aliases = (item.aliases || []).map((a) => a.toLowerCase());

    const isMatch =
      nameLower.includes(query) ||
      normalizedName.includes(normalized) ||
      areaLower.includes(query) ||
      roadLower.includes(query) ||
      aliases.some((a) => a.includes(query) || a.includes(normalized));

    if (isMatch) {
      const id = `loc-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id,
          name: item.name,
          area: item.area,
          category: item.category,
          coordinates: { lat: item.lat, lng: item.lng },
          road: item.road,
        });
      }
    }
  }

  // 2. Search carpark street addresses & names to guarantee any street in the carpark dataset matches
  for (const cp of carparks) {
    const cpNameLower = cp.name.toLowerCase();
    const cpAddressLower = cp.address.toLowerCase();
    const normalizedAddr = normalizeSingaporeRoadQuery(cp.address);

    if (
      cpNameLower.includes(query) ||
      cpAddressLower.includes(query) ||
      normalizedAddr.includes(normalized)
    ) {
      const id = `cp-loc-${cp.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        results.push({
          id,
          name: cp.name,
          area: cp.area,
          category: cp.agency === 'Mall' ? 'Building' : 'Road',
          coordinates: { ...cp.coordinates },
          road: cp.address,
        });
      }
    }
  }

  return results.slice(0, 8);
}

/**
 * Full Location Resolver:
 * Checks local Singapore database + carparks, and queries /api/geocode if needed
 */
export async function resolveSingaporeLocation(
  rawQuery: string,
  carparks: Carpark[] = []
): Promise<SearchLocation | null> {
  const clean = rawQuery.trim();
  if (!clean) return null;

  // 1. Try local exact or high-confidence match
  const localMatches = searchLocalSingaporeLocations(clean, carparks);
  if (localMatches.length > 0) {
    // Pick the most relevant match
    const exact = localMatches.find(
      (m) =>
        m.name.toLowerCase() === clean.toLowerCase() ||
        normalizeSingaporeRoadQuery(m.name) === normalizeSingaporeRoadQuery(clean)
    );
    return exact || localMatches[0];
  }

  // 2. Query serverless geocoding endpoint (/api/geocode)
  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(clean)}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        const topResult = data.results[0];
        return {
          id: topResult.id || `geo-${Date.now()}`,
          name: topResult.name || clean,
          area: topResult.area || 'Singapore',
          category: topResult.category || 'Road',
          coordinates: topResult.coordinates,
          road: topResult.road || topResult.displayName,
          displayName: topResult.displayName,
        };
      }
    }
  } catch {
    // Geocode service network error
  }

  // Fallback: If totally unknown, return null
  return null;
}
