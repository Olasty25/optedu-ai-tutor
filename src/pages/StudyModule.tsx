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
  X,
  Plus,
  Expand,
  RefreshCw,
  StickyNote,
  MapPin
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { startStudySession, endStudySession, markPlanCompleted, getCurrentUserId as getTrackingUserId } from "@/lib/tracking";

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

interface Note {
  id: string;
  content: string;
  timestamp: string;
  source: string;
}

const StudyModule = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { isPro } = useAuth();
  const { toast } = useToast();
  const [currentMessage, setCurrentMessage] = useState("");
  const [activeMode, setActiveMode] = useState<"self" | "guided" | "review">("self");
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [activePopout, setActivePopout] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [progressTest, setProgressTest] = useState<Question[]>([]);
  const [currentTestQuestion, setCurrentTestQuestion] = useState(0);
  const [testAnswers, setTestAnswers] = useState<number[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [questionLimitReached, setQuestionLimitReached] = useState(false);
  const [lastAIMessageId, setLastAIMessageId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Nowe stany do obsługi wyboru wiadomości
  const [isSelectingMessages, setIsSelectingMessages] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [currentActionType, setCurrentActionType] = useState<"flashcards" | "summary" | "review" | null>(null);
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);

  const studyModes = [
    { id: "self", label: t('studyModule.studyTalk'), active: activeMode === "self" },
    { id: "guided", label: t('studyModule.yourNotes'), active: activeMode === "guided" },
    { id: "review", label: t('studyModule.yourProgress'), active: activeMode === "review" }
  ];

  // Funkcja, która rozpoczyna tryb wyboru wiadomości
  const handleQuickAction = (action: "flashcards" | "summary" | "review") => {
    setIsSelectingMessages(true);
    setCurrentActionType(action);
    setSelectedMessageIds([]); // Wyczyść poprzednie zaznaczenia
  };

  const quickActions = [
    { icon: Lightbulb, label: t('studyModule.generateFlashcards'), action: () => handleQuickAction("flashcards") },
    { icon: FileText, label: t('studyModule.createSummary'), action: () => handleQuickAction("summary") },
    { icon: RotateCcw, label: t('studyModule.quickReview'), action: () => handleQuickAction("review") }
  ];

  // Get current user ID (you might want to get this from auth context)
  const getCurrentUserId = () => {
    // For now, using a simple user ID from localStorage
    // In a real app, this would come from your auth system
    let userId = localStorage.getItem("currentUserId");
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("currentUserId", userId);
    }
    return userId;
  };

  // Load messages and generated content from database
  const loadStudySession = async () => {
    const planId = String(id || "");
    const userId = getCurrentUserId();
    
    if (!planId) {
      setIsLoading(false);
      return;
    }

    try {
      // Load messages
      let loadedMessages: Message[] = [];
      try {
        const messagesRes = await fetch(`/api/messages?userId=${userId}&studyPlanId=${planId}`);
        if (messagesRes.ok) {
          const messagesData = await messagesRes.json();
          loadedMessages = messagesData.messages.map((msg: any) => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(loadedMessages);
        }
      } catch (error) {
        console.log("Backend not available, using local storage fallback");
      }

      // Load generated content
      try {
        const contentRes = await fetch(`/api/generated-content?userId=${userId}&studyPlanId=${planId}`);
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          setGeneratedContent(contentData.content);
        }
      } catch (error) {
        console.log("Backend not available for generated content");
      }

      // If no messages exist, show intro
      if (loadedMessages.length === 0) {
        const flagKey = `introShown:${planId}`;
        const alreadyShown = localStorage.getItem(flagKey) === "true";
        
        if (!alreadyShown) {
          try {
            const plansRaw = localStorage.getItem("studyPlans") || "[]";
            const plans = JSON.parse(plansRaw) as Array<{ id: string; title: string; description?: string }>;
            const plan = plans.find(p => p.id === planId);
            const topic = plan?.title || "this topic";
            const context = plan?.description ? `\nContext: ${plan.description}` : "";

            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "summary",
                message: `Provide the key information, core concepts, and must-know facts about: ${topic}.${context}\nKeep it concise as a starter briefing.`
              })
            });
            const data = await res.json();
            const content = typeof data?.reply === "string" ? data.reply : "Here are the key points to get started.";
            const aiIntro: Message = {
              id: (Date.now() + 2).toString(),
              type: "ai",
              content,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiIntro]);
            localStorage.setItem(flagKey, "true");
          } catch (e) {
            // Fail silently if the auto-intro cannot be fetched
            localStorage.setItem(flagKey, "true");
          }
        }
      }
    } catch (error) {
      console.error("Error loading study session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notes from localStorage
  const loadNotes = () => {
    const planId = String(id || "");
    const notesKey = `studyNotes_${planId}`;
    const savedNotes = JSON.parse(localStorage.getItem(notesKey) || "[]");
    setNotes(savedNotes);
  };

  // Load study session on component mount
  useEffect(() => {
    loadStudySession();
    loadNotes();
    checkQuestionLimit();
    
    // Start tracking study session
    const planId = String(id || "");
    if (planId) {
      const sessionId = startStudySession(planId);
      setCurrentSessionId(sessionId);
    }
    
    // Cleanup function to end session when component unmounts
    return () => {
      if (currentSessionId) {
        endStudySession(currentSessionId);
      }
    };
  }, [id]);

  // Check question limit for non-PRO users
  const checkQuestionLimit = async () => {
    if (!isPro) {
      try {
        const planId = String(id || "");
        const userId = getCurrentUserId();
        const response = await fetch(`/api/messages?userId=${userId}&studyPlanId=${planId}&action=count`);
        if (response.ok) {
          const data = await response.json();
          setUserMessageCount(data.count);
          setQuestionLimitReached(data.count >= 8);
        }
      } catch (error) {
        console.error("Error checking question limit:", error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    // Check question limit for non-PRO users
    if (!isPro && questionLimitReached) {
      alert(t('studyModule.questionLimitReached'));
      return;
    }

    const planId = String(id || "");
    const userId = getCurrentUserId();

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");

    // Update question count for non-PRO users
    if (!isPro) {
      setUserMessageCount(prev => prev + 1);
      if (userMessageCount + 1 >= 8) {
        setQuestionLimitReached(true);
      }
    }

    // ✅ fetch AI response
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          message: userMessage.content,
          userId: userId,
          studyPlanId: planId
        }),
      });

      const data = await res.json();
      if (res.status !== 200) {
          throw new Error(data.error || t('studyModule.somethingWentWrong'));
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLastAIMessageId(aiResponse.id);
    } catch (err) {
      console.error("Chat error:", err);
      const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: t('studyModule.sorryCouldntGetResponse'),
          timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
      setLastAIMessageId(errorResponse.id);
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
          throw new Error(data.error || t('studyModule.somethingWentWrong'));
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
        
        // Save generated content to database
        try {
          await fetch("/api/generated-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contentId: newContent.id,
              userId: getCurrentUserId(),
              studyPlanId: String(id || ""),
              type: newContent.type,
              title: newContent.title,
              data: newContent.data
            }),
          });
        } catch (error) {
          console.error("Error saving generated content:", error);
        }
      }
  
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiConfirmationMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLastAIMessageId(aiResponse.id);
      
      // Show toast notification for successful generation
      toast({
        title: `${currentActionType?.charAt(0).toUpperCase()}${currentActionType?.slice(1)} Generated!`,
        description: "Click the tile above to view it.",
      });
  
    } catch (err) {
      console.error("Generate from selection error:", err);
      const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `${t('studyModule.sorryCouldntGenerate')} ${currentActionType} ${t('studyModule.fromSelectedMessages')}`,
          timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
      setLastAIMessageId(errorResponse.id);
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

  // Handle AI message actions
  const handleAIMessageAction = async (messageId: string, action: "tell-more" | "elaborate" | "regenerate" | "add-to-notes") => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message || message.type !== "ai") return;

    setProcessingMessageId(messageId);
    const planId = String(id || "");
    const userId = getCurrentUserId();

    let prompt = "";
    switch (action) {
      case "tell-more":
        prompt = `Please provide more detailed information about: ${message.content}`;
        break;
      case "elaborate":
        prompt = `Please elaborate and expand on this topic: ${message.content}`;
        break;
      case "regenerate":
        prompt = `Please provide a fresh perspective on this topic: ${message.content}`;
        break;
      case "add-to-notes":
        // Add to notes functionality - save to localStorage for now
        const notesKey = `studyNotes_${planId}`;
        const existingNotes = JSON.parse(localStorage.getItem(notesKey) || "[]");
        const newNote = {
          id: Date.now().toString(),
          content: message.content,
          timestamp: new Date().toISOString(),
          source: "AI Response"
        };
        existingNotes.push(newNote);
        localStorage.setItem(notesKey, JSON.stringify(existingNotes));
        
        // Refresh notes display
        loadNotes();
        
        // Show toast notification instead of AI message
        toast({
          title: t('auth.addedToNotes'),
          description: t('auth.checkItOut'),
        });
        setProcessingMessageId(null);
        return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          message: prompt,
          userId: userId,
          studyPlanId: planId
        }),
      });

      const data = await res.json();
      if (res.status !== 200) {
          throw new Error(data.error || t('studyModule.somethingWentWrong'));
      }

      const aiResponse: Message = {
        id: lastAIMessageId || (Date.now() + 1).toString(),
        type: "ai",
        content: data.reply,
        timestamp: new Date(),
      };
      
      // Replace the last AI message instead of adding a new one
      setMessages((prev) => {
        const filteredMessages = prev.filter(msg => msg.id !== lastAIMessageId);
        return [...filteredMessages, aiResponse];
      });
      setLastAIMessageId(aiResponse.id);
    } catch (err) {
      console.error("AI action error:", err);
      const errorResponse: Message = {
          id: lastAIMessageId || (Date.now() + 1).toString(),
          type: "ai",
          content: t('studyModule.sorryCouldntProcess'),
          timestamp: new Date(),
      };
      
      // Replace the last AI message with error instead of adding a new one
      setMessages((prev) => {
        const filteredMessages = prev.filter(msg => msg.id !== lastAIMessageId);
        return [...filteredMessages, errorResponse];
      });
      setLastAIMessageId(errorResponse.id);
    } finally {
      setProcessingMessageId(null);
    }
  };
  
  const removeContent = async (contentId: string) => {
    setGeneratedContent(prev => prev.filter(content => content.id !== contentId));
    
    // Delete from database
    try {
      await fetch(`/api/generated-content?contentId=${contentId}&action=delete`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: getCurrentUserId() })
      });
    } catch (error) {
      console.error("Error deleting generated content:", error);
    }
  };

  const removeNote = (noteId: string) => {
    const planId = String(id || "");
    const notesKey = `studyNotes_${planId}`;
    const updatedNotes = notes.filter(note => note.id !== noteId);
    localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  // Generate progress test
  const generateProgressTest = async () => {
    const planId = String(id || "");
    const userId = getCurrentUserId();
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "review",
          message: `Create a comprehensive test with 10 challenging multiple-choice questions about this topic. Make sure the questions test deep understanding and application of concepts.`,
          userId: userId,
          studyPlanId: planId
        }),
      });

      const data = await res.json();
      if (res.status !== 200) {
        throw new Error(data.error || "Something went wrong");
      }

      const questions = JSON.parse(data.reply);
      setProgressTest(questions);
      setCurrentTestQuestion(0);
      setTestAnswers(new Array(questions.length).fill(-1));
      setTestCompleted(false);
    } catch (err) {
      console.error("Error generating progress test:", err);
    }
  };

  // Handle test answer selection
  const handleTestAnswer = (answerIndex: number) => {
    const newAnswers = [...testAnswers];
    newAnswers[currentTestQuestion] = answerIndex;
    setTestAnswers(newAnswers);
  };

  // Submit test
  const submitTest = () => {
    setTestCompleted(true);
  };

  // Reset test
  const resetTest = () => {
    setProgressTest([]);
    setCurrentTestQuestion(0);
    setTestAnswers([]);
    setTestCompleted(false);
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
            <span>{t('studyModule.backToDashboard')}</span>
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
            <h1 className="text-2xl font-bold mb-2">{(() => {
              try {
                const plans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
                const plan = plans.find((p: any) => String(p.id) === String(id));
                return plan?.title || t('studyModule.studyModule');
              } catch {
                return t('studyModule.studyModule');
              }
            })()}</h1>
            <p className="text-muted-foreground">{(() => {
              try {
                const plans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
                const plan = plans.find((p: any) => String(p.id) === String(id));
                return plan?.description || t('studyModule.personalizedLearningGoals');
              } catch {
                return t('studyModule.personalizedLearningGoals');
              }
            })()}</p>
            
            {/* Study Mode Selector */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {studyModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant={mode.active ? "default" : "outline"}
                  onClick={() => setActiveMode(mode.id as any)}
                  className={`h-12 text-sm font-medium transition-all duration-200 ${
                    mode.active 
                      ? "bg-gradient-hero text-white shadow-lg hover:shadow-xl" 
                      : "bg-white hover:bg-muted border-2 hover:border-primary/30"
                  }`}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Chat Area or Notes Area */}  
          <div className="flex-1 flex flex-col">
            {/* Notes Section - Show when in "Your Notes" mode */}
            {activeMode === "guided" && (
              <div className="border-b border-border bg-muted/20 p-4">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('studyModule.yourSavedNotes')}</h3>
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>{t('studyModule.noNotesSaved')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="group relative bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                >
                                  {note.content}
                                </ReactMarkdown>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(note.timestamp).toLocaleString()} • {note.source}
                              </p>
                            </div>
                            <button
                              onClick={() => removeNote(note.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Section - Show when in "Your Progress" mode */}
            {activeMode === "review" && (
              <div className="border-b border-border bg-muted/20 p-4">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('studyModule.yourProgressTest')}</h3>
                  {progressTest.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mb-4">
                        <RotateCcw className="h-16 w-16 mx-auto text-primary/50 mb-4" />
                        <h4 className="text-lg font-semibold mb-2">{t('studyModule.readyToTestKnowledge')}</h4>
                        <p className="text-muted-foreground mb-6">
                          {t('studyModule.testDescription')}
                        </p>
                        <Button 
                          onClick={generateProgressTest}
                          className="bg-gradient-hero hover:opacity-90 text-white px-8 py-3"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {t('studyModule.startProgressTest')}
                        </Button>
                      </div>
                    </div>
                  ) : !testCompleted ? (
                    <div className="space-y-6">
                      {/* Progress Bar */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-hero h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentTestQuestion + 1) / progressTest.length) * 100}%` }}
                        ></div>
                      </div>
                      
                      {/* Question Counter */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {t('studyModule.question')} {currentTestQuestion + 1} {t('studyModule.of')} {progressTest.length}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(((currentTestQuestion + 1) / progressTest.length) * 100)}% {t('studyModule.complete')}
                        </span>
                      </div>

                      {/* Current Question */}
                      <div className="bg-white border border-border rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">
                          {progressTest[currentTestQuestion]?.question}
                        </h4>
                        <div className="space-y-3">
                          {progressTest[currentTestQuestion]?.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleTestAnswer(index)}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                testAnswers[currentTestQuestion] === index
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                              }`}
                            >
                              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Navigation */}
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTestQuestion(Math.max(0, currentTestQuestion - 1))}
                          disabled={currentTestQuestion === 0}
                        >
                          {t('studyModule.previous')}
                        </Button>
                        <div className="flex gap-2">
                          {currentTestQuestion === progressTest.length - 1 ? (
                            <Button
                              onClick={submitTest}
                              className="bg-gradient-hero hover:opacity-90 text-white"
                              disabled={testAnswers.some(answer => answer === -1)}
                            >
                              {t('studyModule.submitTest')}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setCurrentTestQuestion(Math.min(progressTest.length - 1, currentTestQuestion + 1))}
                              disabled={testAnswers[currentTestQuestion] === -1}
                            >
                              {t('studyModule.next')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Test Results */
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-hero rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {Math.round((testAnswers.filter((answer, index) => answer === progressTest[index]?.correctAnswer).length / progressTest.length) * 100)}%
                          </span>
                        </div>
                        <h4 className="text-xl font-semibold mb-2">{t('studyModule.testCompleted')}</h4>
                        <p className="text-muted-foreground">
                          {t('studyModule.youScored')} {testAnswers.filter((answer, index) => answer === progressTest[index]?.correctAnswer).length} {t('studyModule.outOf')} {progressTest.length} {t('studyModule.questionsCorrectly')}
                        </p>
                      </div>

                      {/* Detailed Results */}
                      <div className="space-y-4">
                        {progressTest.map((question, index) => {
                          const isCorrect = testAnswers[index] === question.correctAnswer;
                          return (
                            <div key={index} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                }`}>
                                  {isCorrect ? '✓' : '✗'}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium mb-2">{question.question}</p>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {t('studyModule.yourAnswer')} {question.options[testAnswers[index]]}
                                  </p>
                                  {!isCorrect && (
                                    <p className="text-sm text-green-600 font-medium">
                                      {t('studyModule.correctAnswer')} {question.options[question.correctAnswer]}
                                    </p>
                                  )}
                                  <p className="text-sm text-muted-foreground mt-2">
                                    <strong>{t('studyModule.explanation')}</strong> {question.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-center">
                        <Button onClick={resetTest} variant="outline" className="mr-3">
                          {t('studyModule.takeAnotherTest')}
                        </Button>
                        <Button onClick={resetTest} className="bg-gradient-hero hover:opacity-90 text-white">
                          {t('studyModule.backToStudy')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Content Tiles - Show when not in notes or progress mode */}
            {activeMode !== "guided" && activeMode !== "review" && generatedContent.length > 0 && (
              <div className="border-b border-border bg-muted/20 p-4">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('studyModule.generatedContent')}</h3>
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
            
            {/* Chat Area - Show when not in notes or progress mode */}
            {activeMode !== "guided" && activeMode !== "review" && (
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">{t('studyModule.loadingConversation')}</div>
                    </div>
                  ) : (
                    messages.map((message) => {
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
                          // TO JEST KLUCZOWY FRAGMENT, KTÓRY POPRAWIŁEM:
                          className={ // Pojedynczy otwierający nawias klamrowy JSX dla całej wartości propa className
                            `${message.type === "user" 
                              ? "bg-primary text-white border-primary" 
                              : "bg-card"
                            } 
                            ${isSelectableAiMessage ? "cursor-pointer" : ""} 
                            ${isSelected ? "opacity-70 border-2 border-primary" : ""}` // Pojedynczy zamykający backtick dla template literalu
                          } // Pojedynczy zamykający nawias klamrowy JSX dla wartości propa className
                          onClick={() => isSelectableAiMessage && toggleMessageSelection(message.id)}
                        >
                          <CardContent className="p-4">
                            {message.type === "ai" ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeHighlight]}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            )}
                            <p className={`text-xs mt-2 ${
                              message.type === "user" ? "text-white/70" : "text-muted-foreground"
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            
                            {/* AI Message Action Tiles */}
                            {message.type === "ai" && (
                              <div className="flex gap-2 mt-3 justify-between">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAIMessageAction(message.id, "tell-more")}
                                    disabled={processingMessageId === message.id}
                                    className="text-xs h-7 px-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                                  >
                                    {processingMessageId === message.id ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Plus className="h-3 w-3 mr-1" />
                                        {t('studyModule.tellMeMore')}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAIMessageAction(message.id, "elaborate")}
                                    disabled={processingMessageId === message.id}
                                    className="text-xs h-7 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                  >
                                    {processingMessageId === message.id ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Expand className="h-3 w-3 mr-1" />
                                        {t('studyModule.elaborate')}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAIMessageAction(message.id, "regenerate")}
                                    disabled={processingMessageId === message.id}
                                    className="text-xs h-7 px-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
                                  >
                                    {processingMessageId === message.id ? (
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        {t('studyModule.regenerate')}
                                      </>
                                    )}
                                  </Button>
                                </div>
                                
                                {/* Add to Notes - smaller tile in bottom right */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAIMessageAction(message.id, "add-to-notes")}
                                  disabled={processingMessageId === message.id}
                                  className="text-xs h-6 px-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                                >
                                  {processingMessageId === message.id ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <StickyNote className="h-3 w-3 mr-1" />
                                      {t('studyModule.addToNotes')}
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })
                )}
                </div>
              </ScrollArea>
            )}

            {/* Input Area - Show when not in notes or progress mode */}
            {activeMode !== "guided" && activeMode !== "review" && (
              <div className="border-t border-border bg-muted/30">
                <div className="max-w-4xl mx-auto p-4">
                {isSelectingMessages ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                      {t('studyModule.selectAIMessages')} {currentActionType} {t('studyModule.from')}
                      ({selectedMessageIds.length} {t('studyModule.selected')})
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGenerateFromSelection}
                        disabled={selectedMessageIds.length === 0}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {t('studyModule.generate')} {currentActionType}
                      </Button>
                      <Button
                        onClick={handleCancelSelection}
                        variant="outline"
                        className="flex-1"
                      >
                        {t('studyModule.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!isPro && (
                      <div className="mb-3 p-2 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Questions: {userMessageCount}/8 (Free limit)</span>
                          {questionLimitReached && (
                            <span className="text-destructive font-medium">Limit Reached</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder={questionLimitReached && !isPro ? "Upgrade to PRO to continue" : t('studyModule.askTutorQuestion')}
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        className="flex-1"
                        disabled={questionLimitReached && !isPro}
                      />
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90"
                        disabled={questionLimitReached && !isPro}
                      >
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
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-border bg-white p-4">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Button 
              className="bg-primary hover:bg-primary/90 px-8"
              onClick={() => {
                // End current session
                if (currentSessionId) {
                  endStudySession(currentSessionId);
                }
                // Mark plan as completed
                const planId = String(id || "");
                if (planId) {
                  markPlanCompleted(planId);
                }
                // Navigate back to dashboard
                window.location.href = '/dashboard';
              }}
            >
              {t('studyModule.finish')}
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
