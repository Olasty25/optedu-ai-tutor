import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo login - in real app would validate credentials
    if (email && password) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-white" />
            <span className="text-3xl font-bold text-white">Optedu AI</span>
          </Link>
          <p className="text-white/80">Welcome back to your learning journey</p>
        </div>

        <Card className="shadow-glow border-white/10 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
            <CardDescription>
              {t('auth.loginSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-hero hover:opacity-90"
              >
                {t('auth.loginButton')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.newUser')}{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  {t('auth.createAccount')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;