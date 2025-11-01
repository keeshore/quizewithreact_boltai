import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateClass from './pages/CreateClass';
import JoinClass from './pages/JoinClass';
import ClassManage from './pages/ClassManage';
import Quiz from './pages/Quiz';
import ClassResults from './pages/ClassResults';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-class" element={
            <ProtectedRoute>
              <CreateClass />
            </ProtectedRoute>
          } />
          <Route path="/join-class" element={
            <ProtectedRoute>
              <JoinClass />
            </ProtectedRoute>
          } />
          <Route path="/join/:classCode" element={
            <ProtectedRoute>
              <JoinClass />
            </ProtectedRoute>
          } />
          <Route path="/class/:classCode/manage" element={
            <ProtectedRoute>
              <ClassManage />
            </ProtectedRoute>
          } />
          <Route path="/class/:classCode/results" element={
            <ProtectedRoute>
              <ClassResults />
            </ProtectedRoute>
          } />
          <Route path="/quiz/:token" element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;