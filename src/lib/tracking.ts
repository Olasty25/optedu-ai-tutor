// Study time and progress tracking utilities

export interface StudySession {
  id: string;
  planId: string;
  startTime: number;
  endTime?: number;
  duration?: number; // in minutes
  completed: boolean;
}

export interface CompletedPlan {
  id: string;
  planId: string;
  completedAt: number;
  totalStudyTime: number; // in minutes
}

export interface UserStats {
  totalStudyTime: number; // in minutes
  completedPlans: number;
  studySessions: StudySession[];
  completedPlansList: CompletedPlan[];
}

// Get current user ID (consistent with existing code)
export const getCurrentUserId = (): string => {
  let userId = localStorage.getItem("currentUserId");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("currentUserId", userId);
  }
  return userId;
};

// Get user stats from localStorage
export const getUserStats = (): UserStats => {
  const userId = getCurrentUserId();
  const statsKey = `userStats_${userId}`;
  const defaultStats: UserStats = {
    totalStudyTime: 0,
    completedPlans: 0,
    studySessions: [],
    completedPlansList: []
  };
  
  try {
    const saved = localStorage.getItem(statsKey);
    return saved ? JSON.parse(saved) : defaultStats;
  } catch {
    return defaultStats;
  }
};

// Save user stats to localStorage
export const saveUserStats = (stats: UserStats): void => {
  const userId = getCurrentUserId();
  const statsKey = `userStats_${userId}`;
  localStorage.setItem(statsKey, JSON.stringify(stats));
};

// Start a new study session
export const startStudySession = (planId: string): string => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const stats = getUserStats();
  
  const newSession: StudySession = {
    id: sessionId,
    planId,
    startTime: Date.now(),
    completed: false
  };
  
  stats.studySessions.push(newSession);
  saveUserStats(stats);
  
  return sessionId;
};

// End a study session
export const endStudySession = (sessionId: string): void => {
  const stats = getUserStats();
  const session = stats.studySessions.find(s => s.id === sessionId);
  
  if (session && !session.completed) {
    const endTime = Date.now();
    const duration = Math.round((endTime - session.startTime) / (1000 * 60)); // Convert to minutes
    
    session.endTime = endTime;
    session.duration = duration;
    session.completed = true;
    
    // Update total study time
    stats.totalStudyTime += duration;
    
    saveUserStats(stats);
  }
};

// Mark a plan as completed
export const markPlanCompleted = (planId: string): void => {
  const stats = getUserStats();
  
  // Check if already completed
  const alreadyCompleted = stats.completedPlansList.some(cp => cp.planId === planId);
  if (alreadyCompleted) return;
  
  // Calculate total study time for this plan
  const planSessions = stats.studySessions.filter(s => s.planId === planId && s.completed);
  const totalPlanTime = planSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  
  const completedPlan: CompletedPlan = {
    id: `completed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    planId,
    completedAt: Date.now(),
    totalStudyTime: totalPlanTime
  };
  
  stats.completedPlansList.push(completedPlan);
  stats.completedPlans = stats.completedPlansList.length;
  
  saveUserStats(stats);
};

// Get formatted study time
export const getFormattedStudyTime = (totalMinutes: number): { hours: number; minutes: number; display: string } => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  let display = "";
  if (hours > 0) {
    display += `${hours}h `;
  }
  if (minutes > 0 || hours === 0) {
    display += `${minutes}m`;
  }
  
  return { hours, minutes, display: display.trim() };
};

// Get study time for a specific plan
export const getPlanStudyTime = (planId: string): number => {
  const stats = getUserStats();
  const planSessions = stats.studySessions.filter(s => s.planId === planId && s.completed);
  return planSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
};

// Check if a plan is completed
export const isPlanCompleted = (planId: string): boolean => {
  const stats = getUserStats();
  return stats.completedPlansList.some(cp => cp.planId === planId);
};

// Get recent study sessions (last 7 days)
export const getRecentStudySessions = (days: number = 7): StudySession[] => {
  const stats = getUserStats();
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return stats.studySessions.filter(session => 
    session.completed && 
    session.endTime && 
    session.endTime > cutoffTime
  );
};

// Get study streak (consecutive days with study sessions)
export const getStudyStreak = (): number => {
  const stats = getUserStats();
  const completedSessions = stats.studySessions
    .filter(s => s.completed && s.endTime)
    .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
  
  if (completedSessions.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const session of completedSessions) {
    const sessionDate = new Date(session.endTime!);
    sessionDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (dayDiff > streak) {
      break;
    }
  }
  
  return streak;
};
