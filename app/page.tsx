import Link from "next/link";
import Image from "next/image";
import { businesses, categories } from "@/data/businesses";
import { newsArticles } from "@/data/news";

export default function Home() {
  const featuredBusinesses = businesses.filter(b => b.featured).slice(0, 3);
  const featuredNews = newsArticles.filter(n => n.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-jamaica-green via-jamaica-black to-jamaica-gold text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to Jamaica Connect
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Your Gateway to Jamaica - Discover Businesses, Stay Updated with News, and Connect with the Island's Vibrant Culture
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/directory"
                className="bg-jamaica-gold text-jamaica-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors"
              >
                Explore Directory
              </Link>
              <Link
                href="/news"
                className="bg-white text-jamaica-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Read Latest News
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/directory?category=${category.id}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow text-center group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-jamaica-green transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Featured Businesses</h2>
            <Link
              href="/directory"
              className="text-jamaica-green hover:text-jamaica-gold font-semibold"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredBusinesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={business.image}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-jamaica-green font-semibold mb-2">
                    {categories.find(c => c.id === business.category)?.name}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{business.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {business.description}
                  </p>
                  <Link
                    href={`/directory/${business.id}`}
                    className="text-jamaica-green hover:text-jamaica-gold font-semibold"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold">Latest News</h2>
            <Link
              href="/news"
              className="text-jamaica-green hover:text-jamaica-gold font-semibold"
            >
              All News →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredNews.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-jamaica-green font-semibold">
                      {article.category}
                    </span>
                    <span className="text-sm text-gray-500">{article.date}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <Link
                    href={`/news/${article.id}`}
                    className="text-jamaica-green hover:text-jamaica-gold font-semibold"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Jamaica Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">About Jamaica</h2>
            <p className="text-lg text-gray-700 mb-8">
              Jamaica is a Caribbean island nation known for its stunning beaches,
              vibrant culture, and warm hospitality. From the birthplace of reggae
              music to world-famous Blue Mountain Coffee, Jamaica offers a unique
              blend of natural beauty, rich history, and entrepreneurial spirit.
            </p>
            <Link
              href="/about"
              className="inline-block bg-jamaica-green text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
            >
              Discover More About Jamaica
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-jamaica-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              List Your Business
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Are you a Jamaican business owner? Get your business featured in our
              directory and connect with customers worldwide.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-jamaica-gold text-jamaica-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors"
            >
              Get Listed Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
