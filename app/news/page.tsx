"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { newsArticles } from "@/data/news";

const newsCategories = [
  "All",
  "Tourism",
  "Business",
  "Technology",
  "Culture",
  "Sports",
  "Environment",
];

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredNews = useMemo(() => {
    return newsArticles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-jamaica-green to-jamaica-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Jamaica News Hub
          </h1>
          <p className="text-xl text-gray-200">
            Stay updated with the latest news and stories from Jamaica
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search Box */}
            <div>
              <label htmlFor="search" className="block text-sm font-semibold mb-2">
                Search News
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaica-green focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                {newsCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                      selectedCategory === cat
                        ? "bg-jamaica-green text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredNews.length} of {newsArticles.length} articles
          </div>
        </div>

        {/* News Articles */}
        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">
              No articles found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 text-jamaica-green hover:text-jamaica-gold font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNews.map((article, index) => (
              <div
                key={article.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${
                  index === 0 && selectedCategory === "All" && !searchQuery
                    ? "md:flex"
                    : ""
                }`}
              >
                <div
                  className={`relative ${
                    index === 0 && selectedCategory === "All" && !searchQuery
                      ? "md:w-1/2 h-64 md:h-auto"
                      : "h-48"
                  }`}
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  {article.featured && (
                    <div className="absolute top-4 right-4 bg-jamaica-gold text-jamaica-black px-3 py-1 rounded-full text-sm font-bold">
                      Featured
                    </div>
                  )}
                </div>
                <div
                  className={`p-6 ${
                    index === 0 && selectedCategory === "All" && !searchQuery
                      ? "md:w-1/2"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-jamaica-green font-semibold">
                      {article.category}
                    </span>
                    <span className="text-sm text-gray-500">{article.date}</span>
                  </div>
                  <h2
                    className={`font-bold mb-3 hover:text-jamaica-green ${
                      index === 0 && selectedCategory === "All" && !searchQuery
                        ? "text-3xl"
                        : "text-xl"
                    }`}
                  >
                    <Link href={`/news/${article.id}`}>{article.title}</Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      By {article.author}
                    </span>
                    <Link
                      href={`/news/${article.id}`}
                      className="text-jamaica-green hover:text-jamaica-gold font-semibold"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
