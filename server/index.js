const express = require('express');
const cors = require('cors');
const { createTelegramAuthMiddleware } = require('./middleware/telegramAuth');
const { seenTrackerMiddleware } = require('./middleware/seenTracker');

const app = express();
const PORT = process.env.PORT || 4000;

// Load bot token from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('BOT_TOKEN environment variable is required');
  process.exit(1);
}

// Create Telegram auth middleware
const telegramAuth = createTelegramAuthMiddleware(BOT_TOKEN);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Apply seen tracking middleware
app.use(seenTrackerMiddleware);

// In-memory demo data. Replace with a real database in production.
let profiles = [];
let verificationRequests = [];

// Simple helper to ensure a profile exists in our store
function upsertProfile(profile) {
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = { ...profiles[existingIndex], ...profile };
  } else {
    profiles.push({ ...profile });
  }
}

// List profiles with basic filters - PROTECTED
app.get('/api/profiles', telegramAuth, async (req, res) => {
  const {
    ageMin,
    ageMax,
    gender,
    distance,
  } = req.query;

  const userId = req.telegramUser?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User authentication required' });
  }

  let result = profiles;

  if (ageMin || ageMax) {
    const min = Number(ageMin || 18);
    const max = Number(ageMax || 60);
    result = result.filter(p => p.age >= min && p.age <= max);
  }

  if (gender && ['Men', 'Women', 'Everyone'].includes(gender)) {
    if (gender === 'Men') {
      result = result.filter(p => p.gender === 'Man');
    } else if (gender === 'Women') {
      result = result.filter(p => p.gender === 'Woman');
    }
  }

  if (distance) {
    const maxDistance = Number(distance);
    result = result.filter(p => {
      if (!p.distance) return true;
      const numeric = parseInt(String(p.distance).split(' ')[0] || '0', 10);
      return numeric <= maxDistance;
    });
  }

  try {
    // Filter out already seen and swiped profiles
    if (req.seenTracker) {
      result = await req.seenTracker.filterUnseen(result);
    }
  } catch (error) {
    console.error('Error filtering unseen profiles:', error);
    // Continue with unfiltered results if seen tracking fails
  }

  res.json(result);
});

// Upsert user profile (called from onboarding or profile save) - PROTECTED
app.post('/api/users', telegramAuth, (req, res) => {
  const user = req.body;
  if (!user || !user.id) {
    return res.status(400).json({ error: 'User id is required' });
  }
  
  // Ensure the authenticated user matches the user being updated
  if (req.telegramUser && req.telegramUser.id !== user.id) {
    return res.status(403).json({ error: 'Forbidden: Cannot update other users' });
  }
  
  upsertProfile(user);
  res.json(user);
});

// Track swipe action - PROTECTED
app.post('/api/swipe', telegramAuth, async (req, res) => {
  const { profileId, direction } = req.body; // direction: 'left' or 'right'
  const userId = req.telegramUser?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'User authentication required' });
  }
  
  if (!profileId || !direction) {
    return res.status(400).json({ error: 'profileId and direction are required' });
  }
  
  try {
    if (req.seenTracker) {
      await req.seenTracker.addSwiped(profileId, direction);
      await req.seenTracker.addSeen(profileId); // Also mark as seen
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking swipe:', error);
    res.status(500).json({ error: 'Failed to track swipe' });
  }
});

// Get user statistics - PROTECTED
app.get('/api/user/stats', telegramAuth, async (req, res) => {
  const userId = req.telegramUser?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'User authentication required' });
  }
  
  try {
    if (req.seenTracker) {
      const stats = await req.seenTracker.getStats();
      res.json(stats);
    } else {
      res.json({ seenCount: 0, swipedCount: 0, uniqueProfiles: 0 });
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

app.get('/api/users/:id', (req, res) => {
  const user = profiles.find(p => p.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Verification requests - PROTECTED
app.post('/api/verification-requests', telegramAuth, (req, res) => {
  const { userId, selfieDataUrl } = req.body;
  if (!userId || !selfieDataUrl) {
    return res.status(400).json({ error: 'userId and selfieDataUrl are required' });
  }

  // Ensure the authenticated user matches the user making the request
  if (req.telegramUser && req.telegramUser.id.toString() !== userId) {
    return res.status(403).json({ error: 'Forbidden: Cannot create verification requests for other users' });
  }

  const id = Date.now().toString();
  verificationRequests.push({
    id,
    userId,
    selfieDataUrl,
    createdAt: Date.now(),
  });

  // Mark user as pending in our local store
  upsertProfile({ id: userId, verificationStatus: 'pending' });

  res.json({ id });
});

app.get('/api/verification-requests', (req, res) => {
  res.json(verificationRequests);
});

app.post('/api/verification-requests/:id/approve', (req, res) => {
  const id = req.params.id;
  const requestIndex = verificationRequests.findIndex(r => r.id === id);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const { userId } = verificationRequests[requestIndex];
  verificationRequests.splice(requestIndex, 1);

  upsertProfile({ id: userId, isVerified: true, verificationStatus: 'verified' });

  res.json({ success: true });
});

app.post('/api/verification-requests/:id/decline', (req, res) => {
  const id = req.params.id;
  const requestIndex = verificationRequests.findIndex(r => r.id === id);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  verificationRequests.splice(requestIndex, 1);
  res.json({ success: true });
});

// Get all users for admin panel
app.get('/api/users', (req, res) => {
  res.json(profiles);
});

// Update user (for admin verification management)
app.patch('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;

  const userIndex = profiles.findIndex(p => p.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  profiles[userIndex] = { ...profiles[userIndex], ...updates };
  res.json(profiles[userIndex]);
});

// Delete user (admin function)
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const userIndex = profiles.findIndex(p => p.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  profiles.splice(userIndex, 1);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

