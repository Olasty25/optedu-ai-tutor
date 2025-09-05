import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Preferences = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showDialog, setShowDialog] = useState(true);
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [educationLevel, setEducationLevel] = useState<string[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [learningPreferences, setLearningPreferences] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);

  const handleCheckboxChange = (value: string, setState: React.Dispatch<React.SetStateAction<string[]>>) => {
    setState(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const handleDialogResponse = (setupPreferences: boolean) => {
    setShowDialog(false);
    if (!setupPreferences) {
      navigate("/dashboard");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && interests) {
      localStorage.setItem("userAge", age);
      localStorage.setItem("userInterests", interests);
      localStorage.setItem("userEducationLevel", JSON.stringify(educationLevel));
      localStorage.setItem("userLearningOutcomes", JSON.stringify(learningOutcomes));
      localStorage.setItem("userLearningPreferences", JSON.stringify(learningPreferences));
      localStorage.setItem("userChallenges", JSON.stringify(challenges));
      navigate("/dashboard");
    }
  };

  return (
    <>
      <Dialog open={showDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{t('preferences.setupTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              {t('preferences.setupDescription')}
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => handleDialogResponse(true)}
                className="flex-1"
              >
                {t('preferences.setupButton')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDialogResponse(false)}
                className="flex-1"
              >
                {t('preferences.skipButton')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <BookOpen className="h-10 w-10 text-white" />
              <span className="text-3xl font-bold text-white">Optedu AI</span>
            </Link>
            <p className="text-white/80">Let's personalize your learning experience</p>
          </div>

          <Card className="shadow-glow border-white/10 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-accent flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{t('common.preferences')}</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="age" className="text-base font-medium">How old are you?</Label>
                  <Input
                    id="age"
                    placeholder="e.g. 19"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="interests" className="text-base font-medium">What are you good in?</Label>
                  <Input
                    id="interests"
                    placeholder="e.g. Biology, Software Engineering, Pottery"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">{t('preferences.educationLevel')}</Label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {Object.entries(t('preferences.educationOptions')).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={educationLevel.includes(key)}
                          onCheckedChange={() => handleCheckboxChange(key, setEducationLevel)}
                        />
                        <Label htmlFor={key} className="text-sm">{value}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">{t('preferences.learningOutcomes')}</Label>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {Object.entries(t('preferences.outcomeOptions')).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={learningOutcomes.includes(key)}
                          onCheckedChange={() => handleCheckboxChange(key, setLearningOutcomes)}
                        />
                        <Label htmlFor={key} className="text-sm">{value}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">{t('preferences.learningPreferences')}</Label>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {Object.entries(t('preferences.preferenceOptions')).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={learningPreferences.includes(key)}
                          onCheckedChange={() => handleCheckboxChange(key, setLearningPreferences)}
                        />
                        <Label htmlFor={key} className="text-sm">{value}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">{t('preferences.challenges')}</Label>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {Object.entries(t('preferences.challengeOptions')).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={challenges.includes(key)}
                          onCheckedChange={() => handleCheckboxChange(key, setChallenges)}
                        />
                        <Label htmlFor={key} className="text-sm">{value}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                >
                  {t('common.save')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Preferences;