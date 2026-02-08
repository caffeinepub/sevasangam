import { Link } from '@tanstack/react-router';
import { CATEGORY_IDS, CATEGORY_NAMES, getCategoryImagePath } from '../../utils/categories';

export default function CategoryCardGrid() {
  const categories = Object.entries(CATEGORY_NAMES).map(([id, name]) => ({
    id,
    name,
    imagePath: getCategoryImagePath(id),
  }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/category/$categoryId"
          params={{ categoryId: category.id }}
          className="group"
        >
          <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-all hover:border-primary">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 relative overflow-hidden rounded-lg">
                <img
                  src={category.imagePath}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
