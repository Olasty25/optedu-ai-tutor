import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface LanguageSelectorProps {
  variant?: 'floating' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const LanguageSelector = ({ 
  variant = 'floating', 
  size = 'md', 
  showText = true 
}: LanguageSelectorProps) => {
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: 'w-16 h-8 text-xs',
    md: 'w-24 h-10 text-sm',
    lg: 'w-32 h-12 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const content = (
    <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'pl')}>
      <SelectTrigger className={`${sizeClasses[size]} glass border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105`}>
        <Globe className={`${iconSizes[size]} mr-2 text-primary`} />
        {showText && <SelectValue />}
      </SelectTrigger>
      <SelectContent className="glass border-border/50 shadow-large">
        <SelectItem value="en" className="hover:bg-accent/50 transition-colors">
          {isMobile && !showText ? '🇺🇸' : '🇺🇸 English'}
        </SelectItem>
        <SelectItem value="pl" className="hover:bg-accent/50 transition-colors">
          {isMobile && !showText ? '🇵🇱' : '🇵🇱 Polski'}
        </SelectItem>
      </SelectContent>
    </Select>
  );

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {content}
      </div>
    );
  }

  return content;
};