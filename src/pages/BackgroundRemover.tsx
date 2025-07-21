import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Scissors, Upload, Download, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

export default function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeBgMutation = useMutation({
    mutationFn: apiService.removeBackground,
    onSuccess: (data) => {
      setProcessedImage(data.imageUrl || data.processedImage || '');
      toast.success('Background removed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove background');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    removeBgMutation.mutate(selectedFile);
  };

  const downloadProcessedImage = () => {
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `background-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  };

  const clearImages = () => {
    setOriginalImage('');
    setProcessedImage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Background Remover</h1>
        <p className="text-muted-foreground">
          Remove backgrounds from images instantly using AI technology.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Image
          </CardTitle>
          <CardDescription>
            Select an image to remove its background (PNG, JPG, JPEG supported)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
                disabled={removeBgMutation.isPending}
              >
                <Upload className="h-4 w-4" />
                Select Image
              </Button>
              
              {selectedFile && (
                <>
                  <Button
                    onClick={handleProcessImage}
                    disabled={removeBgMutation.isPending}
                    className="gap-2"
                  >
                    {removeBgMutation.isPending ? (
                      <Loading size="sm" text="Processing..." />
                    ) : (
                      <>
                        <Scissors className="h-4 w-4" />
                        Remove Background
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={clearImages}
                    variant="outline"
                    size="icon"
                    disabled={removeBgMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Processing Results */}
      {(originalImage || processedImage) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Image */}
          <Card>
            <CardHeader>
              <CardTitle>Original Image</CardTitle>
              <CardDescription>Your uploaded image</CardDescription>
            </CardHeader>
            <CardContent>
              {originalImage && (
                <img
                  src={originalImage}
                  alt="Original image"
                  className="w-full rounded-lg shadow-smooth"
                />
              )}
            </CardContent>
          </Card>

          {/* Processed Image */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Processed Image</CardTitle>
                  <CardDescription>Background removed</CardDescription>
                </div>
                {processedImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadProcessedImage}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {removeBgMutation.isPending ? (
                <div className="flex items-center justify-center py-24">
                  <Loading size="lg" text="Removing background..." />
                </div>
              ) : processedImage ? (
                <div 
                  className="w-full rounded-lg shadow-smooth"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3csvg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"%3e%3cdefs%3e%3cpattern id="a" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="scale(0.5) rotate(0)"%3e%3crect x="0" y="0" width="100%" height="100%" fill="hsla(0,0%,100%,1)"%3e%3c/rect%3e%3crect x="0" y="0" width="10" height="10" fill="hsla(0,0%,95%,1)"%3e%3c/rect%3e%3crect x="10" y="10" width="10" height="10" fill="hsla(0,0%,95%,1)"%3e%3c/rect%3e%3c/pattern%3e%3c/defs%3e%3crect width="100%" height="100%" fill="url(%23a)"%3e%3c/rect%3e%3c/svg%3e")',
                  }}
                >
                  <img
                    src={processedImage}
                    alt="Processed image"
                    className="w-full rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center py-24 text-muted-foreground">
                  <Scissors className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Process an image to see the results here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}