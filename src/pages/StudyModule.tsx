import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FlashcardsPopout } from "@/components/ui/flashcards-popout";
import { SummaryPopout } from "@/components/ui/summary-popout";
import { ReviewPopout } from "@/components/ui/review-popout";
import { 
  BookOpen, 
  ArrowLeft, 
  Send, 
  Lightbulb, 
  FileText, 
  RotateCcw,
  Bot,
  User,
  X
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface GeneratedContent {
  id: string;
  type: "flashcards" | "summary" | "review";
  title: string;
  data: Flashcard[] | string | Question[];
}

const StudyModule = () => {
  const { id } = useParams();
  const [currentMessage, setCurrentMessage] = useState("");
  const [activeMode, setActiveMode] = useState<"self" | "guided" | "review">("self");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Welcome to your Python Object-Oriented Programming study session! I'm here to help you master the concepts. What would you like to focus on today?",
      timestamp: new Date()
    }
  ]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [activePopout, setActivePopout] = useState<string | null>(null);

  const studyModes = [
    { id: "self", label: "Self-study mode", active: activeMode === "self" },
    { id: "guided", label: "Guided by AI Mode", active: activeMode === "guided" },
    { id: "review", label: "Review mode", active: activeMode === "review" }
  ];

  const quickActions = [
    { icon: Lightbulb, label: "Generate flashcards", action: () => handleQuickAction("flashcards") },
    { icon: FileText, label: "Create summary", action: () => handleQuickAction("summary") },
    { icon: RotateCcw, label: "Quick review", action: () => handleQuickAction("review") }
  ];

 const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentMessage.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    type: "user",
    content: currentMessage,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setCurrentMessage("");

  // ✅ fetch AI response
  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        type: "chat",     // <- tu informujemy backend że to normalne pytanie
        message: userMessage.content
      }),
    });
    const data = await res.json();

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: data.reply,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiResponse]);
  } catch (err) {
    console.error(err);
  }
};
  //------------------------------------------------------------------------------------
  const handleQuickAction = async (action: "flashcards"|"summary"|"review") => {
  const actionMessage: Message = {
    id: Date.now().toString(),
    type: "user", 
    content: `Generate ${action} for this topic`,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, actionMessage]);

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        type: action,        // <-- backend wie teraz, jaki prompt nałożyć
        message: actionMessage.content
      }),
    });

    const data = await res.json();

    // Teraz parse'ujemy w zależności od akcji:
    let newContent: GeneratedContent | null = null;

    switch (action) {
      case "flashcards":
        newContent = {
          id: Date.now().toString(),
          type: "flashcards",
          title: "Generated Flashcards",
          data: JSON.parse(data.reply)    // reply powinno być JSON Array z backendu
        };
        break;
      case "summary":
        newContent = {
          id: Date.now().toString(),
          type: "summary",
          title: "Generated Summary",
          data: data.reply                // tekst
        };
        break;
      case "review":
        newContent = {
          id: Date.now().toString(),
          type: "review",
          title: "Generated Quick Review",
          data: JSON.parse(data.reply)    // powinien być JSON array z pytaniami
        };
        break;
    }

    if (newContent) {
      setGeneratedContent(prev => [...prev, newContent]);
    }

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: `I've created a ${action} for you!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiResponse]);

  } catch (err) {
    console.error("Quick action error:", err);
  }
};
//------------------------------------------------------------------------------------------
  const removeContent = (contentId: string) => {
    setGeneratedContent(prev => prev.filter(content => content.id !== contentId));
  };

  const openPopout = (contentId: string) => {
    setActivePopout(contentId);
  };

  const closePopout = () => {
    setActivePopout(null);
  };

  const getActiveContent = () => {
    return generatedContent.find(content => content.id === activePopout);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm">
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

      <div className="flex-1 flex flex-col">
        {/* Module Header */}
        <div className="border-b border-border bg-muted/30 px-4 py-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-2">Object Python Basics</h1>
            <p className="text-muted-foreground">
              Module goals: Learn the fundamentals of object-oriented programming in Python
            </p>
            
            {/* Study Mode Selector */}
            <div className="flex flex-wrap gap-2 mt-4">
              {studyModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={mode.active ? "default" : "outline"}
                  onClick={() => setActiveMode(mode.id as any)}
                  className={mode.active ? "bg-primary text-white" : ""}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Chat Area */}  
          <div className="flex-1 flex flex-col">
            {/* Generated Content Tiles */}
            {generatedContent.length > 0 && (
              <div className="border-b border-border bg-muted/20 p-4">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Generated Content</h3>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.map((content) => (
                      <div
                        key={content.id}
                        className="group relative bg-white border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openPopout(content.id)}
                      >
                        <div className="flex items-center gap-2">
                          {content.type === "flashcards" && <Lightbulb className="h-4 w-4 text-primary" />}
                          {content.type === "summary" && <FileText className="h-4 w-4 text-primary" />}
                          {content.type === "review" && <RotateCcw className="h-4 w-4 text-primary" />}
                          <span className="text-sm font-medium">{content.title}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeContent(content.id);
                          }}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <ScrollArea className="flex-1 p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user" 
                          ? "bg-primary text-white" 
                          : "bg-gradient-accent text-white"
                      }`}>
                        {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <Card className={`${
                        message.type === "user" 
                          ? "bg-primary text-white border-primary" 
                          : "bg-card"
                      }`}>
                        <CardContent className="p-4">
                          <p className="leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.type === "user" ? "text-white/70" : "text-muted-foreground"
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border bg-muted/30">
              <div className="max-w-4xl mx-auto p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask Tutor a Question"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-border bg-white p-4">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Button className="bg-primary hover:bg-primary/90 px-8">
              Finish
            </Button>
          </div>
        </div>
      </div>

      {/* Popouts */}
      {activePopout && (() => {
        const content = getActiveContent();
        if (!content) return null;

        switch (content.type) {
          case "flashcards":
            return (
              <FlashcardsPopout
                isOpen={true}
                onClose={closePopout}
                flashcards={content.data as Flashcard[]}
              />
            );
          case "summary":
            return (
              <SummaryPopout
                isOpen={true}
                onClose={closePopout}
                summary={content.data as string}
                title={content.title}
              />
            );
          case "review":
            return (
              <ReviewPopout
                isOpen={true}
                onClose={closePopout}
                questions={content.data as Question[]}
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

export default StudyModule;
