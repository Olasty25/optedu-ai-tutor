import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Preferences = () => {
  const navigate = useNavigate();
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
            <DialogTitle className="text-center">Setup Your Learning Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Would you like to set up your preferences to optimize your learning plan? This will help us create a more personalized experience for you.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => handleDialogResponse(true)}
                className="flex-1"
              >
                Yes, Set Up
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleDialogResponse(false)}
                className="flex-1"
              >
                Skip for Now
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
              <CardTitle className="text-2xl">Preferences</CardTitle>
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
                  <Label className="text-base font-medium">What level of education are you?</Label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {[
                      "Primary School",
                      "Secondary School", 
                      "High School",
                      "Studies",
                      "Im Working"
                    ].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={level}
                          checked={educationLevel.includes(level)}
                          onCheckedChange={() => handleCheckboxChange(level, setEducationLevel)}
                        />
                        <Label htmlFor={level} className="text-sm">{level}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">What learning outcomes do you overall expect?</Label>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {[
                      "Be prepared for tests",
                      "Utilize this knowledge",
                      "Just to keep up with school topics",
                      "Change my job",
                      "Advance in my current career"
                    ].map(outcome => (
                      <div key={outcome} className="flex items-center space-x-2">
                        <Checkbox
                          id={outcome}
                          checked={learningOutcomes.includes(outcome)}
                          onCheckedChange={() => handleCheckboxChange(outcome, setLearningOutcomes)}
                        />
                        <Label htmlFor={outcome} className="text-sm">{outcome}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">How do you prefer to learn?</Label>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {[
                      "Short, bite-sized lessons",
                      "Practice based learning",
                      "Step-by-step guides",
                      "Stories and real world examples",
                      "Visual explanations",
                      "Explaining it to others",
                      "Reading detailed notes",
                      "Interactive tools"
                    ].map(pref => (
                      <div key={pref} className="flex items-center space-x-2">
                        <Checkbox
                          id={pref}
                          checked={learningPreferences.includes(pref)}
                          onCheckedChange={() => handleCheckboxChange(pref, setLearningPreferences)}
                        />
                        <Label htmlFor={pref} className="text-sm">{pref}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Do you think any of these below may stop you?</Label>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {[
                      "Little time",
                      "Lack of direction",
                      "Hardship with maintaining focus",
                      "Understanding complex things",
                      "Hardship with finding necessary info",
                      "Other"
                    ].map(challenge => (
                      <div key={challenge} className="flex items-center space-x-2">
                        <Checkbox
                          id={challenge}
                          checked={challenges.includes(challenge)}
                          onCheckedChange={() => handleCheckboxChange(challenge, setChallenges)}
                        />
                        <Label htmlFor={challenge} className="text-sm">{challenge}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3"
                >
                  Save
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