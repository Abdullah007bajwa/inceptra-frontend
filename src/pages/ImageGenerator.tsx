import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { Image, Download, Sparkles } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1024x1024');
  const [generatedImage, setGeneratedImage] = useState('');

  const generateMutation = useMutation({
    mutationFn: apiService.generateImage,
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl || data.image || '');
      toast.success('Image generated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate image');
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    generateMutation.mutate({
      prompt: prompt.trim(),
      style,
      size,
    });
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Image Generator</h1>
        <p className="text-muted-foreground">
          Create stunning visuals from text descriptions using advanced AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Image Details
            </CardTitle>
            <CardDescription>
              Describe the image you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Image Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate in detail..."
                  disabled={generateMutation.isPending}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={style} onValueChange={setStyle} disabled={generateMutation.isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Image Size</Label>
                <Select value={size} onValueChange={setSize} disabled={generateMutation.isPending}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512x512">Square (512x512)</SelectItem>
                    <SelectItem value="1024x1024">Large Square (1024x1024)</SelectItem>
                    <SelectItem value="1024x768">Landscape (1024x768)</SelectItem>
                    <SelectItem value="768x1024">Portrait (768x1024)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={generateMutation.isPending || !prompt.trim()}
              >
                {generateMutation.isPending ? (
                  <Loading size="sm" text="Generating..." />
                ) : (
                  'Generate Image'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Image */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Image</CardTitle>
                <CardDescription>
                  Your AI-generated image will appear here
                </CardDescription>
              </div>
              {generatedImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadImage}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generateMutation.isPending ? (
              <div className="flex items-center justify-center py-24">
                <Loading size="lg" text="Creating your image..." />
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full rounded-lg shadow-smooth"
                />
                <div className="text-sm text-muted-foreground">
                  <strong>Prompt:</strong> {prompt}
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate an image to see the results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}