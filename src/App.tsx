import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import AboutPage from './pages/AboutPage';
import ResearchPage from './pages/ResearchPage';
import AdmissionPage from './pages/AdmissionPage';
import TalentPage from './pages/TalentPage';
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import SchoolOverviewPage from './pages/about/SchoolOverviewPage';
import PartyPage from './pages/PartyPage';
import PartyNewsPage from './pages/party/PartyNewsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/about/*" element={<AboutPage />} />
        <Route path="/about/school" element={<SchoolOverviewPage />} />
        <Route path="/about/overview" element={<AboutPage />} />
        <Route path="/about/organization" element={<AboutPage />} />
        <Route path="/about/history" element={<AboutPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/admission" element={<AdmissionPage />} />
        <Route path="/talent" element={<TalentPage />} />
        
        {/* 党建工作路由 */}
        <Route path="/party/*" element={<PartyPage />} />
        <Route path="/party/news" element={<PartyNewsPage />} />
        <Route path="/party/study" element={<PartyPage />} />
        <Route path="/party/organization" element={<PartyPage />} />
        <Route path="/party/education" element={<PartyPage />} />
        <Route path="/party/discipline" element={<PartyPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;