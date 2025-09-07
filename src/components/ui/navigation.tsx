import { Button } from "@/components/ui/button";
import { BookOpen, User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Navigation = () => {
  const { t } = useLanguage();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20 shadow-soft">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-1 rounded-lg bg-gradient-accent group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
            Optedu AI
          </span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Link to="/pricing">
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
              {t('common.pricing')}
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
              <LogIn className="h-4 w-4 mr-2" />
              {t('common.signIn')}
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="premium" size="sm">
              {t('common.getStarted')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};