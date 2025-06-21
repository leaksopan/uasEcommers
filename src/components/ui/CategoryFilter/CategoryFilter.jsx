const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const handleCategoryClick = (categorySlug) => {
    if (onCategoryChange) {
      onCategoryChange(categorySlug)
    }
  }

  const handleKeyDown = (event, categorySlug) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCategoryClick(categorySlug)
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategori</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* All Categories Button */}
        <button
          onClick={() => handleCategoryClick('')}
          onKeyDown={(e) => handleKeyDown(e, '')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
            selectedCategory === '' || selectedCategory === null
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          tabIndex="0"
          aria-label="Tampilkan semua kategori"
        >
          Semua Kategori
        </button>

        {/* Category Buttons */}
        {categories && categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            onKeyDown={(e) => handleKeyDown(e, category.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
              selectedCategory === category.slug
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            tabIndex="0"
            aria-label={`Filter produk kategori ${category.name}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryFilter 