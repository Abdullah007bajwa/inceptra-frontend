// src/pages/ArticleGenerator.tsx
import DOMPurify from 'dompurify';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { FileText, Copy, Download } from 'lucide-react';
import api, { setAuthToken } from '@/lib/api';
import { toast } from 'sonner';

type ArticleLength = 'short' | 'medium' | 'long';

export default function ArticleGenerator() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [length, setLength] = useState<ArticleLength>('medium');
  const [generatedArticle, setGeneratedArticle] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken();
        if (token) {
          console.log("🔐 Token retrieved successfully");
        }
      } catch (error) {
        console.error("Error fetching token:", error);
        // Don't show error to user as this is just for debugging
      }
    };
    
    fetchToken();
  }, [getToken]);

  useEffect(() => {
    console.log(`👤 Clerk status — isLoaded: ${isLoaded}, isSignedIn: ${isSignedIn}, userId: ${user?.id}`);
  }, [isLoaded, isSignedIn, user]);

  const generateMutation = useMutation({
    mutationFn: async (payload: { title: string; length: ArticleLength }) => {
      const token = await getToken({ template: 'backend' });
      if (!token) throw new Error("No token found");
      setAuthToken(token);

      const { data } = await api.post('/article', payload);
      return data;
    },
    onSuccess: (data) => {
      setFieldErrors({});
      setIsThinking(false);
      const raw = data?.data?.article || '';
      const clean = raw.replace(/<think>[\s\S]*?<\/think>/gi, ''); // 🧠 Strip <think> sections
      setGeneratedArticle(clean);
      toast.success('✅ Article generated successfully!');
    },
    onError: (error: any) => {
      setIsThinking(false);
      const status = error?.response?.status;
      const resData = error?.response?.data;

      console.error('❌ generateArticle error:', status, resData);

      if (status === 401) {
        toast.error('Session expired. Redirecting to sign in…');
        setTimeout(() => {
          navigate('/signin', { state: { from: location } });
        }, 1000);
        return;
      }

      if (status === 400 && resData?.details?.fieldErrors) {
        setFieldErrors(resData.details.fieldErrors);
        toast.error('Please fix the errors and try again.');
        return;
      }

      toast.error(resData?.error || 'Failed to generate article.');
    },
  });

  const handleGenerate = () => {
    setGeneratedArticle('');
    setFieldErrors({});
    setIsThinking(true);

    if (!title.trim()) {
      toast.error('Please enter a title');
      setIsThinking(false);
      return;
    }

    generateMutation.mutate({ title: title.trim(), length });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading size="lg" text="Loading authentication..." />
      </div>
    );
  }

  if (!isSignedIn) {
    navigate('/signin', { state: { from: location } });
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Article Generator</h1>
        <p className="text-muted-foreground">
          Create compelling articles with AI. Just provide a title and desired length.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Article Details
            </CardTitle>
            <CardDescription>Enter the details for your article generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your article title..."
                  disabled={generateMutation.isPending}
                />
                {fieldErrors.title && (
                  <p className="text-sm text-red-500">{fieldErrors.title[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Article Length</Label>
                <Select
                  value={length}
                  onValueChange={(val) => setLength(val as ArticleLength)}
                  disabled={generateMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (~200 words)</SelectItem>
                    <SelectItem value="medium">Medium (~500 words)</SelectItem>
                    <SelectItem value="long">Long (~800 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                onClick={handleGenerate}
                className="w-full"
                disabled={generateMutation.isPending || !title.trim()}
              >
                {generateMutation.isPending ? (
                  <Loading size="sm" text="Generating..." />
                ) : (
                  'Generate Article'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Article</CardTitle>
                <CardDescription>Your AI-generated article will appear here</CardDescription>
              </div>
              {generatedArticle && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedArticle);
                      toast.success('Copied!');
                    }}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([generatedArticle], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast.success('Downloaded!');
                    }}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(generateMutation.isPending || isThinking) ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 text-center">
                <FileText className="h-12 w-12 opacity-50 animate-pulse" />
                <p className="text-lg font-semibold">Inceptra is thinking…</p>
                <p className="text-sm text-muted-foreground">Analyzing, reasoning, and crafting your article...</p>
              </div>
            ) : generatedArticle ? (
              <div className="space-y-4">
                <div
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generatedArticle) }}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Press “Generate Article” to begin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
