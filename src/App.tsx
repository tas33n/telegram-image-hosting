import React from "react";
import { Routes, Route, useLocation } from "react-router-dom"; 
import { Navigation } from "./components/Navigation";
import { PublicUpload } from "./components/PublicUpload";
import { LoginForm } from "./components/LoginForm";
import { Dashboard } from "./components/Dashboard";
import { ApiDocs } from "./components/ApiDocs";
import { About } from "./components/About";
import { Footer } from "./components/Footer";
import { FilePreviewPage } from "./pages/FilePreviewPage";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, loading, login, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <Navigation user={user} onLogout={logout} />
      <main className="flex-1 transition-colors duration-200">
        <Routes>
          <Route path="/" element={<PublicUpload />} />
          <Route path="/admin" element={user ? <Dashboard user={user} onLogout={logout} /> : <LoginForm onLogin={login} />} />
          <Route path="/docs" element={<ApiDocs />} />
          <Route path="/about" element={<About />} />
          <Route path="/file/:encodedId" element={<FilePreviewPage key={location.pathname} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;