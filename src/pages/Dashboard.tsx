import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/contexts/LanguageContext";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userName, setUserName] = useState("");
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([
    {
      id: "1",
      title: "Object Python basics",
      description: "Master the fundamentals of object-oriented programming in Python",
      progress: 65
    }, 
  ]);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Student";
    setUserName(name);

    const savedPlans = localStorage.getItem("studyPlans");
    if (savedPlans) {
      setStudyPlans(JSON.parse(savedPlans));
    }
  }, []);

  const stats = {
    hoursLearning: 3,
    plansCompleted: 2,
    freePlansLeft: 2
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
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
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

          <div className="text-center">
            <p className="text-lg mb-4">{stats.freePlansLeft} {t('dashboard.freePlansLeft')}</p>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="px-8">
                {t('dashboard.upgradeToPro')}
              </Button>
            </Link>
          </div>
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