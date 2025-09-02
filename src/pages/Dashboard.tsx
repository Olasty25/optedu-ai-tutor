import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface StudyPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([
    {
      id: "1",
      title: "Object Python basics",
      description: "Master the fundamentals of object-oriented programming in Python",
      progress: 65
    },
    {
      id: "2", 
      title: "The War of Independence: 4th unit from History book",
      description: "Deep dive into the American Revolutionary War and its key events",
      progress: 30
    }
  ]);

  useEffect(() => {
    const name = localStorage.getItem("userName") || "Student";
    setUserName(name);
    
    // Load study plans from localStorage
    const savedPlans = localStorage.getItem("studyPlans");
    if (savedPlans) {
      setStudyPlans(JSON.parse(savedPlans));
    }
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

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
            <span className="text-sm text-muted-foreground">Welcome back, {userName}!</span>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            What you'll master today?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            We'll get to know your preferences from a bunch of simple questions. AI will analyze your way of learning and keep up.
          </p>
          
          <Link to="/generate-plan">
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg rounded-xl"
            >
              <Plus className="mr-2 h-5 w-5" />
              Generate New Plan
            </Button>
          </Link>
        </div>

        {/* Study Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Study Plans:</h2>
          
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
                      <span>Progress</span>
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
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg mb-4">{stats.freePlansLeft} free plans left.</p>
            <Button variant="outline" size="lg" className="px-8">
              Upgrade to Pro
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Stats:</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Hours spent learning</h3>
              <div className="text-3xl font-bold text-primary">{stats.hoursLearning} h</div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Plans Completed</h3>
              <div className="text-3xl font-bold text-accent">{stats.plansCompleted}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;