import CategoryCardGrid from '../components/categories/CategoryCardGrid';

export default function CategoriesIndexPage() {
  return (
    <div className="container px-4 py-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Service Categories</h1>
          <p className="text-lg text-muted-foreground">
            Browse all available service categories and find the right worker for your needs
          </p>
        </div>
        <CategoryCardGrid />
      </div>
    </div>
  );
}
