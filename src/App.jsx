import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Problems from './pages/Problems/Problems';
import ProblemDetail from './pages/ProblemDetail/ProblemDetail';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import StudentManagement from './pages/Admin/StudentManagement';
import StudentDetailReport from './pages/Admin/StudentDetailReport';
import AdminSystemHealth from './pages/Admin/AdminSystemHealth';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Student Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/students" element={<AdminRoute><StudentManagement /></AdminRoute>} />
                <Route path="/admin/students/:id" element={<AdminRoute><StudentDetailReport /></AdminRoute>} />
                <Route path="/admin/system" element={<AdminRoute><AdminSystemHealth /></AdminRoute>} />
                <Route path="/status" element={<AdminRoute><AdminSystemHealth /></AdminRoute>} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
