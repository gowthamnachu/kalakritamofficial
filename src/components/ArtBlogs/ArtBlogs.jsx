import React, { useState } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import Header from '../Header';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import '../Gallery/Gallery.css';
import './ArtBlogs.css';

const ArtBlogs = () => {
  const { navigateWithLoading } = useNavigationWithLoading();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      tags: ["Madhubani", "Traditional Art", "Cultural Heritage"],
      content: `
        <p>Madhubani art, also known as Mithila art, has undergone a remarkable transformation over the centuries. What began as sacred wall paintings in the villages of Bihar has evolved into a globally recognized art form, gracing galleries and private collections worldwide.</p>
        
        <h3>Origins and Cultural Significance</h3>
        <p>The origins of Madhubani art can be traced back to ancient times, when women in the Mithila region would create intricate paintings on the walls and floors of their homes. These weren't merely decorative elements but served important cultural and spiritual purposes, often depicting Hindu deities, nature motifs, and scenes from mythology.</p>
        
        <h3>The Global Journey</h3>
        <p>The transformation of Madhubani from village walls to international galleries began in the 1960s when art enthusiasts and researchers started documenting and promoting this traditional art form. The government's recognition and support further propelled its journey to the global stage.</p>
        
        <h3>Modern Adaptations</h3>
        <p>Contemporary Madhubani artists have skillfully adapted traditional techniques to modern mediums while preserving the essence of the art form. Today, you can find Madhubani paintings on canvas, silk, handmade paper, and even digital platforms.</p>
        
        <h3>Preserving Tradition</h3>
        <p>Despite its global reach, the core philosophy and techniques of Madhubani art remain unchanged. Artists continue to use natural pigments and traditional motifs, ensuring that the cultural heritage is preserved for future generations.</p>
      `,
      relatedTopics: ["Traditional Indian Art", "Cultural Preservation", "Art History"],
      difficulty: "Beginner",
      materials: ["Natural Pigments", "Canvas", "Traditional Brushes"]
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
      tags: ["Digital Art", "Contemporary", "Technology"],
      content: `
        <p>The digital revolution has opened new avenues for Indian artists, allowing them to explore innovative techniques while honoring traditional aesthetics. This fusion of old and new is creating a renaissance in contemporary Indian art.</p>
        
        <h3>Digital Transformation</h3>
        <p>Modern Indian artists are leveraging digital tools like tablets, styluses, and sophisticated software to create art that would have been impossible with traditional mediums alone. These tools offer unprecedented precision and the ability to experiment without waste.</p>
        
        <h3>Preserving Heritage Digitally</h3>
        <p>Digital platforms are also being used to preserve and document traditional art forms. Virtual galleries and augmented reality experiences are making Indian art more accessible to global audiences.</p>
        
        <h3>The Future of Art Education</h3>
        <p>Digital tools are revolutionizing art education, making it possible for students to learn from master artists remotely and access resources that were previously unavailable.</p>
      `,
      relatedTopics: ["Digital Art", "Technology in Art", "Contemporary Techniques"],
      difficulty: "Intermediate",
      materials: ["Digital Tablets", "Art Software", "Stylus"]
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
      tags: ["Art Therapy", "Wellness", "Mental Health"],
      content: `
        <p>Art therapy has emerged as a powerful tool for healing and self-expression. This comprehensive guide explores how creative expression can support mental health and well-being.</p>
        
        <h3>The Science Behind Art Therapy</h3>
        <p>Research shows that engaging in creative activities can reduce stress, improve mood, and enhance cognitive function. The act of creating art stimulates the release of endorphins and promotes mindfulness.</p>
        
        <h3>Therapeutic Techniques</h3>
        <p>Art therapists use various techniques including free drawing, guided imagery, and collaborative art-making to help clients process emotions and experiences.</p>
        
        <h3>Case Studies</h3>
        <p>We explore real-world applications of art therapy in treating anxiety, depression, PTSD, and other mental health conditions.</p>
      `,
      relatedTopics: ["Mental Health", "Art Therapy", "Wellness"],
      difficulty: "Beginner",
      materials: ["Basic Art Supplies", "Sketchbook", "Colored Pencils"]
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
      tags: ["Rajasthan", "Craftsmanship", "Heritage"],
      content: `
        <p>The royal state of Rajasthan has been a cradle of artistic excellence for centuries. Today's master craftsmen continue to preserve and practice ancient techniques that have been passed down through generations.</p>
        
        <h3>Miniature Painting Tradition</h3>
        <p>Rajasthani miniature paintings are renowned for their intricate details and vibrant colors. Master artists still use traditional pigments made from minerals and natural sources.</p>
        
        <h3>Metalwork and Jewelry</h3>
        <p>The state's artisans are famous for their exquisite metalwork, including brass sculptures, silver jewelry, and ornate decorative items that showcase incredible skill and precision.</p>
        
        <h3>Preserving for the Future</h3>
        <p>We examine the challenges these artisans face and the efforts being made to ensure these ancient techniques survive in the modern world.</p>
      `,
      relatedTopics: ["Traditional Crafts", "Rajasthani Art", "Heritage Preservation"],
      difficulty: "Advanced",
      materials: ["Natural Pigments", "Fine Brushes", "Traditional Canvas"]
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
      tags: ["Color Theory", "Symbolism", "Art Technique"],
      content: `
        <p>Colors in Indian art are never mere aesthetic choices. They carry deep symbolic meanings and psychological impact that have been understood and utilized by artists for millennia.</p>
        
        <h3>Sacred Colors and Their Meanings</h3>
        <p>Red symbolizes passion and purity, yellow represents knowledge and learning, while blue embodies the infinite and divine. Understanding these associations is crucial for appreciating Indian art.</p>
        
        <h3>Regional Variations</h3>
        <p>Different regions of India have developed unique color palettes based on local materials, climate, and cultural preferences.</p>
        
        <h3>Modern Applications</h3>
        <p>Contemporary Indian artists continue to use traditional color symbolism while experimenting with new interpretations and combinations.</p>
      `,
      relatedTopics: ["Color Theory", "Indian Art History", "Symbolism"],
      difficulty: "Intermediate",
      materials: ["Color Wheel", "Traditional Pigments", "Reference Books"]
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
      tags: ["Sustainability", "Eco-Friendly", "Green Art"],
      content: `
        <p>As environmental consciousness grows, artists are increasingly adopting sustainable practices that minimize their ecological footprint while creating beautiful, meaningful art.</p>
        
        <h3>Eco-Friendly Materials</h3>
        <p>From recycled canvases to natural pigments made from plants and minerals, sustainable art materials are becoming more accessible and diverse.</p>
        
        <h3>Green Studio Practices</h3>
        <p>Artists are implementing energy-efficient lighting, proper waste disposal, and chemical-free alternatives in their studios.</p>
        
        <h3>Community Impact</h3>
        <p>Sustainable art practices often involve community engagement and education about environmental issues.</p>
      `,
      relatedTopics: ["Environmental Art", "Sustainable Practices", "Green Materials"],
      difficulty: "Beginner",
      materials: ["Recycled Materials", "Natural Pigments", "Eco-Friendly Brushes"]
    }
  ];

  const categories = ['all', 'traditional', 'contemporary', 'technique', 'wellness'];

  const filteredBlogs = selectedCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(blog => blog.category === selectedCategory);

  const featuredPost = blogPosts[0];

  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
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
              <button 
                className="read-more-btn"
                onClick={() => openModal(featuredPost)}
              >
                View Details
              </button>
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
                      <span className="modal-date">{selectedBlog.date}</span>
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
                        <span className="spec-label">Difficulty:</span>
                        <span className="spec-value">{selectedBlog.difficulty}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Reading Time:</span>
                        <span className="spec-value">{selectedBlog.readTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="modal-additional-info">
                    <div className="related-topics">
                      <h4>Related Topics</h4>
                      <div className="topic-list">
                        {selectedBlog.relatedTopics.map(topic => (
                          <span key={topic} className="topic-item">{topic}</span>
                        ))}
                      </div>
                    </div>

                    {selectedBlog.materials && (
                      <div className="materials-section">
                        <h4>Materials Mentioned</h4>
                        <div className="materials-list">
                          {selectedBlog.materials.map(material => (
                            <span key={material} className="material-item">{material}</span>
                          ))}
                        </div>
                      </div>
                    )}
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
