import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { FeatureCard } from "@/components/ui/feature-card";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Brain, 
  Target, 
  Users, 
  Zap, 
  Award,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              We are unleashing a{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                new way of learning
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              AI-powered personalized education that adapts to your learning style and pace
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8 py-6 rounded-xl shadow-glow"
              >
                Try Optedu AI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Learning Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for effective AI-powered education</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="Generate a personalized course"
              description="Get custom study flows tailored to your needs with AI-generated learning paths that adapt to your progress."
            />
            <FeatureCard
              icon={Target}
              title="Study with AI-prepared prompts"
              description="Learn with guided prompts and structured lessons designed by AI to maximize your learning efficiency."
            />
            <FeatureCard
              icon={Zap}
              title="Get notified to stay motivated"
              description="Never lose your learning rhythm with timely reminders and progress tracking to keep you engaged."
            />
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Optedu AI is innovative</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Adaptive Learning</h3>
              <p className="text-muted-foreground">
                Optedu AI adjusts dynamically to each student's pace and level, ensuring fully personalized learning experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Integration</h3>
              <p className="text-muted-foreground">
                It merges diverse sources — books, notes, and digital content — into clear, structured study flows.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Motivation Engine</h3>
              <p className="text-muted-foreground">
                Stay engaged with reminders, real-time feedback, and progress tracking to keep your learning on track.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to transform your learning?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of students already using AI to accelerate their education
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6 rounded-xl bg-white text-primary hover:bg-white/90"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 by Optedu AI | Privacy Policy</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;