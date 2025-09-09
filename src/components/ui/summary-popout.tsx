import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {summary}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};