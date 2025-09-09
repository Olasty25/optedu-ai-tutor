import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Check, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { getStripe } from "@/lib/stripe";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleUpgrade = async () => {
    // Expect a backend endpoint to create a Checkout Session and return { sessionId }
    // Placeholder: point to your future backend route
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
        customerEmail: user?.email ?? undefined,
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const stripe = await getStripe();
    await stripe?.redirectToCheckout({ sessionId: data.sessionId });
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
            <Link to="/dashboard">
              <Button variant="outline">
                {t('pricing.backToDashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('pricing.chooseYourLearningPlan')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('pricing.unlockUnlimitedDescription')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl mb-2">{t('pricing.free')}</CardTitle>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">{t('pricing.perMonth')}</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.studyPlansPerMonth')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.basicAITutor')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.flashcardsSummaries')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.progressTracking')}</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                {t('pricing.currentPlan')}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-hero text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                {t('pricing.mostPopular')}
              </div>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl mb-2 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary mr-2" />
                {t('pricing.pro')}
              </CardTitle>
              <div className="text-4xl font-bold">$9.99</div>
              <p className="text-muted-foreground">{t('pricing.perMonth')}</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.unlimitedStudyPlans')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.advancedAITutor')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.interactiveFlashcards')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.detailedAnalytics')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.exportStudyMaterials')}</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>{t('pricing.prioritySupport')}</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-hero hover:opacity-90 transition-opacity" onClick={handleUpgrade}>
                {t('pricing.upgradeToPro')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">{t('pricing.frequentlyAskedQuestions')}</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">{t('pricing.canICancelAnytime')}</h3>
              <p className="text-muted-foreground">{t('pricing.cancelAnytimeAnswer')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('pricing.whatPaymentMethods')}</h3>
              <p className="text-muted-foreground">{t('pricing.paymentMethodsAnswer')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('pricing.isThereFreeTrial')}</h3>
              <p className="text-muted-foreground">{t('pricing.freeTrialAnswer')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('pricing.doYouOfferStudentDiscounts')}</h3>
              <p className="text-muted-foreground">{t('pricing.studentDiscountsAnswer')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;