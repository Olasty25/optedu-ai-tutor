import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Video, BookOpen, ArrowLeft, Bot, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface EgzaminChatProps {
  subject: string;
  onClose: () => void;
}

const EgzaminChat = ({ subject, onClose }: EgzaminChatProps) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subject-specific prompts and video links
  const subjectData = {
    "Język Polski": {
      prompt: "Jestem AI tutorem przygotowującym do egzaminu ósmoklasisty z języka polskiego. Pomogę Ci w nauce lektur, gramatyki, pisania wypracowań i analizie tekstów. Zadawaj mi pytania o konkretne tematy, a ja wyjaśnię je w prosty sposób i dam praktyczne wskazówki.",
      videoLink: "https://www.youtube.com/results?search_query=egzamin+%C3%B3smoklasisty+j%C4%99zyk+polski+lekcje",
      videoTitle: "Egzamin 8-klasisty - Język Polski - Lekcje i materiały"
    },
    "Język Angielski": {
      prompt: "Jestem AI tutorem przygotowującym do egzaminu ósmoklasisty z języka angielskiego. Pomogę Ci w nauce gramatyki, słownictwa, rozumienia tekstu i pisania. Mogę ćwiczyć z Tobą konwersacje, wyjaśnić trudne zagadnienia gramatyczne i przygotować Cię do wszystkich części egzaminu.",
      videoLink: "https://www.youtube.com/results?search_query=egzamin+%C3%B3smoklasisty+j%C4%99zyk+angielski+lekcje",
      videoTitle: "Egzamin 8-klasisty - Język Angielski - Lekcje i materiały"
    },
    "Matematyka": {
      prompt: "Jestem AI tutorem przygotowującym do egzaminu ósmoklasisty z matematyki. Pomogę Ci w nauce algebry, geometrii, statystyki i wszystkich działów matematycznych wymaganych na egzaminie. Mogę rozwiązywać zadania krok po kroku, wyjaśniać wzory i przygotować Cię do każdego typu zadań.",
      videoLink: "https://www.youtube.com/results?search_query=egzamin+%C3%B3smoklasisty+matematyka+lekcje",
      videoTitle: "Egzamin 8-klasisty - Matematyka - Lekcje i materiały"
    }
  };

  const currentSubjectData = subjectData[subject as keyof typeof subjectData];

  useEffect(() => {
    // Add welcome message when component mounts
    const welcomeMessage: Message = {
      id: "welcome",
      text: `Cześć! ${currentSubjectData.prompt}`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [subject, currentSubjectData.prompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.CHAT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: `${currentSubjectData.prompt}\n\nUżytkownik pyta: ${inputMessage}` 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Przepraszam, wystąpił błąd. Spróbuj ponownie za chwilę.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Chat - {subject}</CardTitle>
                <p className="text-sm text-muted-foreground">AI Tutor dla egzaminu ósmoklasisty</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentSubjectData.videoLink, '_blank')}
                className="text-xs"
              >
                <Video className="h-3 w-3 mr-1" />
                Film
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Zamknij
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {!message.isUser && (
                      <Bot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    )}
                    {message.isUser && (
                      <User className="h-4 w-4 mt-0.5 text-primary-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Zadaj pytanie o egzamin ósmoklasisty..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              💡 Wskazówka: Kliknij "Film" aby obejrzeć materiał wideo o {subject.toLowerCase()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EgzaminChat;
