import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, LogOut, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuthz } from '../../hooks/useAuthz';
import { useAdminSession } from '../../hooks/useAdminSession';
import LoginButton from '../auth/LoginButton';
import { useQueryClient } from '@tanstack/react-query';
import { useI18n } from '../../hooks/useI18n';
import { Language } from '../../i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isWorkerAuthenticated, isAdminSessionAuthenticated } = useAuthz();
  const { logout } = useAdminSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language, setLanguage } = useI18n();

  const handleAdminLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleAdminLoginClick = () => {
    navigate({ to: '/admin-login' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight">
            SevaSangam
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            {t('header.home')}
          </Link>
          <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
            {t('header.categories')}
          </Link>
          <Link to="/search" className="text-sm font-medium hover:text-primary transition-colors">
            {t('header.findWorkers')}
          </Link>
          {isWorkerAuthenticated && !isAdminSessionAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              {t('header.myDashboard')}
            </Link>
          )}
          {isAdminSessionAuthenticated && (
            <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              {t('header.admin')}
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="w-[140px]" aria-label={t('language.label')}>
              <Globe className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('language.english')}</SelectItem>
              <SelectItem value="hi">{t('language.hindi')}</SelectItem>
              <SelectItem value="as">{t('language.assamese')}</SelectItem>
            </SelectContent>
          </Select>
          {!isWorkerAuthenticated && !isAdminSessionAuthenticated && (
            <Button onClick={() => navigate({ to: '/join' })} variant="outline" size="sm">
              {t('header.joinAsWorker')}
            </Button>
          )}
          {isAdminSessionAuthenticated ? (
            <Button onClick={handleAdminLogout} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              {t('header.adminLogout')}
            </Button>
          ) : (
            <>
              <LoginButton />
              <Button onClick={handleAdminLoginClick} variant="outline" size="sm">
                {t('header.adminLogin')}
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
              {t('header.home')}
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.categories')}
            </Link>
            <Link
              to="/search"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.findWorkers')}
            </Link>
            {isWorkerAuthenticated && !isAdminSessionAuthenticated && (
              <Link
                to="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('header.myDashboard')}
              </Link>
            )}
            {isAdminSessionAuthenticated && (
              <Link
                to="/admin"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('header.admin')}
              </Link>
            )}
            <div className="pt-2 border-t space-y-2">
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="w-full" aria-label={t('language.label')}>
                  <Globe className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('language.english')}</SelectItem>
                  <SelectItem value="hi">{t('language.hindi')}</SelectItem>
                  <SelectItem value="as">{t('language.assamese')}</SelectItem>
                </SelectContent>
              </Select>
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
                  {t('header.joinAsWorker')}
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
                  {t('header.adminLogout')}
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
                    {t('header.adminLogin')}
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
