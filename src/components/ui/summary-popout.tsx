import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  title: string;
}

export const SummaryPopout = ({ isOpen, onClose, summary, title }: SummaryPopoutProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title} - Summary</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                {summary.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};