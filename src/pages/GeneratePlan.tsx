import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadPopout } from "@/components/ui/file-upload-popout";
import { SourcePreviewTiles, SourceItem } from "@/components/ui/source-preview-tiles";
import { BookOpen, ArrowLeft, Wand2, Upload, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const GeneratePlan = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useOwnSources, setUseOwnSources] = useState(false);
  const [customizeStructure, setCustomizeStructure] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [sources, setSources] = useState<SourceItem[]>([]);
  
  // Additional customization fields
  // Temporary goals inputs
  const [goalWhat, setGoalWhat] = useState("");
  const [goalWhy, setGoalWhy] = useState("");
  const [goalWhen, setGoalWhen] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      setIsGenerating(true);

      try {
        const userId = "user_" + Date.now(); // In real app, get from auth context
        const studyPlanId = Date.now().toString();

        // If we have sources, use the new backend endpoint
        if (sources.length > 0) {
          const response = await fetch("http://localhost:5000/generate-plan-with-sources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title,
              description,
              sources: sources.map(s => ({
                name: s.name,
                content: s.preview,
                type: s.type
              })),
              userId,
              studyPlanId,
              goals: {
                what: goalWhat,
                why: goalWhy,
                when: goalWhen,
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Parse the AI response
            let planData;
            try {
              planData = JSON.parse(data.plan);
            } catch {
              // If not JSON, create a simple plan structure
              planData = {
                title: title,
                description: description,
                modules: [],
                timeline: "Custom timeline",
                tips: []
              };
            }

            // Save plan
            const newPlan = {
              id: studyPlanId,
              title: planData.title || title,
              description: planData.description || description,
              goals: {
                what: goalWhat,
                why: goalWhy,
                when: goalWhen,
              },
              progress: 0,
              sources: sources,
              aiGenerated: true,
              modules: planData.modules || [],
              timeline: planData.timeline,
              tips: planData.tips || []
            };

            const existingPlans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
            const updatedPlans = [...existingPlans, newPlan];
            localStorage.setItem("studyPlans", JSON.stringify(updatedPlans));

            setIsGenerating(false);
            navigate("/dashboard");
            return;
          }
        }

        // Fallback to original logic if no sources or API fails
        // Ask AI to lightly refine the title and description
        let refinedTitle = title;
        let refinedDescription = description;
        try {
          const res = await fetch("/api/chat.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "chat",
              message: `You are improving study plan metadata. Given the following title and description, lightly improve wording for clarity and concision while preserving meaning. Return ONLY valid JSON with keys title and description.\nTitle: ${title}\nDescription: ${description}\nRespond only as: {\"title\":\"...\",\"description\":\"...\"}`,
            }),
          });
          const data = await res.json();
          try {
            const parsed = JSON.parse(data.reply);
            if (parsed?.title && parsed?.description) {
              refinedTitle = String(parsed.title);
              refinedDescription = String(parsed.description);
            }
          } catch {
            // If not JSON, ignore and use originals
          }
        } catch {
          // If refinement fails, proceed with originals
        }

        // Save plan (refined)
        const newPlan = {
          id: Date.now().toString(),
          title: refinedTitle,
          description: refinedDescription,
          goals: {
            what: goalWhat,
            why: goalWhy,
            when: goalWhen,
          },
          progress: 0,
        };

        const existingPlans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
        const updatedPlans = [...existingPlans, newPlan];
        localStorage.setItem("studyPlans", JSON.stringify(updatedPlans));

        setIsGenerating(false);
        navigate("/dashboard");
      } catch (error) {
        console.error("Error generating plan:", error);
        setIsGenerating(false);
        // Still navigate to dashboard even if there's an error
        navigate("/dashboard");
      }
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        // Add file to sources with uploading status
        const tempId = Date.now().toString() + Math.random();
        const newSource: SourceItem = {
          id: tempId,
          type: 'file',
          name: file.name,
          size: file.size,
          status: 'uploading'
        };
        
        setSources(prev => [...prev, newSource]);
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', 'user_' + Date.now());
          formData.append('studyPlanId', 'temp');

          console.log('Uploading file:', file.name, 'Size:', file.size);

          const response = await fetch('http://localhost:5000/upload-file', {
            method: 'POST',
            body: formData,
          });
          console.log('Upload response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('Upload successful:', data);
            setSources(prev => prev.map(s => 
              s.id === tempId 
                ? { ...data.file, id: tempId }
                : s
            ));
          } else {
            const errorData = await response.json();
            console.error('Upload failed:', errorData);
            setSources(prev => prev.map(s => 
              s.id === tempId 
                ? { ...s, status: 'error', error: errorData.error || 'Upload failed' }
                : s
            ));
          }
        } catch (error) {
          console.error('File upload error:', error);
          setSources(prev => prev.map(s => 
            s.id === tempId 
              ? { ...s, status: 'error', error: 'Network error: ' + error.message }
              : s
          ));
        }
      }
    }
  };

  const handleLinkSubmit = async (link: string) => {
    if (link) {
      const tempId = Date.now().toString() + Math.random();
      const newSource: SourceItem = {
        id: tempId,
        type: 'link',
        name: new URL(link).hostname,
        url: link,
        status: 'processing'
      };
      
      setSources(prev => [...prev, newSource]);
      
      try {
        const response = await fetch('http://localhost:5000/scrape-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: link,
            userId: 'user_' + Date.now(),
            studyPlanId: 'temp'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSources(prev => prev.map(s => 
            s.id === tempId 
              ? { ...data.file, id: tempId }
              : s
          ));
        } else {
          const errorData = await response.json();
          setSources(prev => prev.map(s => 
            s.id === tempId 
              ? { ...s, status: 'error', error: errorData.error }
              : s
          ));
        }
      } catch (error) {
        console.error('Link processing error:', error);
        setSources(prev => prev.map(s => 
          s.id === tempId 
            ? { ...s, status: 'error', error: 'Processing failed' }
            : s
        ));
      }
    }
  };

  const handleRemoveSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleRetrySource = (id: string) => {
    // For now, just remove the failed source
    // In a real app, you might want to retry the processing
    handleRemoveSource(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>{t('generatePlan.backToDashboard')}</span>
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
            <h1 className="text-4xl font-bold mb-4">{t('generatePlan.title')}</h1>
            <p className="text-xl text-muted-foreground">
              {t('generatePlan.description')}
            </p>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="h-6 w-6 mr-2 text-primary" />
                {t('generatePlan.createStudyPlan')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-base font-medium">{t('generatePlan.planTitle')}</Label>
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
                  <Label htmlFor="description" className="text-base font-medium">{t('generatePlan.planDescription')}</Label>
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
                        <p className="font-medium">{t('generatePlan.useOwnSources')}</p>
                        <p className="text-sm text-muted-foreground">{t('generatePlan.useOwnSourcesDescription')}</p>
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
                        <p className="font-medium">{t('generatePlan.definePlanStructure')}</p>
                        <p className="text-sm text-muted-foreground">{t('generatePlan.definePlanStructureDescription')}</p>
                      </div>
                    </div>
                    <Switch
                      checked={customizeStructure}
                      onCheckedChange={setCustomizeStructure}
                    />
                  </div>
                </div>
                
                {useOwnSources && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFileUpload(true)}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>{t('generatePlan.addSources')}</span>
                      </Button>
                    </div>
                    <SourcePreviewTiles
                      sources={sources}
                      onRemove={handleRemoveSource}
                      onRetry={handleRetrySource}
                    />
                  </div>
                )}

                {customizeStructure && (
                  <div className="space-y-4 p-4 bg-accent/20 rounded-lg border border-primary/20">
                    <h3 className="font-semibold text-primary">{t('generatePlan.temporaryGoals')}</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="goal-what" className="text-sm font-medium">{t('generatePlan.whatDoYouWantToAchieve')}</Label>
                        <Input id="goal-what" className="mt-2" value={goalWhat} onChange={(e) => setGoalWhat(e.target.value)} placeholder="e.g., understand core causes of the French Revolution" />
                      </div>
                      <div>
                        <Label htmlFor="goal-why" className="text-sm font-medium">{t('generatePlan.whyIsThisImportant')}</Label>
                        <Input id="goal-why" className="mt-2" value={goalWhy} onChange={(e) => setGoalWhy(e.target.value)} placeholder="e.g., upcoming test or project" />
                      </div>
                      <div>
                        <Label htmlFor="goal-when" className="text-sm font-medium">{t('generatePlan.byWhenDoYouWant')}</Label>
                        <Input id="goal-when" className="mt-2" value={goalWhen} onChange={(e) => setGoalWhen(e.target.value)} placeholder="e.g., within 7 days" />
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
                      {t('generatePlan.generatingPlan')}
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      {t('generatePlan.generatePlan')}
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
                    <h3 className="text-lg font-semibold mb-2">{t('generatePlan.creatingPersonalizedPlan')}</h3>
                    <p className="text-muted-foreground">
                      {t('generatePlan.aiAnalyzingPreferences')} "{title}"
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