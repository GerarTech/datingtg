import { UserProfile } from '../context/AppContext';
import { DatingIntent } from '../lib/yeneFeatures';

export const SAMPLE_PROFILES: UserProfile[] = [
  {
    id: 'sofia-7591',
    username: 'sofia',
    name: 'Sofia',
    age: 24,
    gender: 'Woman',
    interests: ['Art', 'Coffee', 'Travel'],
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop&crop=face'
    ],
    distance: '2 km away',
    bio: `Looking for someone to explore hidden coffee shops with. I love photography and street art.`,
    isVerified: true,
    isOnline: true,
    datingIntent: 'serious' as DatingIntent,
  },
  {
    id: 'james-2210',
    username: 'james',
    name: 'James',
    age: 27,
    gender: 'Man',
    interests: ['Fitness', 'Music', 'Gaming'],
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop&crop=face'
    ],
    distance: '5 km away',
    bio: `Music producer by day, gamer by night. Let's find a beat together.`,
    isVerified: false,
    isOnline: false,
    datingIntent: 'casual' as DatingIntent,
  },
  {
    id: 'elena-8842',
    username: 'elena',
    name: 'Elena',
    age: 22,
    gender: 'Woman',
    interests: ['Movies', 'Cooking', 'Travel'],
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop&crop=face'
    ],
    distance: '3 km away',
    bio: `Aspiring chef. I can make a mean pasta. Tell me your favorite movie!`,
    isVerified: true,
    isOnline: true,
    datingIntent: 'open' as DatingIntent,
  },
  {
    id: 'marcus-3465',
    username: 'marcus',
    name: 'Marcus',
    age: 29,
    gender: 'Man',
    interests: ['Travel', 'Business', 'Art'],
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=face'
    ],
    distance: '1 km away',
    bio: `Entrepreneur. Always learning. Let's grab a coffee and talk about life.`,
    isVerified: false,
    isOnline: true,
    datingIntent: 'serious' as DatingIntent,
  },
  {
    id: 'luna-6622',
    username: 'luna',
    name: 'Luna',
    age: 25,
    gender: 'Woman',
    interests: ['Reading', 'Yoga', 'Nature'],
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop&crop=face'
    ],
    distance: '4 km away',
    bio: `Book lover and nature enthusiast. Let's go for a hike and discuss our favorite novels.`,
    isVerified: true,
    isOnline: false,
    datingIntent: 'friends' as DatingIntent,
  }
];