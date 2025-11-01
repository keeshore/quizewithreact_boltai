import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { LogOut, User, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/')}
                className="text-3xl font-bold hover:text-primary-light transition-colors"
              >
                Quiz Tester
              </button>
              {title && (
                <div className="hidden md:block">
                  <span className="text-primary-light">•</span>
                  <span className="text-lg font-medium ml-2">{title}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-primary-light">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="bg-primary-dark hover:bg-primary-light border-primary-light"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLogout}
                      className="bg-primary-dark hover:bg-primary-light border-primary-light"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="bg-primary-dark hover:bg-primary-light border-primary-light"
                  >
                    Login
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/register')}
                    className="bg-white text-primary hover:bg-gray-100"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile title */}
          {title && (
            <div className="md:hidden mt-2 text-primary-light">
              {title}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-gray-50 border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>&copy; 2025 Quiz Tester. Built for educational purposes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;