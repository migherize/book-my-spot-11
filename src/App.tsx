import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProfessionalPage from "./pages/ProfessionalPage.tsx";
import BookingConfirm from "./pages/BookingConfirm.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import MyBookings from "./pages/MyBookings.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/professional/:id" element={<ProfessionalPage />} />
        <Route path="/booking/confirm" element={<BookingConfirm />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
