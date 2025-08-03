import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { FileUser, Upload, Download, CheckCircle, AlertCircle, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';

interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  recommendations: string[];
}

export default function ResumeAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useMutation({
    mutationFn: apiService.analyzeResume,
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success('Resume analyzed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to analyze resume');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null); // Clear previous result
    }
  };

  const handleAnalyzeResume = () => {
    if (!selectedFile) {
      toast.error('Please select a resume file first');
      return;
    }

    analyzeMutation.mutate(selectedFile);
  };

  const downloadReport = () => {
    if (!analysisResult) return;

    const report = `Resume Analysis Report
========================

Overall Score: ${analysisResult.score}/100

Strengths:
${analysisResult.strengths.map(s => `• ${s}`).join('\n')}

Areas for Improvement:
${analysisResult.improvements.map(i => `• ${i}`).join('\n')}

Key Skills Found:
${analysisResult.keywords.join(', ')}

Recommendations:
${analysisResult.recommendations.map(r => `• ${r}`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-analysis-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const clearFile = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10';
    if (score >= 60) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Resume Analyzer</h1>
        <p className="text-muted-foreground">
          Get AI-powered insights and recommendations to improve your resume.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Upload your resume in PDF format for analysis (Max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="gap-2"
                disabled={analyzeMutation.isPending}
              >
                <Upload className="h-4 w-4" />
                Select PDF
              </Button>
              
              {selectedFile && (
                <>
                  <Button
                    onClick={handleAnalyzeResume}
                    disabled={analyzeMutation.isPending}
                    className="gap-2"
                  >
                    {analyzeMutation.isPending ? (
                      <Loading size="sm" text="Analyzing..." />
                    ) : (
                      <>
                        <FileUser className="h-4 w-4" />
                        Analyze Resume
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={clearFile}
                    variant="outline"
                    size="icon"
                    disabled={analyzeMutation.isPending}
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

      {/* Analysis Results */}
      {analyzeMutation.isPending && (
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <Loading size="lg" text="Analyzing your resume..." />
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-6">
          {/* Score Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI-powered resume evaluation</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadReport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full ${getScoreBg(analysisResult?.score || 0)} flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${getScoreColor(analysisResult?.score || 0)}`}>
                    {analysisResult?.score || 0}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Overall Score</h3>
                  <p className="text-muted-foreground">
                    {analysisResult?.score && analysisResult.score >= 80 ? 'Excellent resume!' : 
                     analysisResult?.score && analysisResult.score >= 60 ? 'Good resume with room for improvement' : 
                     'Resume needs significant improvements'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult?.strengths?.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysisResult?.improvements?.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Key Skills & Keywords Found</CardTitle>
              <CardDescription>
                Important skills and keywords detected in your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysisResult?.keywords?.map((keyword, index) => (
                  <Badge key={index} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Actionable suggestions to improve your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysisResult?.recommendations?.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}