import { useState, useEffect, useCallback } from 'react';
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
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');

  // Cleanup function for object URLs
  const cleanupImageUrl = useCallback(() => {
    if (generatedImageUrl && generatedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImageUrl);
    }
    // Data URLs don't need cleanup as they're just strings
  }, [generatedImageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupImageUrl();
    };
  }, [cleanupImageUrl]);

  // Helper function to safely convert base64 to blob
  const base64ToBlob = useCallback((base64String: string): Blob | null => {
    try {
      // Remove data URL prefix if present
      let cleanBase64 = base64String;
      if (base64String.includes(',')) {
        cleanBase64 = base64String.split(',')[1];
      }

      // Validate base64 string
      if (!cleanBase64 || cleanBase64.length === 0) {
        console.error('Empty base64 string');
        return null;
      }

      // Try to fix common base64 issues
      // Remove any whitespace or newlines
      cleanBase64 = cleanBase64.replace(/\s/g, '');
      
      // Ensure proper padding
      while (cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
      }

      // More permissive base64 validation - allow padding characters
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        console.error('Invalid base64 string format after cleaning');
        console.error('Base64 string preview:', cleanBase64.substring(0, 100));
        return null;
      }

      // Decode base64 to binary
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // Create blob with appropriate MIME type
      return new Blob([byteArray], { type: 'image/png' });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      console.error('Base64 string that caused error:', base64String.substring(0, 200));
      
      // Try alternative approach - create blob directly from base64
      try {
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: 'image/png' });
      } catch (fallbackError) {
        console.error('Fallback approach also failed:', fallbackError);
        return null;
      }
    }
  }, []);

  // Helper function to extract image data from various response formats
  const extractImageData = useCallback((data: any): string | null => {
    console.log('🧪 Extracting image data from:', data);
    
    // Try different possible response formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data && typeof data.image === 'string') {
      return data.image;
    }
    
    if (data && data.image && typeof data.image.data === 'string') {
      return data.image.data;
    }
    
    if (data && typeof data.imageUrl === 'string') {
      return data.imageUrl;
    }
    
    if (data && data.data && typeof data.data === 'string') {
      return data.data;
    }
    
    // If data is an object, try to find any string property that might be base64
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && value.length > 100) {
          console.log(`🧪 Found potential image data in property: ${key}`);
          return value;
        }
      }
    }
    
    console.error('🧪 Could not extract image data from response:', data);
    return null;
  }, []);

  const generateMutation = useMutation({
    mutationFn: apiService.generateImage,
    onSuccess: (data) => {
      console.log("🧪 Image response from server:", data);
      console.log("🧪 Response type:", typeof data);
      console.log("🧪 Response keys:", Object.keys(data));
      
      // Clean up previous image URL
      cleanupImageUrl();
      
      // Extract image data using the helper function
      const imageBase64 = extractImageData(data);
            
      if (!imageBase64) {
        console.error('No valid image data found in response:', data);
        toast.error("Invalid image format received from backend");
        return;
      }

      // Log first and last few characters of base64 for debugging
      console.log("🧪 Base64 preview:", {
        start: imageBase64.substring(0, 50),
        end: imageBase64.substring(imageBase64.length - 50),
        length: imageBase64.length
      });

      // Try creating object URL first
      const blob = base64ToBlob(imageBase64);
      if (blob) {
        try {
          const objectUrl = URL.createObjectURL(blob);
          setGeneratedImageUrl(objectUrl);
          toast.success('Image generated successfully!');
          return;
        } catch (error) {
          console.error('Error creating object URL:', error);
        }
      }

      // Fallback: try using data URL directly
      try {
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        setGeneratedImageUrl(dataUrl);
        toast.success('Image generated successfully!');
      } catch (error) {
        console.error('Error creating data URL:', error);
        toast.error("Error displaying image");
      }
    },
    onError: (error: any) => {
      console.error('Image generation error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to generate image');
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

  const downloadImage = useCallback(() => {
    if (!generatedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  }, [generatedImageUrl]);

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
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="artistic">Artistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512x512">512x512</SelectItem>
                    <SelectItem value="1024x1024">1024x1024</SelectItem>
                    <SelectItem value="1024x768">1024x768</SelectItem>
                    <SelectItem value="768x1024">768x1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={generateMutation.isPending || !prompt.trim()}
                className="w-full"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loading className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generated Image
            </CardTitle>
            <CardDescription>
              Your AI-generated image will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generateMutation.isPending ? (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <div className="text-center">
                  <Loading size="lg" text="Generating your image..." />
                </div>
              </div>
            ) : generatedImageUrl ? (
              <div className="space-y-4">
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="w-full h-auto rounded-lg border"
                />
                <Button onClick={downloadImage} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No image generated yet</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}