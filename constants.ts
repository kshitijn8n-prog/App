import { Room } from "./types";

export const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    title: 'Modern Studio near Kings Cross',
    description: 'A newly renovated studio apartment perfect for students attending UCL or CSM. Features high-speed wifi, a dedicated study desk, and soundproof windows.',
    city: 'London',
    universityProximity: ['UCL (10 min walk)', 'Kings College (20 min bus)'],
    pricePerWeek: 450,
    type: 'Private Studio',
    amenities: ['Wifi', 'Gym', 'Security', 'Kitchen', 'Study Room'],
    images: [
      'https://picsum.photos/seed/room1/800/600',
      'https://picsum.photos/seed/room1b/800/600',
      'https://picsum.photos/seed/room1c/800/600'
    ],
    rating: 4.8,
    landlord: {
      id: 'l1',
      name: 'Sarah Jenkins',
      verified: true,
      joinedDate: '2021',
      responseRate: 98
    },
    availableFrom: '2024-09-01',
    reviews: [
      { id: 'r1', author: 'Li Wei', rating: 5, date: '2023-10-12', comment: 'Amazing location! Sarah is very helpful.', university: 'UCL' },
      { id: 'r2', author: 'Priya P.', rating: 4, date: '2023-11-05', comment: 'A bit pricey, but the amenities are worth it.', university: 'LSE' }
    ]
  },
  {
    id: '2',
    title: 'Cozy En-suite in Fallowfield',
    description: 'Join a vibrant student community in Manchester. Shared kitchen with 4 others, private bathroom. Weekly cleaning included.',
    city: 'Manchester',
    universityProximity: ['University of Manchester (15 min bus)', 'MMU (20 min bus)'],
    pricePerWeek: 185,
    type: 'En-suite',
    amenities: ['Wifi', 'Shared Lounge', 'Cleaning', 'Bike Storage'],
    images: [
      'https://picsum.photos/seed/room2/800/600',
      'https://picsum.photos/seed/room2b/800/600'
    ],
    rating: 4.5,
    landlord: {
      id: 'l2',
      name: 'MCR Student Living',
      verified: true,
      joinedDate: '2019',
      responseRate: 90
    },
    availableFrom: '2024-08-25',
    reviews: [
      { id: 'r3', author: 'Tom H.', rating: 5, date: '2023-09-20', comment: 'Best social life here.', university: 'UoM' },
      { id: 'r4', author: 'Ahmed K.', rating: 4, date: '2024-01-15', comment: 'Room is small but cozy.', university: 'MMU' }
    ]
  },
  {
    id: '3',
    title: 'Luxury Apartment Birmingham City Centre',
    description: 'High-end living with concierge service. Perfect for international students looking for comfort and safety.',
    city: 'Birmingham',
    universityProximity: ['Aston University (5 min walk)', 'University of Birmingham (15 min train)'],
    pricePerWeek: 290,
    type: 'Apartment',
    amenities: ['Concierge', 'Gym', 'Cinema Room', 'Washer/Dryer'],
    images: [
      'https://picsum.photos/seed/room3/800/600',
      'https://picsum.photos/seed/room3b/800/600'
    ],
    rating: 4.9,
    landlord: {
      id: 'l3',
      name: 'Prestige Stays',
      verified: true,
      joinedDate: '2022',
      responseRate: 100
    },
    availableFrom: '2024-09-10',
    reviews: [
      { id: 'r5', author: 'Elena R.', rating: 5, date: '2024-02-10', comment: 'Simply perfect. Safe and clean.', university: 'Aston' }
    ]
  },
  {
    id: '4',
    title: 'Affordable Shared Room - East London',
    description: 'Budget friendly option near Queen Mary. Large room shared with one other student. Great way to make friends.',
    city: 'London',
    universityProximity: ['Queen Mary (10 min walk)'],
    pricePerWeek: 140,
    type: 'Shared Room',
    amenities: ['Wifi', 'Garden', 'Kitchen'],
    images: [
      'https://picsum.photos/seed/room4/800/600'
    ],
    rating: 4.0,
    landlord: {
      id: 'l4',
      name: 'Davide C.',
      verified: false,
      joinedDate: '2023',
      responseRate: 85
    },
    availableFrom: '2024-09-01',
    reviews: [
      { id: 'r6', author: 'Chen L.', rating: 4, date: '2023-12-01', comment: 'Good for the price.', university: 'QMUL' }
    ]
  },
  {
    id: '5',
    title: 'Sunny Room in Edinburgh Old Town',
    description: 'Historic building with modern interiors. Close to the library and cafes.',
    city: 'Edinburgh',
    universityProximity: ['University of Edinburgh (5 min walk)'],
    pricePerWeek: 230,
    type: 'Private Studio',
    amenities: ['Wifi', 'Heating', 'View', 'Quiet Study Area'],
    images: [
      'https://picsum.photos/seed/room5/800/600'
    ],
    rating: 4.7,
    landlord: {
      id: 'l5',
      name: 'Highland Properties',
      verified: true,
      joinedDate: '2020',
      responseRate: 95
    },
    availableFrom: '2024-09-15',
    reviews: []
  },
    {
    id: '6',
    title: 'Bristol Harbourside En-suite',
    description: 'Waterfront views and easy access to the city centre. Modern building with great security.',
    city: 'Bristol',
    universityProximity: ['University of Bristol (20 min walk)'],
    pricePerWeek: 210,
    type: 'En-suite',
    amenities: ['Wifi', 'Bike Storage', 'Security', 'Common Room'],
    images: [
      'https://picsum.photos/seed/room6/800/600'
    ],
    rating: 4.6,
    landlord: {
      id: 'l6',
      name: 'Bristol Student Homes',
      verified: true,
      joinedDate: '2018',
      responseRate: 92
    },
    availableFrom: '2024-09-05',
    reviews: [
         { id: 'r7', author: 'Jack S.', rating: 5, date: '2023-11-20', comment: 'Great vibes and views.', university: 'UoB' }
    ]
  }
];