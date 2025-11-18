import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { newsArticles } from "@/data/news";

export function generateStaticParams() {
  return newsArticles.map((article) => ({
    id: article.id,
  }));
}

export default function NewsArticlePage({
  params,
}: {
  params: { id: string };
}) {
  const article = newsArticles.find((a) => a.id === params.id);

  if (!article) {
    notFound();
  }

  const relatedArticles = newsArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/news"
            className="text-jamaica-green hover:text-jamaica-gold mb-4 inline-block"
          >
            ← Back to News
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-jamaica-green text-white px-4 py-1 rounded-full text-sm font-semibold">
              {article.category}
            </span>
            <span className="text-gray-500">{article.date}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {article.title}
          </h1>
          <p className="text-xl text-gray-600 mb-4">{article.excerpt}</p>
          <div className="flex items-center text-gray-600">
            <span>By {article.author}</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative h-96 md:h-[500px]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
            <div className="prose prose-lg max-w-none">
              {article.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share Section */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Share this article</h3>
              <div className="flex gap-4">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Facebook
                </button>
                <button className="bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                  Twitter
                </button>
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relArticle) => (
                  <div
                    key={relArticle.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-40">
                      <Image
                        src={relArticle.image}
                        alt={relArticle.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-jamaica-green font-semibold mb-2">
                        {relArticle.category}
                      </div>
                      <h3 className="font-bold mb-2 line-clamp-2">
                        {relArticle.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {relArticle.excerpt}
                      </p>
                      <Link
                        href={`/news/${relArticle.id}`}
                        className="text-jamaica-green hover:text-jamaica-gold font-semibold text-sm"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
