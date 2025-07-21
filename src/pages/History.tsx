import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { 
  History as HistoryIcon, 
  FileText, 
  Image, 
  Scissors, 
  FileUser,
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import { apiService } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface HistoryItem {
  id: string;
  type: 'article' | 'image' | 'background-removal' | 'resume-analysis';
  title: string;
  description?: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  metadata?: any;
}

export default function History() {
  const { data: historyItems, isLoading, error } = useQuery({
    queryKey: ['history'],
    queryFn: () => apiService.getHistory(50),
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return FileText;
      case 'image':
        return Image;
      case 'background-removal':
        return Scissors;
      case 'resume-analysis':
        return FileUser;
      default:
        return HistoryIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article':
        return 'text-blue-500 bg-blue-500/10';
      case 'image':
        return 'text-purple-500 bg-purple-500/10';
      case 'background-removal':
        return 'text-green-500 bg-green-500/10';
      case 'resume-analysis':
        return 'text-orange-500 bg-orange-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article':
        return 'Article Generation';
      case 'image':
        return 'Image Generation';
      case 'background-removal':
        return 'Background Removal';
      case 'resume-analysis':
        return 'Resume Analysis';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">History</h1>
          <p className="text-muted-foreground">
            View your past AI generations and analyses.
          </p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <Loading size="lg" text="Loading your history..." />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">History</h1>
          <p className="text-muted-foreground">
            View your past AI generations and analyses.
          </p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Failed to load history</h3>
              <p className="text-muted-foreground">
                There was an error loading your history. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items: HistoryItem[] = historyItems || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">History</h1>
        <p className="text-muted-foreground">
          View your past AI generations and analyses.
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No history yet</h3>
              <p className="text-muted-foreground">
                Start using our AI tools to see your activity here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            const typeColor = getTypeColor(item.type);
            
            return (
              <Card key={item.id} className="hover:shadow-smooth transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`h-10 w-10 rounded-lg ${typeColor} flex items-center justify-center`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          {getStatusBadge(item.status)}
                        </div>
                        <CardDescription className="mb-2">
                          {getTypeLabel(item.type)}
                          {item.description && ` • ${item.description}`}
                        </CardDescription>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      {item.status === 'completed' && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {item.metadata && (
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {/* Display relevant metadata based on type */}
                      {item.type === 'article' && item.metadata.length && (
                        <span>Length: ~{item.metadata.length} words</span>
                      )}
                      {item.type === 'image' && item.metadata.size && (
                        <span>Size: {item.metadata.size}</span>
                      )}
                      {item.type === 'resume-analysis' && item.metadata.score && (
                        <span>Score: {item.metadata.score}/100</span>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}