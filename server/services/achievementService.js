const Achievement = require('../models/Achievement');

async function checkAchievements(user) {
  try {
    const achievements = await Achievement.find({ isActive: true });
    const earnedAchievementIds = user.achievements.map(a => a.achievementId.toString());
    
    for (const achievement of achievements) {
      // Skip if already earned
      if (earnedAchievementIds.includes(achievement._id.toString())) {
        continue;
      }
      
      let earned = false;
      
      switch (achievement.criteria.type) {
        case 'problems_solved':
          earned = user.stats.problemsSolved >= achievement.criteria.value;
          break;
          
        case 'streak_days':
          earned = user.stats.currentStreak >= achievement.criteria.value;
          break;
          
        case 'topic_completion':
          if (achievement.criteria.topic) {
            const topicProblems = user.solvedProblems.filter(sp => 
              sp.topic === achievement.criteria.topic
            );
            earned = topicProblems.length >= achievement.criteria.value;
          }
          break;
          
        case 'speed_solving':
          const fastSolutions = user.solvedProblems.filter(sp => 
            sp.runtime && sp.runtime <= achievement.criteria.value
          );
          earned = fastSolutions.length >= 5; // At least 5 fast solutions
          break;
          
        case 'daily_consistency':
          // Check if user solved problems for consecutive days
          const recentDays = user.streakData
            .filter(sd => sd.problemsSolved > 0)
            .slice(-achievement.criteria.value);
          earned = recentDays.length >= achievement.criteria.value;
          break;
      }
      
      if (earned) {
        user.achievements.push({
          achievementId: achievement._id,
          earnedAt: new Date()
        });
        
        // Add points for earning achievement
        user.stats.points += achievement.points;
      }
    }
    
    return user;
  } catch (error) {
    console.error('Achievement check error:', error);
    return user;
  }
}

module.exports = { checkAchievements };