import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Unauthorized } from './pages/Unauthorized';
import { OrganizationManagement } from './pages/OrganizationManagement';
import { UserManagement } from './pages/UserManagement';
import { AddOnMasterPage } from './pages/AddOnMaster';
import { ChildrenManagement } from './pages/ChildrenManagement';
import { DailyReports } from './pages/DailyReports';
import './styles/design-system.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organizations" 
            element={
              <ProtectedRoute requiredRole="HQ">
                <OrganizationManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRole="HQ">
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/addon-master" 
            element={
              <ProtectedRoute requiredRole="HQ">
                <AddOnMasterPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/children" 
            element={
              <ProtectedRoute>
                <ChildrenManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/daily-reports" 
            element={
              <ProtectedRoute>
                <DailyReports />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
