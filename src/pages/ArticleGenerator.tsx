import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { FileText, Copy, Download } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

export default function ArticleGenerator() {
  const [title, setTitle] = useState('');
  const [length, setLength] = useState('medium');
  const [generatedArticle, setGeneratedArticle] = useState('');

  const generateMutation = useMutation({
    mutationFn: apiService.generateArticle,
    onSuccess: (data) => {
      setGeneratedArticle(data.content || data.article || '');
      toast.success('Article generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate article');
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const lengthMap = {
      short: 300,
      medium: 600,
      long: 1000,
    };

    generateMutation.mutate({
      title: title.trim(),
      length: lengthMap[length as keyof typeof lengthMap],
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedArticle);
    toast.success('Article copied to clipboard!');
  };

  const downloadArticle = () => {
    const blob = new Blob([generatedArticle], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Article downloaded!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Article Generator</h1>
        <p className="text-muted-foreground">
          Create compelling articles with AI. Just provide a title and desired length.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Article Details
            </CardTitle>
            <CardDescription>
              Enter the details for your article generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your article title..."
                  disabled={generateMutation.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Article Length</Label>
                <Select value={length} onValueChange={setLength} disabled={generateMutation.isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (~300 words)</SelectItem>
                    <SelectItem value="medium">Medium (~600 words)</SelectItem>
                    <SelectItem value="long">Long (~1000 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={generateMutation.isPending || !title.trim()}
              >
                {generateMutation.isPending ? (
                  <Loading size="sm" text="Generating..." />
                ) : (
                  'Generate Article'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Article */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Article</CardTitle>
                <CardDescription>
                  Your AI-generated article will appear here
                </CardDescription>
              </div>
              {generatedArticle && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadArticle}
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
            {generateMutation.isPending ? (
              <div className="flex items-center justify-center py-12">
                <Loading size="lg" text="Generating your article..." />
              </div>
            ) : generatedArticle ? (
              <Textarea
                value={generatedArticle}
                readOnly
                className="min-h-[400px] font-mono text-sm"
                placeholder="Generated article will appear here..."
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate an article to see the results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}