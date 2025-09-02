import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowLeft, Wand2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const GeneratePlan = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleUseOwnSources = () => {
    // In real app, would open file upload dialog
    console.log("Use own sources clicked");
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
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleUseOwnSources}
                    className="flex-1"
                  >
                    Use your own sources
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Define plan structure"
                    )}
                  </Button>
                </div>
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
    </div>
  );
};

export default GeneratePlan;