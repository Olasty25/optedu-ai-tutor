import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'pl')}>
        <SelectTrigger className="w-44 glass border-border/50 shadow-medium hover:shadow-large transition-all duration-300 hover:scale-105">
          <Globe className="h-4 w-4 mr-2 text-primary" />
          <SelectValue placeholder={t('languageSelector.selectLanguage')} />
        </SelectTrigger>
        <SelectContent className="glass border-border/50 shadow-large animate-fade-in">
          <SelectItem value="en" className="hover:bg-accent/50 transition-colors">
            {t('languageSelector.english')}
          </SelectItem>
          <SelectItem value="pl" className="hover:bg-accent/50 transition-colors">
            {t('languageSelector.polish')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};