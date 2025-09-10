import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lock, ArrowLeft, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useIsMobile } from "@/hooks/use-mobile";

interface OfficialPlan {
  id: string;
  title: string;
  description: string;
  isLocked: boolean;
  subject: string;
}

const OfficialPlans = () => {
  const { t } = useLanguage();
  const { isPro } = useAuth();
  const isMobile = useIsMobile();

  const officialPlans: OfficialPlan[] = [
    {
      id: "official-1",
      title: "Egzamin 8-kl. z J. Polskiego",
      description: "Kompleksowy plan przygotowujący do egzaminu ósmoklasisty z języka polskiego. Zawiera wszystkie wymagane tematy i zadania.",
      isLocked: !isPro,
      subject: "Język Polski"
    },
    {
      id: "official-2", 
      title: "Egzamin 8-kl. z J. Angielskiego",
      description: "Pełne przygotowanie do egzaminu ósmoklasisty z języka angielskiego z naciskiem na gramatykę, słownictwo i umiejętności komunikacyjne.",
      isLocked: !isPro,
      subject: "Język Angielski"
    },
    {
      id: "official-3",
      title: "Egzamin 8-kl. z Matmy", 
      description: "Matematyka na egzaminie ósmoklasisty - wszystkie działy, zadania i strategie rozwiązywania problemów matematycznych.",
      isLocked: !isPro,
      subject: "Matematyka"
    }
  ];

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
            
            <Link to="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2 text-xs md:text-sm">
                <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Powrót do Dashboard</span>
                <span className="sm:hidden">Powrót</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Main Content */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Oficjalne Plany Nauki
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
            Profesjonalne plany przygotowujące do egzaminów ósmoklasisty
          </p>
          
          {!isPro && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 md:p-6 mb-6 md:mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Crown className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
                <h3 className="text-base md:text-lg font-semibold text-amber-800">Dostępne tylko dla użytkowników PRO</h3>
              </div>
              <p className="text-amber-700 mb-4 text-sm md:text-base">
                Odblokuj wszystkie oficjalne plany nauki i uzyskaj nieograniczony dostęp do treści edukacyjnych.
              </p>
              <Link to="/pricing">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white text-sm md:text-base">
                  <Crown className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Przejdź na PRO
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Official Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {officialPlans.map((plan) => (
            <Card key={plan.id} className={`hover:shadow-soft transition-shadow group relative ${plan.isLocked ? 'opacity-75' : ''}`}>
              {plan.isLocked && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-10">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base md:text-lg leading-tight">{plan.title}</CardTitle>
                  {plan.isLocked && (
                    <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="text-xs md:text-sm text-primary font-medium">{plan.subject}</div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">{plan.description}</p>
                
                <div className="space-y-2">
                  {plan.isLocked ? (
                    <div className="text-center">
                      <Button 
                        disabled 
                        className="w-full bg-muted text-muted-foreground cursor-not-allowed text-sm md:text-base py-2 md:py-3"
                      >
                        <Lock className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                        Wymaga PRO
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Odblokuj plan przechodząc na PRO
                      </p>
                    </div>
                  ) : (
                    <Button className="w-full group-hover:bg-primary/90 text-sm md:text-base py-2 md:py-3">
                      Rozpocznij naukę
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action for Non-PRO Users */}
        {!isPro && (
          <div className="text-center bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Chcesz uzyskać dostęp do wszystkich planów?</h3>
            <p className="text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto text-sm md:text-base">
              Przejdź na plan PRO i odblokuj wszystkie oficjalne plany nauki, nieograniczoną liczbę własnych planów i wiele więcej funkcji premium.
            </p>
            <Link to="/pricing">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg rounded-xl w-full sm:w-auto">
                <Crown className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Przejdź na PRO
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialPlans;
