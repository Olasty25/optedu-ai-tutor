import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, FileText } from "lucide-react";
import { useState } from "react";

interface FileUploadPopoutProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (files: FileList | null) => void;
  onLinkSubmit: (link: string) => void;
}

export const FileUploadPopout = ({ isOpen, onClose, onFileUpload, onLinkSubmit }: FileUploadPopoutProps) => {
  const [link, setLink] = useState("");

  const handleLinkSubmit = () => {
    if (link) {
      onLinkSubmit(link);
      setLink("");
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(e.target.files);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Add Your Sources
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="link">Paste Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload PDFs, images (PNG/JPG), text/markdown, or Word documents as study material
              </p>
              <Input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.doc,.docx"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>Choose Files</span>
                </Button>
              </Label>
            </div>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="link" className="text-sm font-medium">
                  Paste a link to your study material
                </Label>
                <Input
                  id="link"
                  placeholder="https://example.com/article"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleLinkSubmit} className="w-full" disabled={!link}>
                <Link className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};