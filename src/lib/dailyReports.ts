// Daily Statistics and Reports System
import { UserProfile } from '../context/AppContext';

export interface DailyStats {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalSwipes: number;
  totalMatches: number;
  premiumConversions: number;
  topInterests: string[];
  topLocations: string[];
  averageAge: number;
  genderDistribution: {
    men: number;
    women: number;
    other: number;
  };
}

export interface ReportData {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  totalMatches: number;
  totalMessages: number;
  topGrowthCountries: string[];
}

// Mock data storage (use database in production)
const statsHistory: DailyStats[] = [];

export const generateDailyReport = (users: UserProfile[]): DailyStats => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayStats = {
    date: today,
    newUsers: users.filter(u => {
      const userDate = new Date(u.createdAt || Date.now()).toISOString().split('T')[0];
      return userDate === today;
    }).length,
    
    activeUsers: users.filter(u => {
      const lastSeen = u.lastSeenAt || 0;
      const hoursSinceActive = (Date.now() - lastSeen) / (1000 * 60 * 60);
      return hoursSinceActive < 24; // Active in last 24 hours
    }).length,
    
    totalSwipes: Math.floor(Math.random() * 500) + 100, // Mock data
    totalMatches: Math.floor(Math.random() * 50) + 10, // Mock data
    premiumConversions: users.filter(u => u.premiumPlus).length,
    
    // Calculate top interests
    const allInterests = users.flatMap(u => u.interests || []);
    const interestCounts: Record<string, number> = {};
    allInterests.forEach(interest => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });
    
    const topInterests = Object.entries(interestCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([interest]) => interest);
    
    // Calculate top locations
    const locations = users
      .map(u => u.location || 'Unknown')
      .filter(loc => loc !== 'Unknown');
    
    const locationCounts: Record<string, number> = {};
    locations.forEach(loc => {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    const topLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([loc]) => loc);
    
    // Calculate average age
    const ages = users.map(u => u.age || 0).filter(age => age > 0);
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
    
    // Calculate gender distribution
    const genderDistribution = {
      men: users.filter(u => u.gender === 'Man').length,
      women: users.filter(u => u.gender === 'Woman').length,
      other: users.filter(u => !['Man', 'Woman'].includes(u.gender || '')).length
    };
    
    return {
      date: today,
      newUsers,
      activeUsers,
      totalSwipes,
      totalMatches,
      premiumConversions,
      topInterests,
      topLocations,
      averageAge,
      genderDistribution
    };
};

export const getWeeklyReport = (dailyStats: DailyStats[]): ReportData => {
  const last7Days = dailyStats.slice(-7);
  
  const totalUsers = last7Days.reduce((sum, day) => sum + day.newUsers, 0);
  const activeUsers = last7Days[last7Days.length - 1]?.activeUsers || 0;
  const premiumUsers = last7Days.reduce((sum, day) => sum + day.premiumConversions, 0);
  
  return {
    totalUsers,
    activeUsers,
    premiumUsers,
    dailyActiveUsers: activeUsers,
    weeklyActiveUsers: last7Days.reduce((sum, day) => sum + day.activeUsers, 0),
    monthlyActiveUsers: last7Days.reduce((sum, day) => sum + day.activeUsers, 0),
    totalMatches: last7Days.reduce((sum, day) => sum + day.totalMatches, 0),
    totalMessages: Math.floor(Math.random() * 1000) + 500, // Mock data
    topGrowthCountries: ['Ethiopia', 'Kenya', 'Nigeria', 'Ghana', 'Uganda'] // Mock data
  };
};

export const formatDailyReportMessage = (stats: DailyStats): string => {
  return `📊 **Daily Report - ${stats.date}**

👥 **User Activity**
• New Users: ${stats.newUsers}
• Active Users: ${stats.activeUsers}
• Premium Conversions: ${stats.premiumConversions}

💕 **Engagement**
• Total Swipes: ${stats.totalSwipes}
• Total Matches: ${stats.totalMatches}
• Average Age: ${stats.averageAge}

👫 **Top Interests**
${stats.topInterests.map((interest, i) => `${i + 1}. ${interest}`).join('\n')}

📍 **Top Locations**
${stats.topLocations.map((loc, i) => `${i + 1}. ${loc}`).join('\n')}

👥 **Gender Distribution**
• Men: ${stats.genderDistribution.men} (${Math.round(stats.genderDistribution.men / (stats.genderDistribution.men + stats.genderDistribution.women + stats.genderDistribution.other) * 100)}%)
• Women: ${stats.genderDistribution.women} (${Math.round(stats.genderDistribution.women / (stats.genderDistribution.men + stats.genderDistribution.women + stats.genderDistribution.other) * 100)}%)
• Other: ${stats.genderDistribution.other}

📈 Growth continues strong! Keep up the great work!`;
};

export const saveDailyStats = (stats: DailyStats): void => {
  statsHistory.push(stats);
  
  // Keep only last 30 days
  if (statsHistory.length > 30) {
    statsHistory.splice(0, statsHistory.length - 30);
  }
  
  console.log('Daily stats saved:', stats);
};
