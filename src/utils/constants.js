export const ITEM_CATEGORIES = [
  'Electronics',
  'Bags & Wallets',
  'Keys & IDs',
  'Documents & Passports',
  'Clothing & Accessories',
  'Valuables & Jewelry',
  'Sporting Equipment',
  'Others'
];

export const PUBLIC_LOCATIONS = [
  'Airport & Flight Terminals',
  'Metro & Railway Stations',
  'City Public Libraries',
  'Shopping Malls & Retail Centers',
  'City Parks & Public Plazas',
  'Bus Terminals & Transit Stops',
  'Sports Stadiums & Arenas',
  'Museums & Cultural Centers',
  'Government & Municipal Buildings',
  'Cafes, Food Courts & Restaurants'
];

export const ITEM_TYPES = {
  LOST: 'lost',
  FOUND: 'found'
};

export const ITEM_STATUSES = {
  ACTIVE: 'active',
  IN_HANDOVER: 'in_handover',
  RETURNED: 'returned'
};

export const CLAIM_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
};

export const DEMO_USERS = [
  {
    id: 'demo_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@publicmail.com',
    role: 'Community Member / Commuter',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'demo_jordan',
    name: 'Jordan Smith',
    email: 'jordan.smith@transitstation.org',
    role: 'Public Transit Station Staff',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'demo_officer_miller',
    name: 'Officer Davis',
    email: 'davis.security@citycenter.gov',
    role: 'Public Facility Security Officer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const SEED_ITEMS = [
  {
    id: 'item_seed_1',
    type: 'found',
    title: 'Black HP Pavilion 15-inch Laptop',
    category: 'Electronics',
    publicLocation: 'Metro & Railway Stations',
    location: 'Central Metro Station - Platform 2 Waiting Bench',
    date: '2026-10-10',
    description: 'Found unattended laptop on waiting bench with charger. Has several tech stickers on the outer lid.',
    secretVerificationQuestion: 'What specific blue sticker is placed next to the trackpad?',
    imageBase64: '',
    hasImage: false,
    reporterId: 'demo_jordan',
    reporterName: 'Jordan Smith',
    reporterEmail: 'jordan.smith@transitstation.org',
    status: 'active',
    activeClaimId: null,
    createdAt: 1728560000000
  },
  {
    id: 'item_seed_2',
    type: 'lost',
    title: 'HP 15-inch Laptop with NASA & GitHub Stickers',
    category: 'Electronics',
    publicLocation: 'Metro & Railway Stations',
    location: 'Central Metro Line or ticketing counter area',
    date: '2026-10-10',
    description: 'Accidentally left my black HP laptop while boarding the train during evening rush hour.',
    secretVerificationQuestion: '',
    imageBase64: '',
    hasImage: false,
    reporterId: 'demo_alex',
    reporterName: 'Alex Rivera',
    reporterEmail: 'alex.rivera@publicmail.com',
    status: 'active',
    activeClaimId: null,
    createdAt: 1728565000000
  },
  {
    id: 'item_seed_3',
    type: 'found',
    title: 'Blue 32oz Hydro Flask Water Bottle',
    category: 'Sporting Equipment',
    publicLocation: 'City Parks & Public Plazas',
    location: 'Central City Park - Bench near the children playground and fountain',
    date: '2026-10-11',
    description: 'Pacific blue insulated water bottle with a small dent near the bottom rim.',
    secretVerificationQuestion: 'What unique initial or engraving is on the bottom rubber boot?',
    imageBase64: '',
    hasImage: false,
    reporterId: 'demo_officer_miller',
    reporterName: 'Officer Davis',
    reporterEmail: 'davis.security@citycenter.gov',
    status: 'active',
    activeClaimId: null,
    createdAt: 1728650000000
  },
  {
    id: 'item_seed_4',
    type: 'lost',
    title: 'Pacific Blue Hydro Flask 32oz',
    category: 'Sporting Equipment',
    publicLocation: 'City Parks & Public Plazas',
    location: 'Central City Park picnic area',
    date: '2026-10-11',
    description: 'Left my favorite water bottle after jogging in the park on Sunday afternoon.',
    secretVerificationQuestion: '',
    imageBase64: '',
    hasImage: false,
    reporterId: 'demo_alex',
    reporterName: 'Alex Rivera',
    reporterEmail: 'alex.rivera@publicmail.com',
    status: 'active',
    activeClaimId: null,
    createdAt: 1728655000000
  },
  {
    id: 'item_seed_5',
    type: 'found',
    title: 'Brown Leather Bi-Fold Wallet',
    category: 'Bags & Wallets',
    publicLocation: 'Shopping Malls & Retail Centers',
    location: 'Westfield City Mall - Food Court seating area',
    date: '2026-10-12',
    description: 'Leather wallet containing ID card and transit pass. Safely stored at Mall Information Desk.',
    secretVerificationQuestion: 'What is the full first and last name on the government ID inside?',
    imageBase64: '',
    hasImage: false,
    reporterId: 'demo_jordan',
    reporterName: 'Jordan Smith',
    reporterEmail: 'jordan.smith@transitstation.org',
    status: 'active',
    activeClaimId: null,
    createdAt: 1728730000000
  }
];
