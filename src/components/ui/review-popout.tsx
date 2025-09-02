import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ReviewPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
}

export const ReviewPopout = ({ isOpen, onClose, questions }: ReviewPopoutProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const currentQuestion = questions[currentIndex];

  const handleSubmitAnswer = () => {
    const answerIndex = parseInt(selectedAnswer);
    setAnswers(prev => [...prev, answerIndex]);
    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
    }
  };

  const isCorrect = showResult && parseInt(selectedAnswer) === currentQuestion.correctAnswer;

  if (questions.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Review</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
              
              <RadioGroup 
                value={selectedAnswer} 
                onValueChange={setSelectedAnswer}
                disabled={showResult}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className={`flex-1 ${
                        showResult && index === currentQuestion.correctAnswer 
                          ? "text-green-600 font-medium" 
                          : showResult && index === parseInt(selectedAnswer) && !isCorrect
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {option}
                      {showResult && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-4 w-4 inline ml-2 text-green-600" />
                      )}
                      {showResult && index === parseInt(selectedAnswer) && !isCorrect && (
                        <XCircle className="h-4 w-4 inline ml-2 text-red-600" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {showResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <div></div>
            {!showResult ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={!selectedAnswer}
              >
                Submit Answer
              </Button>
            ) : currentIndex < questions.length - 1 ? (
              <Button onClick={nextQuestion}>
                Next Question
              </Button>
            ) : (
              <Button onClick={onClose}>
                Finish Review
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};