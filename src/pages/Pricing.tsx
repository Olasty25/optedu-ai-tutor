import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Check, Star, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
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
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Learning Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlock unlimited study plans and advanced AI features to accelerate your learning journey
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>3 study plans per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Basic AI tutor</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Flashcards & summaries</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Progress tracking</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-hero text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                <Crown className="h-4 w-4 mr-1" />
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl mb-2 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary mr-2" />
                Pro
              </CardTitle>
              <div className="text-4xl font-bold">$9.99</div>
              <p className="text-muted-foreground">per month</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Unlimited study plans</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Advanced AI tutor with GPT-4</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Interactive flashcards & quizzes</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Detailed analytics & insights</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Export study materials</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-hero hover:opacity-90 transition-opacity">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. No long-term contracts.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">We accept all major credit cards and PayPal for your convenience.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">Yes, Pro features include a 7-day free trial when you first upgrade.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer student discounts?</h3>
              <p className="text-muted-foreground">Yes! Contact us with your student ID for a 50% discount on Pro plans.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;