import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { businesses, categories } from "@/data/businesses";

export function generateStaticParams() {
  return businesses.map((business) => ({
    id: business.id,
  }));
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = businesses.find((b) => b.id === id);

  if (!business) {
    notFound();
  }

  const category = categories.find((c) => c.id === business.category);
  const relatedBusinesses = businesses
    .filter(
      (b) => b.category === business.category && b.id !== business.id
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96">
        <Image
          src={business.image}
          alt={business.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
          <div className="container mx-auto px-4 py-8">
            <Link
              href="/directory"
              className="text-white hover:text-jamaica-gold mb-4 inline-block"
            >
              ← Back to Directory
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {business.name}
            </h1>
            <p className="text-xl text-gray-200 mt-2">
              {category?.icon} {category?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {business.description}
              </p>

              {business.featured && (
                <div className="bg-jamaica-gold bg-opacity-10 border-l-4 border-jamaica-gold p-4 mb-6">
                  <p className="font-semibold text-jamaica-black">
                    ⭐ Featured Business
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    This business is a verified and featured member of our directory.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Address</div>
                  <div className="flex items-start">
                    <span className="mr-2">📍</span>
                    <span>{business.address}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="flex items-center">
                    <span className="mr-2">📞</span>
                    <a
                      href={`tel:${business.phone}`}
                      className="text-jamaica-green hover:text-jamaica-gold"
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="flex items-center">
                    <span className="mr-2">✉️</span>
                    <a
                      href={`mailto:${business.email}`}
                      className="text-jamaica-green hover:text-jamaica-gold break-all"
                    >
                      {business.email}
                    </a>
                  </div>
                </div>
                {business.website && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Website</div>
                    <div className="flex items-center">
                      <span className="mr-2">🌐</span>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jamaica-green hover:text-jamaica-gold break-all"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category Info */}
            <div className="bg-jamaica-green text-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">Category</h3>
              <div className="text-3xl mb-2">{category?.icon}</div>
              <p className="font-semibold mb-1">{category?.name}</p>
              <p className="text-sm text-gray-200">{category?.description}</p>
              <Link
                href={`/directory?category=${business.category}`}
                className="inline-block mt-4 text-jamaica-gold hover:text-yellow-400 font-semibold text-sm"
              >
                View all in this category →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Businesses */}
        {relatedBusinesses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Related Businesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBusinesses.map((relBusiness) => (
                <div
                  key={relBusiness.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-40">
                    <Image
                      src={relBusiness.image}
                      alt={relBusiness.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{relBusiness.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {relBusiness.description}
                    </p>
                    <Link
                      href={`/directory/${relBusiness.id}`}
                      className="text-jamaica-green hover:text-jamaica-gold font-semibold text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
