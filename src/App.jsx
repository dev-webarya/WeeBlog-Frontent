import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header, Footer } from './components/layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// User Pages
import { HomePage } from './pages/user/HomePage';
import { BlogListPage } from './pages/user/BlogListPage';
import { BlogDetailPage } from './pages/user/BlogDetailPage';
import { SubmitBlogPage } from './pages/user/SubmitBlogPage';
import { SubscribePage } from './pages/user/SubscribePage';
import { SectionPage } from './pages/user/SectionPage';
import { LoginPage } from './pages/user/LoginPage';
import { AccountPage } from './pages/user/AccountPage';
import { PricingPage } from './pages/user/PricingPage';
import { AboutPage, ContactPage, PrivacyPolicyPage, CopyrightPolicyPage, TermsOfUsePage, ReportInfringementPage } from './pages/user/StaticPages';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BlogModerationPage } from './pages/admin/BlogModerationPage';
import { SubscribersPage } from './pages/admin/SubscribersPage';
import { AdminSectionsPage } from './pages/admin/AdminSectionsPage';
import { AdminCommentsPage } from './pages/admin/AdminCommentsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminPricingPage } from './pages/admin/AdminPricingPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#fff',
                            color: '#171717',
                            border: '1px solid #e5e5e5',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '14px',
                        },
                    }}
                />

                <div className="flex flex-col min-h-screen">
                    <Header />

                    <main className="flex-grow">
                        <Routes>
                            {/* User Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/blogs" element={<BlogListPage />} />
                            <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                            <Route path="/submit" element={<SubmitBlogPage />} />
                            <Route path="/subscribe" element={<SubscribePage />} />
                            <Route path="/section/:sectionSlug" element={<SectionPage />} />
                            <Route path="/section/:sectionSlug/:subsectionSlug" element={<SectionPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/account" element={<AccountPage />} />
                            <Route path="/pricing" element={<PricingPage />} />

                            {/* Admin Routes */}
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route path="/admin/dashboard" element={
                                <ProtectedRoute><AdminDashboard /></ProtectedRoute>
                            } />
                            <Route path="/admin/moderation" element={
                                <ProtectedRoute><BlogModerationPage /></ProtectedRoute>
                            } />
                            <Route path="/admin/subscribers" element={
                                <ProtectedRoute><SubscribersPage /></ProtectedRoute>
                            } />
                            <Route path="/admin/sections" element={
                                <ProtectedRoute><AdminSectionsPage /></ProtectedRoute>
                            } />
                            <Route path="/admin/comments" element={
                                <ProtectedRoute><AdminCommentsPage /></ProtectedRoute>
                            } />
                            <Route path="/admin/finance" element={
                                <ProtectedRoute><AdminPaymentsPage /></ProtectedRoute>
                            } />
                            <Route path="/admin/pricing" element={
                                <ProtectedRoute><AdminPricingPage /></ProtectedRoute>
                            } />

                            {/* Static / Legal Pages */}
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/privacy" element={<PrivacyPolicyPage />} />
                            <Route path="/copyright" element={<CopyrightPolicyPage />} />
                            <Route path="/terms" element={<TermsOfUsePage />} />
                            <Route path="/report" element={<ReportInfringementPage />} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
