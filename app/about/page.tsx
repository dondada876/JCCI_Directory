import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-jamaica-green via-jamaica-black to-jamaica-gold text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Jamaica
          </h1>
          <p className="text-xl text-gray-200">
            Discover the heart and soul of the Caribbean
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6">Welcome to Jamaica</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Jamaica is an island country situated in the Caribbean Sea, comprising
            the third-largest island of the Greater Antilles. With an area of
            10,990 square kilometers, Jamaica is the third-largest island in the
            Caribbean and home to approximately 2.9 million people.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Known for its stunning natural beauty, rich cultural heritage, and
            warm hospitality, Jamaica has captivated visitors for centuries. From
            the birthplace of reggae music to world-renowned Blue Mountain Coffee,
            Jamaica's influence extends far beyond its shores.
          </p>
        </div>

        {/* Key Facts */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-6">Key Facts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-jamaica-green">
                Geography
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Capital:</strong> Kingston</li>
                <li><strong>Major Cities:</strong> Montego Bay, Spanish Town, Portmore</li>
                <li><strong>Climate:</strong> Tropical, hot and humid year-round</li>
                <li><strong>Highest Point:</strong> Blue Mountain Peak (2,256m)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-jamaica-green">
                Culture & People
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Official Language:</strong> English</li>
                <li><strong>Local Language:</strong> Jamaican Patois</li>
                <li><strong>Population:</strong> ~2.9 million</li>
                <li><strong>Currency:</strong> Jamaican Dollar (JMD)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-jamaica-green">
                Economy
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Main Industries:</strong> Tourism, Mining, Agriculture</li>
                <li><strong>Exports:</strong> Bauxite, Sugar, Coffee, Rum</li>
                <li><strong>Tourism:</strong> Over 4 million visitors annually</li>
                <li><strong>GDP:</strong> $16 billion USD</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-3 text-jamaica-green">
                History
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Independence:</strong> August 6, 1962</li>
                <li><strong>Government:</strong> Parliamentary Democracy</li>
                <li><strong>Former Colony:</strong> British Empire</li>
                <li><strong>National Motto:</strong> "Out of Many, One People"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Culture & Heritage */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6">Culture & Heritage</h2>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-jamaica-green">Music</h3>
            <p className="text-gray-700 leading-relaxed">
              Jamaica is the birthplace of reggae music, made famous by legendary
              artist Bob Marley. The island has also given the world ska, rocksteady,
              dub, and dancehall music. Jamaica's musical influence on global culture
              is immeasurable, with reggae being recognized by UNESCO as an
              Intangible Cultural Heritage of Humanity.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-jamaica-green">Cuisine</h3>
            <p className="text-gray-700 leading-relaxed">
              Jamaican cuisine is a flavorful fusion of African, European, Asian,
              and indigenous influences. Famous dishes include jerk chicken, ackee
              and saltfish (the national dish), curried goat, and patties. The
              island is also renowned for Blue Mountain Coffee, considered among
              the finest in the world.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-jamaica-green">Sports</h3>
            <p className="text-gray-700 leading-relaxed">
              Jamaica has a rich sporting tradition, particularly in track and
              field. The island has produced legendary athletes including Usain
              Bolt, the fastest man in history, Shelly-Ann Fraser-Pryce, and Elaine
              Thompson-Herah. Jamaica regularly ranks among the top nations in
              Olympic sprinting events despite its small size.
            </p>
          </div>
        </div>

        {/* Tourism Highlights */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-6">Tourism Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f"
                  alt="Seven Mile Beach"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Seven Mile Beach</h3>
                <p className="text-gray-600 text-sm">
                  One of the Caribbean's most beautiful beaches in Negril, perfect
                  for swimming and watching stunning sunsets.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1447933601403-0c6688de566e"
                  alt="Blue Mountains"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Blue Mountains</h3>
                <p className="text-gray-600 text-sm">
                  Home to the world-famous Blue Mountain Coffee and offering
                  breathtaking views and hiking opportunities.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19"
                  alt="Dunn's River Falls"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Dunn's River Falls</h3>
                <p className="text-gray-600 text-sm">
                  A spectacular 180-foot waterfall near Ocho Rios where visitors
                  can climb the natural limestone steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto bg-jamaica-green text-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Experience Jamaica</h2>
          <p className="text-xl mb-6">
            Ready to connect with Jamaican businesses and stay updated with the
            latest news?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/directory"
              className="bg-jamaica-gold text-jamaica-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
              Browse Directory
            </a>
            <a
              href="/news"
              className="bg-white text-jamaica-green px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Read News
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
