import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadPopout } from "@/components/ui/file-upload-popout";
import { BookOpen, ArrowLeft, Wand2, Upload, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const GeneratePlan = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useOwnSources, setUseOwnSources] = useState(false);
  const [customizeStructure, setCustomizeStructure] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Additional customization fields
  const [learningStyle, setLearningStyle] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      setIsGenerating(true);
      
      // Simulate plan generation and save to localStorage
      setTimeout(() => {
        const newPlan = {
          id: Date.now().toString(),
          title: title,
          description: description,
          progress: 0
        };
        
        // Get existing plans and add new one
        const existingPlans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
        const updatedPlans = [...existingPlans, newPlan];
        localStorage.setItem("studyPlans", JSON.stringify(updatedPlans));
        
        setIsGenerating(false);
        navigate("/dashboard");
      }, 2000);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      console.log("Files uploaded:", Array.from(files).map(f => f.name));
      // In real app, would process uploaded files
    }
  };

  const handleLinkSubmit = (link: string) => {
    console.log("Link submitted:", link);
    // In real app, would process the link
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Optedu AI
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Generate Your Plan</h1>
            <p className="text-xl text-muted-foreground">
              Tell us what you want to learn and we'll create a personalized study plan for you
            </p>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="h-6 w-6 mr-2 text-primary" />
                Create Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-base font-medium">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. French revolution"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-base font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g. 3rd chapter, only key info"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Upload className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Use your own sources</p>
                        <p className="text-sm text-muted-foreground">Upload PDFs or paste links to customize content</p>
                      </div>
                    </div>
                    <Switch
                      checked={useOwnSources}
                      onCheckedChange={(checked) => {
                        setUseOwnSources(checked);
                        if (checked) {
                          setShowFileUpload(true);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Define plan structure</p>
                        <p className="text-sm text-muted-foreground">Customize your learning path and preferences</p>
                      </div>
                    </div>
                    <Switch
                      checked={customizeStructure}
                      onCheckedChange={setCustomizeStructure}
                    />
                  </div>
                </div>
                
                {customizeStructure && (
                  <div className="space-y-4 p-4 bg-accent/20 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary">Personalize Your Learning Path</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="learning-style" className="text-sm font-medium">Learning Style</Label>
                        <Select value={learningStyle} onValueChange={setLearningStyle}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select your learning style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visual">Visual Learner</SelectItem>
                            <SelectItem value="auditory">Auditory Learner</SelectItem>
                            <SelectItem value="kinesthetic">Kinesthetic Learner</SelectItem>
                            <SelectItem value="reading">Reading/Writing Learner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="time-available" className="text-sm font-medium">Time Available</Label>
                        <Select value={timeAvailable} onValueChange={setTimeAvailable}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="How much time do you have?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30min">30 minutes/day</SelectItem>
                            <SelectItem value="1hour">1 hour/day</SelectItem>
                            <SelectItem value="2hours">2 hours/day</SelectItem>
                            <SelectItem value="flexible">Flexible schedule</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="difficulty-level" className="text-sm font-medium">Difficulty Level</Label>
                        <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isGenerating}
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Plan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isGenerating && (
            <Card className="mt-6 bg-gradient-card border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="animate-pulse">
                    <Wand2 className="h-8 w-8 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Creating your personalized study plan...</h3>
                    <p className="text-muted-foreground">
                      Our AI is analyzing your preferences and generating the optimal learning path for "{title}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <FileUploadPopout
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileUpload={handleFileUpload}
        onLinkSubmit={handleLinkSubmit}
      />
    </div>
  );
};

export default GeneratePlan;