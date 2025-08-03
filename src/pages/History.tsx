import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import {
  Calendar, Download, Eye, XCircle, FileText, Image as ImageIcon,
  Scissors, FileUser, History as HistoryIcon, Copy, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api, { setAuthToken } from '@/lib/api';

type HistoryItem = {
  id: string;
  feature: 'article' | 'image' | 'background-removal' | 'resume-analysis';
  input?: any;
  output?: any;
  createdAt: string;
};

type PaginationInfo = {
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  limit: number;
};

type HistoryResponse = {
  history: HistoryItem[];
  pagination: PaginationInfo;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'article': return FileText;
    case 'image': return ImageIcon;
    case 'background-removal': return Scissors;
    case 'resume-analysis': return FileUser;
    default: return HistoryIcon;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'article': return 'Article Generation';
    case 'image': return 'Image Generation';
    case 'background-removal': return 'Background Removal';
    case 'resume-analysis': return 'Resume Analysis';
    default: return 'Unknown';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'article': return 'text-blue-500 bg-blue-500/10';
    case 'image': return 'text-purple-500 bg-purple-500/10';
    case 'background-removal': return 'text-green-500 bg-green-500/10';
    case 'resume-analysis': return 'text-orange-500 bg-orange-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
};

export default function History() {
  const { getToken } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['history', currentCursor, currentPage],
    queryFn: async () => {
      const token = await getToken({ template: 'backend' });
      if (!token) throw new Error('Unauthorized');
      setAuthToken(token);
      
      const params = new URLSearchParams({
        limit: '20',
        page: currentPage.toString(),
      });
      
      if (currentCursor) {
        params.append('cursor', currentCursor);
      }
      
      const res = await api.get(`/history?${params.toString()}`);
      return res.data as HistoryResponse;
    },
  });

  const history: HistoryItem[] = data?.history || [];
  const pagination = data?.pagination;

  const handleNextPage = () => {
    if (pagination?.hasNextPage && pagination?.nextCursor) {
      setCurrentCursor(pagination.nextCursor);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pagination?.hasPreviousPage) {
      setCurrentCursor(null);
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loading size="lg" text="Loading your history..." /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">❌ Error loading history</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground">
          View all your previous AI generations
          {pagination && (
            <span className="ml-2 text-sm">
              ({pagination.totalCount} total items)
            </span>
          )}
        </p>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HistoryIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No history found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {history.map((item) => {
            const Icon = getTypeIcon(item.feature);
            const color = getTypeColor(item.feature);
            const isExpanded = expanded === item.id;

            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{getTypeLabel(item.feature)}</CardTitle>
                        <CardDescription className="text-sm">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setExpanded(isExpanded ? null : item.id)}>
                      {isExpanded ? <XCircle className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {isExpanded ? 'Hide' : 'View'}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-6">
                    {/* Input */}
                    {item.input && (
                      <div>
                        <p className="font-semibold mb-1">🔤 Input</p>
                        <pre className="bg-muted p-2 rounded text-sm whitespace-pre-wrap max-h-[300px] overflow-auto">
                          {JSON.stringify(item.input, null, 2)}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(item.input, null, 2));
                            toast.success('Input copied!');
                          }}
                        >
                          <Copy className="w-4 h-4" /> Copy Input
                        </Button>
                      </div>
                    )}

                    {/* Output */}
                    {item.output && (
                      <div>
                        <p className="font-semibold mb-1">📤 Output</p>
                        {item.feature === 'image' || item.feature === 'background-removal' ? (
                          <div className="space-y-2">
                            <img
                              src={`data:image/png;base64,${item.output.image}`}
                              alt="Generated"
                              className="max-w-full h-auto rounded border"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = `data:image/png;base64,${item.output.image}`;
                                link.download = `generated-${Date.now()}.png`;
                                link.click();
                                toast.success('Image downloaded!');
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Image
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="bg-muted p-3 rounded text-sm max-h-[300px] overflow-auto">
                              <ReactMarkdown>{item.output.article || item.output.analysis || JSON.stringify(item.output)}</ReactMarkdown>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const content = item.output.article || item.output.analysis || JSON.stringify(item.output);
                                navigator.clipboard.writeText(content);
                                toast.success('Output copied!');
                              }}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Output
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {pagination && (pagination.hasNextPage || pagination.hasPreviousPage) && (
            <div className="flex justify-between items-center py-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {Math.ceil(pagination.totalCount / pagination.limit)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
