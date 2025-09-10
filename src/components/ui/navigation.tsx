import { Button } from "@/components/ui/button";
import { BookOpen, User, LogIn, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { LanguageSelector } from "@/components/ui/language-selector";

export const Navigation = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20 shadow-soft">
      <div className="container mx-auto px-4 h-16 md:h-24 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 md:space-x-3 group">
          <div className="p-1 rounded-lg bg-gradient-accent group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent tracking-tight">
            Optedu AI
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <LanguageSelector variant="inline" size="md" showText={true} />
            
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
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <>
            <div className="flex items-center space-x-2">
              {/* Mobile Language Selector */}
              <LanguageSelector variant="inline" size="sm" showText={false} />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
            
            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
              <div className="fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)}>
                <div className="absolute right-4 top-4 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-border/20 p-4">
                  <div className="flex flex-col space-y-3">
                    <Link to="/pricing" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        {t('common.pricing')}
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <LogIn className="h-4 w-4 mr-2" />
                        {t('common.signIn')}
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="premium" className="w-full">
                        {t('common.getStarted')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};