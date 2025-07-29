import React, { useState } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import Loading from '../Loading';
import VideoLogo from '../VideoLogo';
import './ArtBlogs.css';

const ArtBlogs = () => {
  const { isLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const blogPosts = [
    {
      id: 1,
      title: "The Evolution of Madhubani Art: From Village Walls to Global Galleries",
      author: "Dr. Priya Sharma",
      date: "March 10, 2025",
      category: "traditional",
      readTime: "8 min read",
      excerpt: "Explore how Madhubani art has transformed from a village tradition to an internationally recognized art form, while maintaining its cultural essence and significance.",
      image: "/blogs/madhubani-evolution.jpg",
      tags: ["Madhubani", "Traditional Art", "Cultural Heritage"]
    },
    {
      id: 2,
      title: "Digital Tools in Contemporary Indian Art: A New Renaissance",
      author: "Rahul Kumar",
      date: "March 8, 2025",
      category: "contemporary",
      readTime: "6 min read",
      excerpt: "Discover how modern Indian artists are embracing digital technologies to create stunning contemporary works that blend tradition with innovation.",
      image: "/blogs/digital-art.jpg",
      tags: ["Digital Art", "Contemporary", "Technology"]
    },
    {
      id: 3,
      title: "The Therapeutic Power of Art: Healing Through Creativity",
      author: "Dr. Meera Devi",
      date: "March 5, 2025",
      category: "wellness",
      readTime: "10 min read",
      excerpt: "Understanding how art therapy is being used to promote mental health and well-being, with insights from practicing art therapists and case studies.",
      image: "/blogs/art-therapy.jpg",
      tags: ["Art Therapy", "Wellness", "Mental Health"]
    },
    {
      id: 4,
      title: "Preserving Ancient Techniques: The Master Craftsmen of Rajasthan",
      author: "Arjun Singh",
      date: "March 3, 2025",
      category: "traditional",
      readTime: "12 min read",
      excerpt: "Meet the master craftsmen who are keeping alive the ancient art techniques of Rajasthan, from miniature paintings to intricate metalwork.",
      image: "/blogs/rajasthan-crafts.jpg",
      tags: ["Rajasthan", "Craftsmanship", "Heritage"]
    },
    {
      id: 5,
      title: "Color Psychology in Indian Art: The Language of Hues",
      author: "Kavita Patel",
      date: "February 28, 2025",
      category: "technique",
      readTime: "7 min read",
      excerpt: "Delve into the symbolic significance of colors in Indian art traditions and how artists use color psychology to convey emotions and meanings.",
      image: "/blogs/color-psychology.jpg",
      tags: ["Color Theory", "Symbolism", "Art Technique"]
    },
    {
      id: 6,
      title: "Sustainable Art Practices: Eco-Friendly Materials and Methods",
      author: "Environmental Arts Collective",
      date: "February 25, 2025",
      category: "contemporary",
      readTime: "9 min read",
      excerpt: "Learn about sustainable art practices and how contemporary artists are incorporating eco-friendly materials and methods into their creative process.",
      image: "/blogs/sustainable-art.jpg",
      tags: ["Sustainability", "Eco-Friendly", "Green Art"]
    }
  ];

  const categories = ['all', 'traditional', 'contemporary', 'technique', 'wellness'];

  const filteredBlogs = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(blog => blog.category === selectedCategory);

  const featuredPost = blogPosts[0];

  return (
    <div className="artblogs-container">
      {isLoading && <Loading />}
      
      {/* Video Logo */}
      <VideoLogo />
      
      <Header currentPage="artblogs" />
      
      <main className="artblogs-content">
        <section className="artblogs-hero">
          <h1 className="artblogs-title">Art Blogs</h1>
          <p className="artblogs-subtitle">Insights, Stories & Inspiration from the Art World</p>
        </section>

        <section className="featured-post">
          <h2>Featured Article</h2>
          <div className="featured-card">
            <div className="featured-image">
              <div className="featured-placeholder">
                <span className="featured-label">Featured</span>
              </div>
            </div>
            <div className="featured-content">
              <div className="featured-meta">
                <span className="featured-category">{featuredPost.category}</span>
                <span className="featured-date">{featuredPost.date}</span>
                <span className="featured-read-time">{featuredPost.readTime}</span>
              </div>
              <h3 className="featured-title">{featuredPost.title}</h3>
              <p className="featured-author">by {featuredPost.author}</p>
              <p className="featured-excerpt">{featuredPost.excerpt}</p>
              <div className="featured-tags">
                {featuredPost.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <button className="read-more-btn">Read Full Article</button>
            </div>
          </div>
        </section>

        <section className="blog-filter">
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Posts' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </section>

        <section className="blog-grid">
          {filteredBlogs.slice(1).map(blog => (
            <article key={blog.id} className="blog-card">
              <div className="blog-image">
                <div className="blog-placeholder">
                  <span className="blog-category">{blog.category}</span>
                </div>
              </div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-date">{blog.date}</span>
                  <span className="blog-read-time">{blog.readTime}</span>
                </div>
                <h3 className="blog-title">{blog.title}</h3>
                <p className="blog-author">by {blog.author}</p>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <div className="blog-tags">
                  {blog.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <button className="read-article-btn">Read Article</button>
              </div>
            </article>
          ))}
        </section>

        {filteredBlogs.length === 0 && (
          <div className="no-blogs">
            <p>No blog posts found in this category.</p>
          </div>
        )}

        <section className="newsletter-signup">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter and never miss the latest insights from the art world.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" className="email-input" />
              <button className="subscribe-btn">Subscribe</button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArtBlogs;
