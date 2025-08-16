import React, { useState, useEffect, useRef } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import { toast } from '../../utils/notifications.js';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import Particles from '../Particles';
import { config } from '../../config/environment';
import '../Gallery/Gallery.css';
import './ArtBlogs.css';

const ArtBlogs = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchCalled = useRef(false);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchBlogs();
      fetchCalled.current = true;
    }
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const loadingId = toast.dataLoading('Loading blog posts...');
      
      const response = await fetch(`${config.apiBaseUrl}/blogs`);
      const data = await response.json();
      
      toast.dismiss(loadingId);
      
      if (data.success) {
        setBlogs(data.data);
        toast.dataLoaded(`Loaded ${data.data.length} blog posts`);
      } else {
        setError('Failed to load blogs');
        toast.error('Failed to load blogs');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to connect to server');
      toast.serverError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="artblogs-container">
        <VideoLogo />
        <Header currentPage="artblogs" />
        <div className="artblogs-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading blog posts...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="artblogs-container">
        <VideoLogo />
        <Header currentPage="artblogs" />
        <div className="artblogs-content">
          <div className="error-container">
            <h2>Unable to load blog posts</h2>
            <p>{error}</p>
            <button onClick={fetchBlogs} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Extract unique categories from blogs
  const categories = ['all', ...new Set(blogs.map(blog => blog.category))];

  const filteredBlogs = selectedCategory === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category === selectedCategory);

  const featuredPost = blogs.find(blog => blog.featured) || blogs[0];




  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
    toast.info(`Reading: ${blog.title}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
    document.body.style.overflow = 'unset';
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains('artwork-modal-overlay')) {
      closeModal();
    }
  };

  return (
    <div className="artblogs-container">
      {/* Particles Background */}
      <div className="artblogs-particles-background">
        <Particles
          particleColors={['#c38f21', '#ffffff', '#c38f21']}
          particleCount={1000}
          particleSpread={10}
          speed={0.2}
          particleBaseSize={200}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>
      
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
          {featuredPost && (
            <div className="featured-card">
              <div className="featured-image">
                <div className="featured-placeholder">
                  <span className="featured-label">Featured</span>
                </div>
              </div>
              <div className="featured-content">
                <div className="featured-meta">
                  <span className="featured-category">{featuredPost.category}</span>
                  <span className="featured-date">{new Date(featuredPost.createdAt).toLocaleDateString()}</span>
                  <span className="featured-read-time">{featuredPost.readTime}</span>
                </div>
                <h3 className="featured-title">{featuredPost.title}</h3>
                <p className="featured-author">by {featuredPost.author}</p>
                <p className="featured-excerpt">{featuredPost.excerpt}</p>
                <div className="featured-tags">
                  {featuredPost.tags && featuredPost.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <button 
                  className="read-more-btn"
                  onClick={() => openModal(featuredPost)}
                >
                  View Details
                </button>
              </div>
            </div>
          )}
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
                  <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
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
                <button 
                  className="read-article-btn"
                  onClick={() => openModal(blog)}
                >
                  View Details
                </button>
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

        {/* Blog Modal */}
        {isModalOpen && selectedBlog && (
          <div className="artwork-modal-overlay" onClick={handleModalClick}>
            <div className="artwork-modal">
              <button className="modal-close-btn" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c38f21" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="modal-content">
                <div className="modal-image-section">
                  <div className="modal-image-container">
                    <div className="blog-modal-placeholder">
                      <span className="modal-category-badge">{selectedBlog.category}</span>
                    </div>
                  </div>
                </div>

                <div className="modal-info-section">
                  <div className="modal-header">
                    <h2 className="modal-title">{selectedBlog.title}</h2>
                    <div className="modal-meta">
                      <span className="modal-author">by {selectedBlog.author}</span>
                      <span className="modal-date">{new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                      <span className="modal-read-time">{selectedBlog.readTime}</span>
                    </div>
                  </div>

                  <div className="modal-tags">
                    {selectedBlog.tags.map(tag => (
                      <span key={tag} className="modal-tag">{tag}</span>
                    ))}
                  </div>

                  <div className="modal-content-body">
                    <div className="blog-excerpt">
                      <p>{selectedBlog.excerpt}</p>
                    </div>
                    
                    <div className="blog-full-content" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
                  </div>

                  <div className="modal-specifications">
                    <h3>Article Details</h3>
                    <div className="spec-grid">
                      <div className="spec-item">
                        <span className="spec-label">Category:</span>
                        <span className="spec-value">{selectedBlog.category.charAt(0).toUpperCase() + selectedBlog.category.slice(1)}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Reading Time:</span>
                        <span className="spec-value">{selectedBlog.readTime}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Published:</span>
                        <span className="spec-value">{selectedBlog.published ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Featured:</span>
                        <span className="spec-value">{selectedBlog.featured ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-additional-info">
                    <div className="related-topics">
                      <h4>Tags</h4>
                      <div className="topic-list">
                        {selectedBlog.tags.map(tag => (
                          <span key={tag} className="topic-item">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ArtBlogs;
