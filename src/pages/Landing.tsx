import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/ui/navigation";
import { FeatureCard } from "@/components/ui/feature-card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  const { grantProForEmail } = useAuth();
  const [betaEmail, setBetaEmail] = useState("");
  const [betaMsg, setBetaMsg] = useState<string | null>(null);
  const [betaSlotsRemaining, setBetaSlotsRemaining] = useState(30);

  // Load beta slots from localStorage on component mount
  useEffect(() => {
    const savedSlots = localStorage.getItem('betaSlotsRemaining');
    if (savedSlots) {
      setBetaSlotsRemaining(parseInt(savedSlots, 10));
    }
  }, []);

  // Save beta slots to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('betaSlotsRemaining', betaSlotsRemaining.toString());
  }, [betaSlotsRemaining]);

  const handleBetaSignup = (email: string) => {
    if (!email || betaSlotsRemaining <= 0) return;
    
    // Decrement the counter
    setBetaSlotsRemaining(prev => Math.max(0, prev - 1));
    
    // Grant access and show message
    grantProForEmail(email);
    setBetaMsg(t('landing.grantAccessMsg'));
    setBetaEmail("");
  };

  // Reset function for testing (you can remove this in production)
  const resetBetaSlots = () => {
    setBetaSlotsRemaining(30);
    setBetaMsg(null);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 relative overflow-hidden">
        {/* Banner Image Background */}
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/banna.png"
          alt="Optedu AI Banner"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="hero-text-backdrop px-4 md:px-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white hero-title-glow">
                {t('landing.heroTitle')}{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent hero-highlight-glow">
                  {t('landing.heroHighlight')}
                </span>
              </h1>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-6 md:mb-8 leading-relaxed px-4">
              {t('landing.heroSubtitle')}
            </p>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:opacity-90 transition-opacity text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-xl shadow-glow w-full sm:w-auto"
              >
                {t('landing.tryButton')}
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t('landing.featuresTitle')}</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{t('landing.featuresSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t('landing.innovationTitle')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Brain className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">{t('landing.innovation1Title')}</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {t('landing.innovation1Description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Users className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">{t('landing.innovation2Title')}</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {t('landing.innovation2Description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-accent flex items-center justify-center">
                <Award className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3">{t('landing.innovation3Title')}</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {t('landing.innovation3Description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Testing Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-br from-accent via-primary to-accent/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 md:px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
              <Zap className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              {t('landing.betaLabel')}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              {t('landing.betaTitle')}
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-white/90 leading-relaxed">
              {t('landing.betaSubtitle', { count: betaSlotsRemaining })}
            </p>
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 md:px-6 py-2 md:py-3">
                <Users className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="font-semibold text-sm md:text-base">
                  {t('landing.betaSlotsRemaining', { count: betaSlotsRemaining })}
                </span>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!betaEmail || betaSlotsRemaining <= 0) return;
                handleBetaSignup(betaEmail);
              }}
              className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={betaEmail}
                onChange={(e) => setBetaEmail(e.target.value)}
                placeholder={t('landing.betaEmailPlaceholder')}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base"
              />
              <Button
                type="submit"
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-4 md:px-6 py-3 w-full sm:w-auto"
                disabled={betaSlotsRemaining <= 0}
              >
                {betaSlotsRemaining <= 0 ? t('landing.betaFull') : t('landing.betaJoinButton')}
              </Button>
            </form>
            {betaMsg && (
              <p className="text-xs md:text-sm text-white mt-3 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" /> {betaMsg}
              </p>
            )}
            {betaSlotsRemaining <= 0 && (
              <p className="text-xs md:text-sm text-yellow-300 mt-3 flex items-center justify-center">
                <Users className="h-3 w-3 md:h-4 md:w-4 mr-2" /> {t('landing.betaTestingFull')}
              </p>
            )}
            <p className="text-xs md:text-sm text-white/70 mt-4">
              {t('landing.betaDisclaimer')}
            </p>
            {/* Reset button for testing - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={resetBetaSlots}
                className="text-xs text-white/50 hover:text-white/70 mt-2 underline"
              >
                {t('landing.resetBetaSlots')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-hero text-white relative overflow-hidden">
        {/* Video Background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/readytotransform.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 text-white/90">
            {t('landing.ctaSubtitle')}
          </p>
          <Link to="/register">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-xl bg-white text-primary hover:bg-white/90 w-full sm:w-auto"
            >
              {t('landing.ctaButton')}
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
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