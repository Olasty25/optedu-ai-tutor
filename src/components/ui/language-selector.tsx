import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'pl')}>
        <SelectTrigger className="w-40 bg-card/80 backdrop-blur-md border-border shadow-soft">
          <Globe className="h-4 w-4 mr-2" />
          <SelectValue placeholder={t('languageSelector.selectLanguage')} />
        </SelectTrigger>
        <SelectContent className="bg-popover/95 backdrop-blur-md border-border">
          <SelectItem value="en">{t('languageSelector.english')}</SelectItem>
          <SelectItem value="pl">{t('languageSelector.polish')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};