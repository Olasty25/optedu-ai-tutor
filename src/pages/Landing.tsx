import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { FeatureCard } from "@/components/ui/feature-card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('landing.heroTitle')}{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                {t('landing.heroHighlight')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {t('landing.heroSubtitle')}
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:opacity-90 transition-opacity text-lg px-8 py-6 rounded-xl shadow-glow"
              >
                {t('landing.tryButton')}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.featuresTitle')}</h2>
            <p className="text-xl text-muted-foreground">{t('landing.featuresSubtitle')}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title={t('landing.feature1Title')}
              description={t('landing.feature1Description')}
            />
            <FeatureCard
              icon={Target}
              title={t('landing.feature2Title')} 
              description={t('landing.feature2Description')}
            />
            <FeatureCard
              icon={Zap}
              title={t('landing.feature3Title')}
              description={t('landing.feature3Description')}
            />
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.innovationTitle')}</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('landing.innovation1Title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.innovation1Description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('landing.innovation2Title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.innovation2Description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('landing.innovation3Title')}</h3>
              <p className="text-muted-foreground">
                {t('landing.innovation3Description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {t('landing.ctaSubtitle')}
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6 rounded-xl bg-white text-primary hover:bg-white/90"
            >
              {t('landing.ctaButton')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>{t('landing.footerText')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;