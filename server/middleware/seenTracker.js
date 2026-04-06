// In-memory seen tracking (replace with Redis in production)
const seenProfiles = new Map(); // userId -> Set of seen profile IDs
const swipedProfiles = new Map(); // userId -> Set of swiped profile IDs

// Redis implementation (commented for demo, uncomment when Redis is available)
/*
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));
*/

class SeenTracker {
  // Add profile to user's seen list
  static async addSeen(userId, profileId) {
    try {
      // Redis implementation
      /*
      const key = `seen:${userId}`;
      await client.sadd(key, profileId);
      await client.expire(key, 30 * 24 * 60 * 60); // 30 days expiry
      */

      // In-memory implementation
      if (!seenProfiles.has(userId)) {
        seenProfiles.set(userId, new Set());
      }
      seenProfiles.get(userId).add(profileId);
      
      console.log(`User ${userId} seen profile ${profileId}`);
    } catch (error) {
      console.error('Error adding seen profile:', error);
    }
  }

  // Check if user has seen a profile
  static async hasSeen(userId, profileId) {
    try {
      // Redis implementation
      /*
      const key = `seen:${userId}`;
      const result = await client.sismember(key, profileId);
      return result === 1;
      */

      // In-memory implementation
      return seenProfiles.has(userId) && seenProfiles.get(userId).has(profileId);
    } catch (error) {
      console.error('Error checking seen profile:', error);
      return false;
    }
  }

  // Get all seen profiles for a user
  static async getSeenProfiles(userId) {
    try {
      // Redis implementation
      /*
      const key = `seen:${userId}`;
      const result = await client.smembers(key);
      return result;
      */

      // In-memory implementation
      return seenProfiles.has(userId) ? Array.from(seenProfiles.get(userId)) : [];
    } catch (error) {
      console.error('Error getting seen profiles:', error);
      return [];
    }
  }

  // Add profile to user's swiped list (left or right swipe)
  static async addSwiped(userId, profileId, direction = 'right') {
    try {
      // Redis implementation
      /*
      const key = `swiped:${userId}`;
      await client.sadd(key, profileId);
      await client.expire(key, 30 * 24 * 60 * 60); // 30 days expiry
      
      // Store swipe direction for analytics
      const directionKey = `swipe:${userId}:${profileId}`;
      await client.setex(directionKey, 30 * 24 * 60 * 60, direction);
      */

      // In-memory implementation
      if (!swipedProfiles.has(userId)) {
        swipedProfiles.set(userId, new Set());
      }
      swipedProfiles.get(userId).add(profileId);
      
      console.log(`User ${userId} swiped ${direction} on profile ${profileId}`);
    } catch (error) {
      console.error('Error adding swiped profile:', error);
    }
  }

  // Check if user has swiped on a profile
  static async hasSwiped(userId, profileId) {
    try {
      // Redis implementation
      /*
      const key = `swiped:${userId}`;
      const result = await client.sismember(key, profileId);
      return result === 1;
      */

      // In-memory implementation
      return swipedProfiles.has(userId) && swipedProfiles.get(userId).has(profileId);
    } catch (error) {
      console.error('Error checking swiped profile:', error);
      return false;
    }
  }

  // Get all swiped profiles for a user
  static async getSwipedProfiles(userId) {
    try {
      // Redis implementation
      /*
      const key = `swiped:${userId}`;
      const result = await client.smembers(key);
      return result;
      */

      // In-memory implementation
      return swipedProfiles.has(userId) ? Array.from(swipedProfiles.get(userId)) : [];
    } catch (error) {
      console.error('Error getting swiped profiles:', error);
      return [];
    }
  }

  // Filter out seen and swiped profiles from recommendations
  static async filterUnseenProfiles(userId, profiles) {
    try {
      const seenProfilesSet = await this.getSeenProfiles(userId);
      const swipedProfilesSet = await this.getSwipedProfiles(userId);
      
      const seenAndSwiped = new Set([...seenProfilesSet, ...swipedProfilesSet]);
      
      return profiles.filter(profile => !seenAndSwiped.has(profile.id));
    } catch (error) {
      console.error('Error filtering unseen profiles:', error);
      return profiles;
    }
  }

  // Clear user's seen history (for testing/reset)
  static async clearSeen(userId) {
    try {
      // Redis implementation
      /*
      await client.del(`seen:${userId}`);
      await client.del(`swiped:${userId}`);
      */

      // In-memory implementation
      seenProfiles.delete(userId);
      swipedProfiles.delete(userId);
      
      console.log(`Cleared seen and swiped history for user ${userId}`);
    } catch (error) {
      console.error('Error clearing seen history:', error);
    }
  }

  // Get statistics for a user
  static async getUserStats(userId) {
    try {
      const seenCount = (await this.getSeenProfiles(userId)).length;
      const swipedCount = (await this.getSwipedProfiles(userId)).length;
      
      return {
        seenCount,
        swipedCount,
        uniqueProfiles: Math.max(seenCount, swipedCount)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        seenCount: 0,
        swipedCount: 0,
        uniqueProfiles: 0
      };
    }
  }

  // Cleanup expired entries (for Redis implementation)
  static async cleanup() {
    try {
      // In-memory cleanup (not needed with Redis TTL)
      console.log('Seen tracker cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Express middleware to track seen profiles
const seenTrackerMiddleware = (req, res, next) => {
  const userId = req.user?.id || req.telegramUser?.id;
  
  if (userId) {
    req.seenTracker = {
      addSeen: (profileId) => SeenTracker.addSeen(userId, profileId),
      hasSeen: (profileId) => SeenTracker.hasSeen(userId, profileId),
      addSwiped: (profileId, direction) => SeenTracker.addSwiped(userId, profileId, direction),
      hasSwiped: (profileId) => SeenTracker.hasSwiped(userId, profileId),
      filterUnseen: (profiles) => SeenTracker.filterUnseenProfiles(userId, profiles),
      getStats: () => SeenTracker.getUserStats(userId)
    };
  }
  
  next();
};

module.exports = {
  SeenTracker,
  seenTrackerMiddleware
};
