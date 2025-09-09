import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Link, X, FileImage, File, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface SourceItem {
  id: string;
  type: 'file' | 'link';
  name: string;
  size?: number;
  url?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  preview?: string;
  error?: string;
}

interface SourcePreviewTilesProps {
  sources: SourceItem[];
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
}

export const SourcePreviewTiles = ({ sources, onRemove, onRetry }: SourcePreviewTilesProps) => {
  const { t } = useLanguage();
  
  if (sources.length === 0) return null;

  const getFileIcon = (source: SourceItem) => {
    if (source.type === 'link') return <Link className="h-4 w-4" />;
    
    const extension = source.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FileImage className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: SourceItem['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: SourceItem['status']) => {
    switch (status) {
      case 'uploading':
        return t('generatePlan.uploading');
      case 'processing':
        return t('generatePlan.processing');
      case 'ready':
        return t('generatePlan.ready');
      case 'error':
        return t('generatePlan.error');
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{t('generatePlan.uploadedSources')}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sources.map((source) => (
          <Card key={source.id} className="relative group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-0.5">
                    {getFileIcon(source)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium truncate" title={source.name}>
                        {source.name}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(source.status)}`}
                      >
                        {getStatusText(source.status)}
                      </Badge>
                    </div>
                    
                    {source.type === 'file' && source.size && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(source.size)}
                      </p>
                    )}
                    
                    {source.type === 'link' && source.url && (
                      <div className="flex items-center space-x-1 mt-1">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 truncate"
                        >
                          {source.url}
                        </a>
                      </div>
                    )}
                    
                    {source.preview && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {source.preview}
                      </p>
                    )}
                    
                    {source.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {source.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  {source.status === 'error' && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(source.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(source.id)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
