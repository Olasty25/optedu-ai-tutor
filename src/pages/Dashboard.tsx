import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Clock, CheckCircle, ArrowRight, Trash2, AlertCircle, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getUserStats, getFormattedStudyTime, getPlanStudyTime, isPlanCompleted } from "@/lib/tracking";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useIsMobile } from "@/hooks/use-mobile";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isPro } = useAuth();
  const isMobile = useIsMobile();
  const [userName, setUserName] = useState("");
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([
    {
      id: "1",
      title: "Object Python basics",
      description: "Master the fundamentals of object-oriented programming in Python",
      progress: 65
    }, 
  ]);
  const [studyPlansCount, setStudyPlansCount] = useState(0);
  const [userStats, setUserStats] = useState(getUserStats());

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Student";
    setUserName(name);

    const savedPlans = localStorage.getItem("studyPlans");
    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      setStudyPlans(plans);
      setStudyPlansCount(plans.length);
    }
    
    // Update user stats
    setUserStats(getUserStats());
  }, []);

  // Refresh stats when component becomes visible (user returns from study)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setUserStats(getUserStats());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Use a stable user ID stored in localStorage (same approach as StudyModule)
  const getCurrentUserId = () => {
    let userId = localStorage.getItem("currentUserId");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("currentUserId", userId);
    }
    return userId;
  };

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm("Are you sure you want to delete this study plan? This action cannot be undone.")) {
      try {
        const userId = getCurrentUserId();
        
        // Try to delete from backend first (if it exists there)
        try {
          const response = await fetch(`http://localhost:5000/study-plan/${planId}/${userId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            console.log("Plan not found in backend, deleting locally only");
          }
        } catch (backendError) {
          console.log("Backend not available, deleting locally only");
        }

        // Always remove from local state and localStorage
        const updatedPlans = studyPlans.filter(plan => plan.id !== planId);
        setStudyPlans(updatedPlans);
        setStudyPlansCount(updatedPlans.length);
        
        // Update localStorage
        localStorage.setItem("studyPlans", JSON.stringify(updatedPlans));
        
        console.log("Study plan deleted successfully");
      } catch (error) {
        console.error("Error deleting study plan:", error);
      }
    }
  };

  const formattedTime = getFormattedStudyTime(userStats.totalStudyTime);
  
  const stats = {
    hoursLearning: formattedTime.hours,
    minutesLearning: formattedTime.minutes,
    displayTime: formattedTime.display,
    plansCompleted: userStats.completedPlans,
    freePlansLeft: isPro ? "Unlimited" : Math.max(0, 2 - studyPlansCount)
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <span className="text-lg md:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Optedu AI
            </span>
          </Link>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Selector */}
            <LanguageSelector 
              variant="inline" 
              size={isMobile ? "sm" : "md"} 
              showText={!isMobile} 
            />
            
            <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">{t('dashboard.welcomeBack')}, {userName}!</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                await signOut(auth);
                navigate("/");
              }}
              className="text-xs md:text-sm"
            >
              {t('dashboard.logout')}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Main Content */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('dashboard.whatYoullMaster')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            {t('dashboard.getToKnowDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
            <Link to="/official-plans" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline"
                className="px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-xl border-2 hover:bg-muted/50 w-full sm:w-auto"
              >
                <GraduationCap className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Study official plans
              </Button>
            </Link>
            
            <Link to="/generate-plan" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-primary text-white hover:bg-primary/90 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-xl w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                {t('dashboard.generateNewPlan')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Study Plans */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{t('dashboard.yourStudyPlans')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            {studyPlans.map((plan) => {
              const planStudyTime = getPlanStudyTime(plan.id);
              const isCompleted = isPlanCompleted(plan.id);
              const formattedPlanTime = getFormattedStudyTime(planStudyTime);
              
              return (
                <Card key={plan.id} className="hover:shadow-soft transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base md:text-lg leading-tight">{plan.title}</CardTitle>
                      <div className="flex items-center gap-1 md:gap-2">
                        {isCompleted && (
                          <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">Completed</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive p-1 md:p-2"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">{plan.description}</p>
                    
                    {/* Study Time Display */}
                    {planStudyTime > 0 && (
                      <div className="mb-3 md:mb-4 p-2 md:p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-xs md:text-sm">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          <span className="font-medium">Study Time:</span>
                          <span className="text-primary font-semibold">{formattedPlanTime.display}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-3 md:mb-4">
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span>{t('dashboard.progress')}</span>
                        <span>{plan.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 md:h-2">
                        <div 
                          className="bg-gradient-accent h-1.5 md:h-2 rounded-full transition-all duration-300"
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link to={`/study/${plan.id}`}>
                      <Button className="w-full group-hover:bg-primary/90 text-sm md:text-base py-2 md:py-3">
                        {isCompleted ? 'Review' : t('dashboard.continue')}
                        <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {!isPro && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <p className="text-sm md:text-lg">
                  {stats.freePlansLeft === 0 ? "No free plans left" : `${stats.freePlansLeft} free plans left`}
                </p>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="px-6 md:px-8 text-sm md:text-base">
                  {t('dashboard.upgradeToPro')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">{t('dashboard.yourStats')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-md mx-auto">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold mb-2">{t('dashboard.hoursSpentLearning')}</h3>
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stats.displayTime}</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {stats.hoursLearning > 0 && `${stats.hoursLearning} hours`}
                {stats.hoursLearning > 0 && stats.minutesLearning > 0 && ', '}
                {stats.minutesLearning > 0 && `${stats.minutesLearning} minutes`}
                {stats.hoursLearning === 0 && stats.minutesLearning === 0 && 'No study time yet'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h3 className="text-base md:text-lg font-semibold mb-2">{t('dashboard.plansCompleted')}</h3>
              <div className="text-2xl md:text-3xl font-bold text-accent mb-1">{stats.plansCompleted}</div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {stats.plansCompleted === 0 ? 'No plans completed yet' : 
                 stats.plansCompleted === 1 ? 'plan completed' : 'plans completed'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;