import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo registration - in real app would create account
    if (formData.email && formData.password && formData.password === formData.confirmPassword) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", formData.name);
      navigate("/preferences");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-white" />
            <span className="text-3xl font-bold text-white">Optedu AI</span>
          </Link>
          <p className="text-white/80">Start your AI-powered learning journey</p>
        </div>

        <Card className="shadow-glow border-white/10 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.registerTitle')}</CardTitle>
            <CardDescription>
              {t('auth.registerSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('common.name')}</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('common.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-hero hover:opacity-90"
              >
                {t('auth.registerButton')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.existingUser')}{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('auth.signInHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;