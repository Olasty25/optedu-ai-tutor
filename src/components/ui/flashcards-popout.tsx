import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;  
  back: string;
}

interface FlashcardsPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  flashcards: Flashcard[];
}

export const FlashcardsPopout = ({ isOpen, onClose, flashcards }: FlashcardsPopoutProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  if (flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Flashcards</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
          
          <Card className="min-h-[200px] cursor-pointer" onClick={flipCard}>
            <CardContent className="flex items-center justify-center p-8 text-center">
              <p className="text-lg leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </CardContent>
          </Card>
          
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={prevCard} disabled={flashcards.length <= 1}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button variant="outline" onClick={flipCard}>
              <RotateCcw className="h-4 w-4" />
              Flip
            </Button>
            
            <Button variant="outline" onClick={nextCard} disabled={flashcards.length <= 1}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};