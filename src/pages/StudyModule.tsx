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
      content: "Welcome to your test study session! I'm here to help you master optimalization of learning. What would you like to focus on today?",
      timestamp: new Date()
    },
    {
      id: "2",
      type: "user",
      content: "Tell me about React hooks.",
      timestamp: new Date()
    },
    {
      id: "3",
      type: "ai",
      content: "React Hooks are functions that let you “hook into” React state and lifecycle features from function components. They allow you to use state and other React features without writing a class. Popular hooks include `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`, and `useRef`.",
      timestamp: new Date()
    },
    {
      id: "4",
      type: "user",
      content: "What is the purpose of useEffect?",
      timestamp: new Date()
    },
    {
      id: "5",
      type: "ai",
      content: "`useEffect` is a React Hook that lets you synchronize a component with an external system. You can use it to perform side effects like data fetching, subscriptions, or manually changing the DOM from a function component. It runs after every render of the component by default, but you can control when it runs using its dependency array.",
      timestamp: new Date()
    }
  ]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [activePopout, setActivePopout] = useState<string | null>(null);

  // Nowe stany do obsługi wyboru wiadomości
  const [isSelectingMessages, setIsSelectingMessages] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [currentActionType, setCurrentActionType] = useState<"flashcards" | "summary" | "review" | null>(null);

  const studyModes = [
    { id: "self", label: "Self-study mode", active: activeMode === "self" },
    { id: "guided", label: "Guided by AI Mode", active: activeMode === "guided" },
    { id: "review", label: "Review mode", active: activeMode === "review" }
  ];

  // Funkcja, która rozpoczyna tryb wyboru wiadomości
  const handleQuickAction = (action: "flashcards" | "summary" | "review") => {
    setIsSelectingMessages(true);
    setCurrentActionType(action);
    setSelectedMessageIds([]); // Wyczyść poprzednie zaznaczenia
  };

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
      // Wysyłamy zapytanie do naszego backendu /api/chat
      const res = await fetch("/api/chat.js", { // Zauważ .js, jeśli to lokalny plik API w /pages/api
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat", // Informujemy backend, że to zwykła rozmowa
          message: userMessage.content,
        }),
      });

      const data = await res.json();
      if (res.status !== 200) {
          throw new Error(data.error || "Something went wrong");
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error("Chat error:", err);
      // Możesz tu dodać wiadomość o błędzie dla użytkownika
      const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: "Sorry, I couldn't get a response. Please try again.",
          timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    }
  };

  // Funkcja do przełączania zaznaczenia wiadomości AI
  const toggleMessageSelection = (messageId: string) => {
    if (!isSelectingMessages) return; // Tylko w trybie wyboru

    setSelectedMessageIds(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Funkcja do generowania treści z wybranych wiadomości
  const handleGenerateFromSelection = async () => {
    if (selectedMessageIds.length === 0 || !currentActionType) {
      alert("Please select at least one AI message to generate content.");
      return;
    }

    // Zbierz treść wybranych wiadomości AI
    const selectedContent = messages
      .filter(msg => msg.type === "ai" && selectedMessageIds.includes(msg.id))
      .map(msg => msg.content)
      .join("\n\n---\n\n"); // Połącz treści z separatorem

    if (!selectedContent.trim()) {
        alert("Selected messages have no content.");
        return;
    }

    const userActionMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: `Generate ${currentActionType} based on selected messages.`,
        timestamp: new Date()
    };
    setMessages(prev => [...prev, userActionMessage]);

    try {
      // Wysyłamy zapytanie do naszego backendu /api/chat
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: currentActionType, // Informujemy backend, co ma wygenerować
          message: selectedContent, // Wysyłamy połączoną treść
        }),
      });
  
      const data = await res.json();
      if (res.status !== 200) {
          throw new Error(data.error || "Something went wrong");
      }
  
      let newContent: GeneratedContent | null = null;
      let aiConfirmationMessage = `I've created a ${currentActionType} for you from the selected messages! Click the tile above to see it.`;
  
      try {
          switch (currentActionType) {
            case "flashcards":
              newContent = { id: Date.now().toString(), type: "flashcards", title: "Generated Flashcards", data: JSON.parse(data.reply) };
              break;
            case "summary":
              newContent = { id: Date.now().toString(), type: "summary", title: "Generated Summary", data: data.reply };
              break;
            case "review":
              newContent = { id: Date.now().toString(), type: "review", title: "Generated Review", data: JSON.parse(data.reply) };
              break;
          }
      } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          aiConfirmationMessage = "I tried to generate content, but the format was incorrect. Here is the raw response: " + data.reply;
      }
  
      if (newContent) {
        setGeneratedContent((prev) => [...prev, newContent]);
      }
  
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiConfirmationMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
  
    } catch (err) {
      console.error("Generate from selection error:", err);
      const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `Sorry, I couldn't generate the ${currentActionType} from the selected messages. Please try again.`,
          timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
        // Zresetuj tryb wyboru po zakończeniu generowania
        setIsSelectingMessages(false);
        setSelectedMessageIds([]);
        setCurrentActionType(null);
    }
  };

  // Funkcja do anulowania trybu wyboru
  const handleCancelSelection = () => {
    setIsSelectingMessages(false);
    setSelectedMessageIds([]);
    setCurrentActionType(null);
  };
  
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
                {messages.map((message) => {
                  const isSelected = isSelectingMessages && message.type === "ai" && selectedMessageIds.includes(message.id);
                  const isSelectableAiMessage = isSelectingMessages && message.type === "ai";

                  return (
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
                        <Card
                          className={`
                            ${message.type === "user" 
                              ? "bg-primary text-white border-primary" 
                              : "bg-card"
                            } 
                            ${isSelectableAiMessage ? "cursor-pointer" : ""} 
                            ${isSelected ? "opacity-70 border-2 border-primary" : ""}
                          `}
                          onClick={() => isSelectableAiMessage && toggleMessageSelection(message.id)}
                        >
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
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input Area (zmieniony o tryb wyboru) */}
            <div className="border-t border-border bg-muted/30">
              <div className="max-w-4xl mx-auto p-4">
                {isSelectingMessages ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      Select AI messages to generate {currentActionType} from.
                      ({selectedMessageIds.length} selected)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerateFromSelection}
                        disabled={selectedMessageIds.length === 0}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        Generate {currentActionType}
                      </Button>
                      <Button
                        onClick={handleCancelSelection}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
