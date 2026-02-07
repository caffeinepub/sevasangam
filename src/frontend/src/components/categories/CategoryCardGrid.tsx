import { Link } from '@tanstack/react-router';
import { CATEGORY_IDS, CATEGORY_NAMES, getCategoryIcon } from '../../utils/categories';

export default function CategoryCardGrid() {
  const categories = Object.entries(CATEGORY_NAMES).map(([id, name]) => ({
    id,
    name,
    iconIndex: getCategoryIcon(id),
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
              <div className="w-16 h-16 relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-contain bg-no-repeat bg-center"
                  style={{
                    backgroundImage: `url(/assets/generated/sevasangam-category-icons-sprite.dim_1536x512.png)`,
                    backgroundPosition: `${(category.iconIndex * -170)}px 0`,
                    backgroundSize: '1530px 170px',
                  }}
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
