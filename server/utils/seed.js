require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');

const REVIEW_POOL = [
  { name: 'Jose', avatar: 'https://i.pravatar.cc/80?img=12', date: 'December 2021', comment: 'Host was very attentive.' },
  { name: 'Luke', avatar: 'https://i.pravatar.cc/80?img=13', date: 'December 2021', comment: 'Nice place to stay!' },
  {
    name: 'Shayna',
    avatar: 'https://i.pravatar.cc/80?img=32',
    date: 'December 2021',
    comment: 'Wonderful neighborhood, easy access to restaurants and transit. Cozy and comfortable, great host.',
  },
  {
    name: 'Josh',
    avatar: 'https://i.pravatar.cc/80?img=14',
    date: 'November 2021',
    comment: 'Well designed and fun space, neighborhood has lots of energy and amenities.',
  },
];

function ratingBreakdown(rating) {
  return {
    Cleanliness: rating,
    Accuracy: rating,
    Communication: rating,
    Location: Math.max(4, rating - 0.1),
    'Check-in': rating,
    Value: Math.max(4, rating - 0.2),
  };
}

const NEW_YORK = [
  {
    title: 'Studio with Juliet Balcony',
    description: 'A bright, efficiently laid-out studio above Times Square with a Juliet balcony looking down over the neon lights. Wake up to the buzz of the city and step straight into the heart of the action.',
    type: 'Entire apartment',
    pricePerNight: 210, cleaningFee: 50, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Air conditioning', 'Elevator', 'City view', 'Juliet balcony'],
    images: [
      'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=1000&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
    ],
    rating: 4.3, reviewCount: 289,
  },
  {
    title: 'Tripoli Artisan Loft',
    description: 'A sleek, artisan-finished loft in the heart of New York City with floor-to-ceiling windows and exposed steelwork looking out over the skyline. Minutes from the subway, top restaurants, and Central Park.',
    type: 'Entire apartment',
    pricePerNight: 320, cleaningFee: 75, guests: 4, bedrooms: 2, beds: 2, baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Elevator', 'Air conditioning', 'Washer', 'Dryer', 'Gym access', 'Doorman'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
    rating: 4.5, reviewCount: 320, superhost: true,
  },
  {
    title: 'Garden Apartment in Brooklyn',
    description: 'A classic Brooklyn garden apartment with exposed brick, a private back garden, and quick access to the L train. Perfect for exploring Williamsburg and DUMBO.',
    type: 'Entire home',
    pricePerNight: 245, cleaningFee: 60, guests: 5, bedrooms: 2, beds: 3, baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Garden', 'Washer', 'Free Parking', 'Heating'],
    images: [
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1000&q=80',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
    ],
    rating: 4.7, reviewCount: 168,
  },
  {
    title: 'Elegant Uptown Historic District Garden Suite',
    description: 'A spacious, elegant suite in an Upper West Side historic brownstone near Central Park and the Museum of Natural History, with its own garden-facing sitting room. Ideal for families wanting a residential feel close to it all.',
    type: 'Entire apartment',
    pricePerNight: 275, cleaningFee: 65, guests: 6, bedrooms: 3, beds: 3, baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Dryer', 'Elevator', 'Free Parking', 'Heating', 'Garden view'],
    images: [
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1000&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    ],
    rating: 4.8, reviewCount: 142, superhost: true,
  },
];

const PARIS = [
  {
    title: 'Haut-Marais Designer Apartment',
    description: 'A stylish, architect-renovated flat in the trendy Haut-Marais surrounded by concept boutiques, galleries, and some of the best falafel in the city.',
    type: 'Entire apartment',
    pricePerNight: 220, cleaningFee: 55, guests: 3, bedrooms: 1, beds: 2, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Air conditioning', 'Washer', 'Elevator'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
    ],
    rating: 4.85, reviewCount: 173,
  },
  {
    title: 'Louvre Luxury 1-Bedroom',
    description: 'A classic Haussmannian one-bedroom with herringbone floors and a Juliet balcony, a short walk from the Louvre and the Seine.',
    type: 'Entire home',
    pricePerNight: 400, cleaningFee: 83, guests: 6, bedrooms: 3, beds: 3, baths: 3,
    amenities: ['Wifi', 'Kitchen', 'Free Parking', 'Heating', 'Washer', 'Balcony', 'Dedicated workspace'],
    images: [
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=80',
      'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    ],
    rating: 4.7, reviewCount: 250, superhost: true,
  },
  {
    title: 'Canal Saint-Martin Family Flat ("My Canal Flat")',
    description: 'A spacious family flat with a private terrace overlooking the Canal Saint-Martin. Stroll the towpath to cafes and bookshops, or walk to the Champs-Elysees and Arc de Triomphe.',
    type: 'Whole Villa',
    pricePerNight: 520, cleaningFee: 110, guests: 8, bedrooms: 4, beds: 5, baths: 4,
    amenities: ['Wifi', 'Kitchen', 'Terrace', 'Air conditioning', 'Elevator', 'Free Parking', 'Canal view'],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000&q=80',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&q=80',
    ],
    rating: 5, reviewCount: 61, superhost: true,
  },
  {
    title: 'Montmartre Duplex in Abbesses',
    description: 'A light-filled duplex on the cobbled streets of Abbesses in Montmartre, steps from Sacre-Coeur and the artists of Place du Tertre.',
    type: 'Entire apartment',
    pricePerNight: 165, cleaningFee: 45, guests: 4, bedrooms: 2, beds: 2, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Heating', 'City view'],
    images: [
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1000&q=80',
      'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800&q=80',
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    ],
    rating: 4.9, reviewCount: 96,
  },
];

const TOKYO = [
  {
    title: 'Tokyo Kids Castle (Toshima-ku)',
    description: 'A bright, family-friendly two-bedroom in Toshima-ku, close to Ikebukuro\'s kid-friendly attractions and easy access to the city center by train.',
    type: 'Entire apartment',
    pricePerNight: 175, cleaningFee: 45, guests: 4, bedrooms: 2, beds: 2, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Family friendly'],
    images: [
      'https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=1000&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    ],
    rating: 4.5, reviewCount: 137,
  },
  {
    title: 'Stay Ari Arakicho B',
    description: 'A quiet, tatami-floored room in the small entertainment district of Arakicho, blending old Tokyo charm with modern comfort just minutes from Yotsuya and Shinjuku.',
    type: 'Private room',
    pricePerNight: 95, cleaningFee: 25, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ['Wifi', 'Shared kitchen', 'Heating', 'Traditional bath'],
    images: [
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1000&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
      'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80',
      'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=800&q=80',
    ],
    rating: 4.9, reviewCount: 88,
  },
  {
    title: 'Minato City Tokyo Tower View Retreat',
    description: 'A high-rise retreat in Minato City with panoramic views of Tokyo Tower. Steps from world-class dining, embassies, and train lines.',
    type: 'Entire apartment',
    pricePerNight: 210, cleaningFee: 50, guests: 3, bedrooms: 1, beds: 2, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Air conditioning', 'Elevator', 'Tokyo Tower view'],
    images: [
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1000&q=80',
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
    ],
    rating: 4.6, reviewCount: 204, superhost: true,
  },
  {
    title: 'Shibuya Comfort Suite',
    description: 'A compact, thoughtfully designed suite steps from Shibuya Crossing. A great base for exploring Tokyo by train.',
    type: 'Private room',
    pricePerNight: 150, cleaningFee: 40, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Heating'],
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1000&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
      'https://images.unsplash.com/photo-1522547902298-51566e4fb383?w=800&q=80',
      'https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&q=80',
      'https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&q=80',
    ],
    rating: 4.2, reviewCount: 180,
  },
];

const CAPE_TOWN = [
  {
    title: 'Sea Point Studio Apartment',
    description: 'A modern studio steps from the Sea Point Promenade, walking distance to the harbour, shops, and the ferry to Robben Island.',
    type: 'Entire apartment',
    pricePerNight: 155, cleaningFee: 40, guests: 3, bedrooms: 1, beds: 2, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Elevator', 'Harbour view', 'Air conditioning'],
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1000&q=80',
      'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=800&q=80',
    ],
    rating: 4.75, reviewCount: 154,
  },
  {
    title: "Mouille Point Water's Edge Apartment",
    description: 'Wake up to the sound of the Atlantic. This apartment sits right on the water\'s edge in Mouille Point, minutes from the lighthouse promenade and the V&A Waterfront.',
    type: 'Entire apartment',
    pricePerNight: 190, cleaningFee: 50, guests: 4, bedrooms: 2, beds: 2, baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Beach access', 'Air conditioning', 'Balcony'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
    ],
    rating: 4.8, reviewCount: 211,
  },
  {
    title: 'Camps Bay Luxury Villa',
    description: 'A bright, airy villa with a private pool and unobstructed views of Table Mountain. Close to Camps Bay beach and the V&A Waterfront.',
    type: 'Whole Villa',
    pricePerNight: 165, cleaningFee: 60, guests: 6, bedrooms: 3, beds: 4, baths: 3,
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Free Parking', 'Mountain view', 'Braai/BBQ area', 'Air conditioning'],
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    ],
    rating: 4.92, reviewCount: 189, superhost: true,
  },
  {
    title: 'Kalk Bay Trendy Vintage Home',
    description: "A rustic-chic vintage home tucked above Kalk Bay's fishing harbour, filled with antique finds and quirky character. Quiet, close to the tidal pool, and 20 minutes from the city center.",
    type: 'Entire home',
    pricePerNight: 135, cleaningFee: 35, guests: 4, bedrooms: 2, beds: 2, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Free Parking', 'Garden', 'Fireplace', 'Harbour view'],
    images: [
      'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=1000&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800&q=80',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80',
    ],
    rating: 4.88, reviewCount: 77, superhost: true,
  },
];

const THAILAND = [
  {
    title: 'Kamala Beach Villa',
    description: 'A tropical villa steps from the sand at Kamala Beach, with an open-air living area, a private pool, and lush garden views.',
    type: 'Whole Villa',
    pricePerNight: 175, cleaningFee: 45, guests: 5, bedrooms: 2, beds: 3, baths: 2,
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Free Parking', 'Beach access', 'Air conditioning', 'Garden view'],
    images: [
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1000&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800&q=80',
    ],
    rating: 4.88, reviewCount: 97, superhost: true,
  },
  {
    title: 'Lebua Tower Condo',
    description: "A high-floor tower condo along Bangkok's skyline with sweeping city views, close to the BTS and the city's best street food.",
    type: 'Entire apartment',
    pricePerNight: 90, cleaningFee: 25, guests: 3, bedrooms: 1, beds: 2, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Gym access', 'Air conditioning', 'City view'],
    images: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1000&q=80',
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&q=80',
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
    ],
    rating: 4.6, reviewCount: 143,
  },
  {
    title: "Eagle's Nest",
    description: 'A private pool villa perched on a hillside above Chaweng Beach on Koh Samui, with an outdoor rain shower, tropical garden, and daily housekeeping.',
    type: 'Whole Villa',
    pricePerNight: 145, cleaningFee: 35, guests: 6, bedrooms: 3, beds: 3, baths: 3,
    amenities: ['Wifi', 'Kitchen', 'Pool', 'Free Parking', 'Garden', 'Air conditioning', 'Outdoor shower'],
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1000&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    ],
    rating: 4.9, reviewCount: 66, superhost: true,
  },
  {
    title: 'Khanittha Homestay',
    description: 'A secluded wooden homestay run by a local family, surrounded by rice fields and jungle just outside Chiang Mai, with a hammock deck and mountain air.',
    type: 'Entire home',
    pricePerNight: 65, cleaningFee: 15, guests: 2, bedrooms: 1, beds: 1, baths: 1,
    amenities: ['Wifi', 'Kitchen', 'Free Parking', 'Mountain view', 'Fan'],
    images: [
      'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=1000&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?w=800&q=80',
    ],
    rating: 4.95, reviewCount: 52,
  },
];

const LOCATION_GROUPS = [
  { city: 'New York', country: 'USA', listings: NEW_YORK },
  { city: 'Paris', country: 'France', listings: PARIS },
  { city: 'Tokyo', country: 'Japan', listings: TOKYO },
  { city: 'Cape Town', country: 'South Africa', listings: CAPE_TOWN },
  { city: 'Thailand', country: 'Thailand', listings: THAILAND },
];

const HOST_META = {
  hostBio:
    'Ghazal is a Superhost. Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.',
  hostJoined: 'May 2021',
  hostResponseRate: 100,
  hostResponseTime: 'within an hour',
  hostVerified: true,
  hostAvatar: 'https://i.pravatar.cc/150?img=47',
};

function bedTypeFor(listing) {
  if (listing.beds >= 4) return `${listing.beds} beds`;
  if (listing.pricePerNight >= 300) return listing.beds > 1 ? `${listing.beds} king beds` : '1 king bed';
  if (listing.beds === 1) return '1 queen bed';
  return `${listing.beds} queen beds`;
}

async function seed() {
  await connectDB();

  await Promise.all([User.deleteMany({}), Listing.deleteMany({}), Reservation.deleteMany({})]);

  const password = await bcrypt.hash('password123', 10);

  const host = await User.create({ name: 'Ghazal', username: 'ghazal', password, role: 'host' });
  await User.create({ name: 'John Doe', username: 'johndoe', password, role: 'guest' });

  const listingsData = LOCATION_GROUPS.flatMap((group) =>
    group.listings.map((listing, i) => ({
      ...listing,
      city: group.city,
      country: group.country,
      image: listing.images[0],
      reviews: REVIEW_POOL.slice(0, 2 + (i % 3)),
      ratingBreakdown: ratingBreakdown(listing.rating),
      bedType: bedTypeFor(listing),
      securityDeposit: Math.round(listing.pricePerNight * 2),
      ...HOST_META,
    }))
  );

  await Listing.insertMany(listingsData.map((listing) => ({ ...listing, host: host._id })));

  console.log(`Seed complete: ${listingsData.length} listings across ${LOCATION_GROUPS.length} locations.`);
  console.log('Login as host: ghazal / password123, guest: johndoe / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
