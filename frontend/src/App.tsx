import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TeacherQuizPage from "./pages/TeacherQuizPage";
import StudentLoginPage from "./pages/StudentLoginPage";
import NotFound from "./pages/NotFound";

import TeacherDiscussionPage from "./pages/TeacherDiscussionPage";
import StudentDiscussionPage from "./pages/StudentDiscussionPage";
import AccessibilityGuidePage from "./pages/AccessibilityGuidePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teacher/quiz" element={<TeacherQuizPage />} />
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/teacher/discussion" element={<TeacherDiscussionPage />} />
          <Route path="/student/discussion" element={<StudentDiscussionPage />} />
          <Route path="/accessibility-guide" element={<AccessibilityGuidePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
