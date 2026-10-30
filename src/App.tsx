import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatProvider } from './context/ChatContext';
import { recordVisitorSession } from './lib/visitorTracking';

import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';
import { SavedPage } from './pages/SavedPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { LoginPage, SignupPage, ForgotPasswordPage, VerifyEmailPage } from './pages/AuthPages';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProfilePage, BillingPage, PrivacyPage, TermsPage, SupportPage } from './pages/AuxiliaryPages';
import { QuranPage } from './pages/QuranPage';
import { MacallinPage } from './pages/MacallinPage';
import { TrackRequestPage } from './pages/TrackRequestPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { QuizPage } from './pages/QuizPage';
import { DashboardPage } from './pages/DashboardPage';
import { CertificateVerificationPage } from './pages/CertificateVerificationPage';
import { KhitmaPage } from './pages/KhitmaPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { OfflineNetworkIndicator } from './components/common/OfflineNetworkIndicator';

export function App() {
  useEffect(() => {
    recordVisitorSession();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <ChatProvider>
            <BrowserRouter>
              <Routes>
              {/* Public Landing & Marketing */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Modern Personalized Islamic Learning Dashboard (Protected) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Subcis Alternating Quran Recitation (Redirected seamlessly to Quran Center) */}
              <Route path="/macallin" element={<Navigate to="/quran?tab=subcis" replace />} />
              <Route path="/hifd" element={<Navigate to="/quran?tab=subcis" replace />} />
              <Route path="/subcis" element={<Navigate to="/quran?tab=subcis" replace />} />

              {/* Core Chat Workspace (Protected) */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:conversationId"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Plans & Pricing (Publicly viewable) */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/track" element={<TrackRequestPage />} />
              <Route path="/track-request" element={<TrackRequestPage />} />
              <Route path="/verify-certificate" element={<CertificateVerificationPage />} />
              <Route path="/verify" element={<CertificateVerificationPage />} />
              <Route path="/khitma" element={<KhitmaPage />} />
              <Route path="/khitma/tasks" element={<KhitmaPage />} />
              <Route path="/khatma" element={<KhitmaPage />} />
              <Route path="/khatma/tasks" element={<KhitmaPage />} />
              <Route path="/khatm" element={<KhitmaPage />} />
              
              {/* User Workspace & Settings (Protected) */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <SavedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              {/* Dedicated Traditional Printed Mushaf Reader & Complete Quran Center (Protected) */}
              <Route
                path="/quran"
                element={
                  <ProtectedRoute>
                    <QuranPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quran/*"
                element={
                  <ProtectedRoute>
                    <QuranPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/tafsir" element={<Navigate to="/quran?tab=tafsiir" replace />} />
              <Route
                path="/quran/tafsir"
                element={
                  <ProtectedRoute>
                    <QuranPage defaultTab="tafsir" />
                  </ProtectedRoute>
                }
              />
              {/* Public Islamic Quiz & Leaderboard (No login required) */}
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/leaderboard" element={<QuizPage defaultTab="leaderboard" />} />
              
              {/* Private Admin Portal & Login */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
              
              {/* Auth Routes */}
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/register" element={<SignupPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Auxiliary & Legal Pages */}
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <OfflineNetworkIndicator />
          </BrowserRouter>
          </ChatProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
