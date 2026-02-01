import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WaitlistLanding from "./pages/WaitlistLanding";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ForgotPasswordStep2 from "./pages/auth/ForgotPasswordStep2";
import ForgotPasswordStep3 from "./pages/auth/ForgotPasswordStep3";
import PasswordResetSuccess from "./pages/auth/PasswordResetSuccess";
import SignupDisabled from "./pages/auth/SignupDisabled";
import FarmersSignup from "./pages/auth/FarmersSignup";
import FarmersSignupStep2 from "./pages/auth/FarmersSignupStep2";
import FarmersSignupStep3 from "./pages/auth/FarmersSignupStep3";
import BuyerSignup from "./pages/auth/BuyerSignup";
import BuyerSignupStep2 from "./pages/auth/BuyerSignupStep2";
import BuyerSignupStep3 from "./pages/auth/BuyerSignupStep3";
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import BuyersMarketplace from "./pages/marketplace/BuyersMarketplace";
import Survey from "./pages/Survey";
import ThankYou from "./pages/Survey/ThankYou";
import { AuthProvider, ProtectedRoute } from "./components/auth/AuthProvider";

const queryClient = new QueryClient();

// Component to handle subdomain redirect logic
function SubdomainRedirect({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if on survey subdomain
    const isSurveySubdomain = window.location.hostname === 'survey.agrilink.com.ng';
    const isSurveyRoute = location.pathname.startsWith('/survey');

    if (isSurveySubdomain && !isSurveyRoute) {
      navigate('/survey', { replace: true });
    }
  }, [location, navigate]);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <SubdomainRedirect>
          <Routes>
            <Route path="/" element={<WaitlistLanding />} />
            <Route path="/home" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password-step2" element={<ForgotPasswordStep2 />} />
            <Route path="/forgot-password-step3" element={<ForgotPasswordStep3 />} />
            <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
            <Route path="/signup" element={<SignupDisabled />} />
            <Route path="/farmers-signup" element={<FarmersSignup />} />
            <Route path="/signup-step2" element={<FarmersSignupStep2 />} />
            <Route path="/farmers-signup-step2" element={<FarmersSignupStep2 />} />
            <Route path="/signup-step3" element={<FarmersSignupStep3 />} />
            <Route path="/farmers-signup-step3" element={<FarmersSignupStep3 />} />
            <Route path="/buyer-signup" element={<BuyerSignup />} />
            <Route path="/buyer-signup-step2" element={<BuyerSignupStep2 />} />
            <Route path="/buyer-signup-step3" element={<BuyerSignupStep3 />} />
            <Route path="/farmer-dashboard" element={
              <ProtectedRoute>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <BuyersMarketplace />
              </ProtectedRoute>
            } />
            {/* Survey routes */}
            <Route path="/survey" element={<Survey />} />
            <Route path="/survey/thank-you" element={<ThankYou />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SubdomainRedirect>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
