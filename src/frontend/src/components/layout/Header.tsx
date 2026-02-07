import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuthz } from '../../hooks/useAuthz';
import { useAdminSession } from '../../hooks/useAdminSession';
import LoginButton from '../auth/LoginButton';
import { useQueryClient } from '@tanstack/react-query';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isWorkerAuthenticated, isAdminSessionAuthenticated } = useAuthz();
  const { logout } = useAdminSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleAdminLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleAdminLoginClick = () => {
    navigate({ to: '/admin-login' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/generated/sevasangam-logo.dim_512x192.png"
            alt="SevaSangam - सेवा संगम - সেৱা সংগম"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
            Categories
          </Link>
          <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors">
            Find Workers
          </Link>
          {isWorkerAuthenticated && !isAdminSessionAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              My Dashboard
            </Link>
          )}
          {isAdminSessionAuthenticated && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {!isWorkerAuthenticated && !isAdminSessionAuthenticated && (
            <Button onClick={() => navigate({ to: '/join' })} variant="outline" size="sm">
              Join as Worker
            </Button>
          )}
          {isAdminSessionAuthenticated ? (
            <Button onClick={handleAdminLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Admin Logout
            </Button>
          ) : (
            <>
              <LoginButton />
              <Button onClick={handleAdminLoginClick} variant="outline" size="sm">
                Admin Login
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col gap-4 p-4">
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Workers
            </Link>
            {isWorkerAuthenticated && !isAdminSessionAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Dashboard
              </Link>
            )}
            {isAdminSessionAuthenticated && (
              <Link
                to="/admin"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <div className="pt-2 border-t space-y-2">
              {!isWorkerAuthenticated && !isAdminSessionAuthenticated && (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate({ to: '/join' });
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Join as Worker
                </Button>
              )}
              {isAdminSessionAuthenticated ? (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAdminLogout();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Admin Logout
                </Button>
              ) : (
                <>
                  <LoginButton />
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleAdminLoginClick();
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Admin Login
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
