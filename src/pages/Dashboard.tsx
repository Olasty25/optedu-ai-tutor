import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Clock, CheckCircle, ArrowRight, Trash2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

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

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Student";
    setUserName(name);

    const savedPlans = localStorage.getItem("studyPlans");
    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      setStudyPlans(plans);
      setStudyPlansCount(plans.length);
    }
  }, []);

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm("Are you sure you want to delete this study plan? This action cannot be undone.")) {
      try {
        const userId = "user_" + Date.now(); // In real app, get from auth context
        const response = await fetch(`http://localhost:5000/study-plan/${planId}/${userId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state
          const updatedPlans = studyPlans.filter(plan => plan.id !== planId);
          setStudyPlans(updatedPlans);
          setStudyPlansCount(updatedPlans.length);
          
          // Update localStorage
          localStorage.setItem("studyPlans", JSON.stringify(updatedPlans));
        } else {
          console.error("Failed to delete study plan");
        }
      } catch (error) {
        console.error("Error deleting study plan:", error);
      }
    }
  };

  const stats = {
    hoursLearning: 3,
    plansCompleted: 2,
    freePlansLeft: isPro ? "Unlimited" : Math.max(0, 2 - studyPlansCount)
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Optedu AI
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{t('dashboard.welcomeBack')}, {userName}!</span>
            <Button 
              variant="outline" 
              onClick={async () => {
                await signOut(auth);
                navigate("/");
              }}
            >
              {t('dashboard.logout')}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('dashboard.whatYoullMaster')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('dashboard.getToKnowDescription')}
          </p>
          
          <Link to="/generate-plan">
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg rounded-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t('dashboard.generateNewPlan')}
            </Button>
          </Link>
        </div>

        {/* Study Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t('dashboard.yourStudyPlans')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {studyPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-soft transition-shadow group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{t('dashboard.progress')}</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <Link to={`/study/${plan.id}`}>
                    <Button className="w-full group-hover:bg-primary/90">
                      {t('dashboard.continue')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isPro && (
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-lg">
                  {stats.freePlansLeft === 0 ? "No free plans left" : `${stats.freePlansLeft} free plans left`}
                </p>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="px-8">
                  {t('dashboard.upgradeToPro')}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('dashboard.yourStats')}</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{t('dashboard.hoursSpentLearning')}</h3>
              <div className="text-3xl font-bold text-primary">{stats.hoursLearning} h</div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{t('dashboard.plansCompleted')}</h3>
              <div className="text-3xl font-bold text-accent">{stats.plansCompleted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;