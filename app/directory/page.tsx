"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { businesses, categories } from "@/data/businesses";

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const matchesSearch =
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || business.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-jamaica-green text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Business Directory
          </h1>
          <p className="text-xl text-gray-200">
            Discover and connect with businesses across Jamaica
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Box */}
            <div>
              <label htmlFor="search" className="block text-sm font-semibold mb-2">
                Search Businesses
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaica-green focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold mb-2">
                Filter by Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jamaica-green focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredBusinesses.length} of {businesses.length} businesses
          </div>
        </div>

        {/* Business Listings */}
        {filteredBusinesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">
              No businesses found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-4 text-jamaica-green hover:text-jamaica-gold font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={business.image}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                  {business.featured && (
                    <div className="absolute top-4 right-4 bg-jamaica-gold text-jamaica-black px-3 py-1 rounded-full text-sm font-bold">
                      Featured
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="text-sm text-jamaica-green font-semibold mb-2">
                    {categories.find((c) => c.id === business.category)?.name}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{business.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {business.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-start">
                      <span className="mr-2">📍</span>
                      <span>{business.address}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📞</span>
                      <a
                        href={`tel:${business.phone}`}
                        className="hover:text-jamaica-green"
                      >
                        {business.phone}
                      </a>
                    </div>
                    {business.website && (
                      <div className="flex items-center">
                        <span className="mr-2">🌐</span>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-jamaica-green truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/directory/${business.id}`}
                    className="inline-block w-full text-center bg-jamaica-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
