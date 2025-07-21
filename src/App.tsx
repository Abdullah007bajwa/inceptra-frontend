import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthWrapper } from "@/components/AuthWrapper";

// Pages
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ArticleGenerator from "./pages/ArticleGenerator";
import ImageGenerator from "./pages/ImageGenerator";
import BackgroundRemover from "./pages/BackgroundRemover";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <AuthWrapper>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="article-generator" element={<ArticleGenerator />} />
              <Route path="image-generator" element={<ImageGenerator />} />
              <Route path="background-remover" element={<BackgroundRemover />} />
              <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="history" element={<History />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthWrapper>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
