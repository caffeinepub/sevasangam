import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';
import HomeSearchPanel from '../components/search/HomeSearchPanel';
import CategoryCardGrid from '../components/categories/CategoryCardGrid';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  SevaSangam – a meeting point where people and trusted local service workers come together
                </h1>
                <p className="text-lg text-muted-foreground">
                  Find reliable local service workers quickly and stress-free. Connect with skilled professionals in your area for all your household needs.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/search' })}>
                  Find a Worker
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/join' })}>
                  Join as a Worker
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <img
                src="/assets/generated/sevasangam-hero-illustration.dim_1600x800.png"
                alt="Local service workers helping community"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Find the Right Worker</h2>
            <p className="text-muted-foreground">Search by service, location, and availability</p>
          </div>
          <HomeSearchPanel />
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Browse by Service Category</h2>
            <p className="text-muted-foreground">Choose from our wide range of trusted local services</p>
          </div>
          <CategoryCardGrid />
        </div>
      </section>
    </div>
  );
}
