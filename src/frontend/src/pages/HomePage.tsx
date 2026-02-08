import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import HomeSearchPanel from '../components/search/HomeSearchPanel';
import CategoryCardGrid from '../components/categories/CategoryCardGrid';
import { useI18n } from '../hooks/useI18n';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  {t('home.heroTitle')}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {t('home.heroSubtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/search' })} className="text-base">
                  {t('home.findWorkerCta')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/join' })} className="text-base">
                  {t('home.joinWorkerCta')}
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="hero-image-glow relative">
                <img
                  src="/assets/generated/sevasangam-hero-illustration.dim_1600x800.png"
                  alt={t('home.heroImageAlt')}
                  className="w-full h-auto rounded-2xl relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('home.searchTitle')}</h2>
            <p className="text-lg text-muted-foreground">{t('home.searchSubtitle')}</p>
          </div>
          <HomeSearchPanel />
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4">
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('home.categoriesTitle')}</h2>
            <p className="text-lg text-muted-foreground">{t('home.categoriesSubtitle')}</p>
          </div>
          <CategoryCardGrid />
        </div>
      </section>
    </div>
  );
}
