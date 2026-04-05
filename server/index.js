const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

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

// List profiles with basic filters
app.get('/api/profiles', (req, res) => {
  const {
    ageMin,
    ageMax,
    gender,
    distance,
  } = req.query;

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

  res.json(result);
});

// Upsert user profile (called from onboarding or profile save)
app.post('/api/users', (req, res) => {
  const user = req.body;
  if (!user || !user.id) {
    return res.status(400).json({ error: 'User id is required' });
  }
  upsertProfile(user);
  res.json(user);
});

app.get('/api/users/:id', (req, res) => {
  const user = profiles.find(p => p.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Verification requests
app.post('/api/verification-requests', (req, res) => {
  const { userId, selfieDataUrl } = req.body;
  if (!userId || !selfieDataUrl) {
    return res.status(400).json({ error: 'userId and selfieDataUrl are required' });
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

