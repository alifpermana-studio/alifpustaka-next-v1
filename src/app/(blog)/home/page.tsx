export default function BlogHomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Our Blog</h1>
      <p className="text-lg mb-4">
        Discover our latest articles, stories, and insights.
      </p>
      <div className="flex gap-4">
        <a
          href="/blog"
          className="btn btn-primary"
        >
          View All Posts
        </a>
        <a
          href="/showcase"
          className="btn btn-secondary"
        >
          Showcase Gallery
        </a>
      </div>
    </div>
  );
}
