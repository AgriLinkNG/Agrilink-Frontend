import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WaitlistLanding from "./pages/WaitlistLanding";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ForgotPasswordStep2 from "./pages/auth/ForgotPasswordStep2";
import ForgotPasswordStep3 from "./pages/auth/ForgotPasswordStep3";
import PasswordResetSuccess from "./pages/auth/PasswordResetSuccess";
import SignupDisabled from "./pages/auth/SignupDisabled";
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import BuyersMarketplace from "./pages/marketplace/BuyersMarketplace";
import { AuthProvider, ProtectedRoute } from "./components/auth/AuthProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WaitlistLanding />} />
          <Route path="/home" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password-step2" element={<ForgotPasswordStep2 />} />
          <Route path="/forgot-password-step3" element={<ForgotPasswordStep3 />} />
          <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
          <Route path="/signup" element={<SignupDisabled />} />
          <Route path="/farmers-signup" element={<SignupDisabled />} />
          <Route path="/signup-step2" element={<SignupDisabled />} />
          <Route path="/farmers-signup-step2" element={<SignupDisabled />} />
          <Route path="/signup-step3" element={<SignupDisabled />} />
          <Route path="/farmers-signup-step3" element={<SignupDisabled />} />
          <Route path="/buyer-signup" element={<SignupDisabled />} />
          <Route path="/buyer-signup-step2" element={<SignupDisabled />} />
          <Route path="/buyer-signup-step3" element={<SignupDisabled />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
