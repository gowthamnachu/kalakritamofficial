import React, { useState, useEffect } from 'react';
import { useNavigationWithLoading } from '../../hooks/useNavigationWithLoading';
import AdminHeader from '../AdminHeader';
import Footer from '../Footer';
import VideoLogo from '../VideoLogo';
import SEOFieldsComponent from '../SEOFieldsComponent';
import FileUpload from '../FileUpload';
import { artistsApi } from '../../lib/adminApi';
import { config } from '../../config/environment';
import '../AdminGallery/AdminGallery.css';
import './AdminArtists.css';

const AdminArtists = () => {
  const { navigateWithLoading } = useNavigationWithLoading();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigateWithLoading('/admin/login');
    }
  };

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    specialization: '',
    email: '',
    phone: '',
    website: '',
    imageUrl: '',
    socialLinks: '',
    featured: false,
    active: true,
    // SEO fields
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    slug: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: ''
  });

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await artistsApi.getAll();
      // Handle API response structure
      const data = response.data || response || [];
      setArtists(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError('Failed to load artists');
      setArtists([]); // Ensure artists is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      bio: '',
      specialization: '',
      email: '',
      phone: '',
      website: '',
      imageUrl: '',
      socialLinks: '',
      featured: false,
      active: true
    });
    setImageFile(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (artist) => {
    setFormData({
      name: artist.name || '',
      bio: artist.bio || '',
      specialization: artist.specialization || '',
      email: artist.email || '',
      phone: artist.phone || '',
      website: artist.website || '',
      imageUrl: artist.image_url || '',
      socialLinks: typeof artist.social_links === 'object' ? JSON.stringify(artist.social_links) : (artist.social_links || ''),
      featured: artist.featured || false,
      active: artist.active !== false,
      // SEO fields
      metaTitle: artist.meta_title || '',
      metaDescription: artist.meta_description || '',
      metaKeywords: artist.meta_keywords || '',
      slug: artist.slug || '',
      ogTitle: artist.og_title || '',
      ogDescription: artist.og_description || '',
      ogImage: artist.og_image || ''
    });
    setImageFile(null);
    setSelectedArtist(artist);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (artist) => {
    setSelectedArtist(artist);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = async (artistId) => {
    if (!confirm('Are you sure you want to delete this artist profile?')) return;
    
    try {
      await artistsApi.delete(artistId);
      setArtists(artists.filter(artist => artist.id !== artistId));
      alert('Artist deleted successfully');
    } catch (err) {
      console.error('Error deleting artist:', err);
      alert('Failed to delete artist');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data with correct field mapping for database
      let socialLinksData = '';
      try {
        if (formData.socialLinks && formData.socialLinks.trim()) {
          // Try to parse as JSON, if it fails, keep as string
          socialLinksData = JSON.parse(formData.socialLinks);
        }
      } catch {
        socialLinksData = formData.socialLinks;
      }

      const artistData = {
        name: formData.name,
        bio: formData.bio,
        specialization: formData.specialization,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        image_url: formData.imageUrl || '',
        social_links: socialLinksData,
        featured: formData.featured,
        active: formData.active,
        // SEO fields
        meta_title: formData.metaTitle,
        meta_description: formData.metaDescription,
        meta_keywords: formData.metaKeywords,
        slug: formData.slug,
        og_title: formData.ogTitle,
        og_description: formData.ogDescription,
        og_image: formData.ogImage
      };

      let result;
      if (modalMode === 'create') {
        result = await artistsApi.create(artistData);
      } else {
        result = await artistsApi.update(selectedArtist.id, artistData);
      }

      alert(`Artist ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
      setIsModalOpen(false);
      fetchArtists(); // Refresh the list
    } catch (err) {
      console.error('Error saving artist:', err);
      alert(`Failed to ${modalMode} artist: ${err.message}`);
    }
  };

  const handleFileSelect = (file) => {
    setImageFile(file);
    // Create a preview URL
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: previewUrl
      }));
    }
  };

  const handleFileRemove = () => {
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSeoChange = (seoData) => {
    setFormData(prev => ({
      ...prev,
      ...seoData
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArtist(null);
    setModalMode('view');
  };

  if (loading) {
    return (
      <div className="admin-gallery-container">
        <VideoLogo />
        <AdminHeader currentPage="artists" />
        <div className="admin-gallery-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading artists...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-gallery-container">
        <VideoLogo />
        <AdminHeader currentPage="artists" />
        <div className="admin-gallery-content">
          <div className="error-container">
            <h2>Unable to load artists</h2>
            <p>{error}</p>
            <button onClick={fetchArtists} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-gallery-container">
      <VideoLogo />
      <AdminHeader currentPage="artists" />
      
      <main className="admin-gallery-content">
        <section className="admin-gallery-header">
          <div className="header-content">
            <h1 className="admin-gallery-title">Artist Management</h1>
            <p className="admin-gallery-subtitle">Manage Artist Profiles & Portfolios</p>
            <button onClick={() => navigateWithLoading('/admin/portal')} className="back-btn">
              ← Back to Admin Portal
            </button>
          </div>
          <div className="header-actions">
            <button onClick={handleCreate} className="create-btn">
              + Add New Artist
            </button>
            <div className="gallery-stats">
              <span className="stat">Total: {artists.length}</span>
              <span className="stat">Active: {artists.filter(a => a.isActive).length}</span>
            </div>
          </div>
        </section>

        <section className="artworks-table-section">
          <div className="table-container">
            <table className="artworks-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.map(artist => (
                  <tr key={artist.id}>
                    <td>
                      <div className="artwork-image-cell">
                        <img 
                          src={artist.image_url} 
                          alt={artist.name}
                          className="table-artwork-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="image-placeholder" style={{ display: 'none' }}>
                          <span>No Image</span>
                        </div>
                      </div>
                    </td>
                    <td className="artwork-title-cell">{artist.name}</td>
                    <td>
                      <span className="category-badge">{artist.specialization}</span>
                    </td>
                    <td>{artist.location}</td>
                    <td>{artist.experience}</td>
                    <td className="contact-cell">
                      <div>{artist.email}</div>
                      <div className="phone-text">{artist.phone}</div>
                    </td>
                    <td>
                      <div className="status-badges">
                        {artist.isActive && <span className="status-badge available">Active</span>}
                        {artist.featured && <span className="status-badge featured">Featured</span>}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleView(artist)}
                          className="action-btn view-btn"
                          title="View Profile"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => handleEdit(artist)}
                          className="action-btn edit-btn"
                          title="Edit Artist"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(artist.id)}
                          className="action-btn delete-btn"
                          title="Delete Artist"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal for Create/Edit/View */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' && 'Add New Artist'}
                {modalMode === 'edit' && 'Edit Artist'}
                {modalMode === 'view' && 'Artist Profile'}
              </h2>
              <button onClick={closeModal} className="modal-close-btn">×</button>
            </div>
            
            <div className="modal-content">
              {modalMode === 'view' ? (
                <div className="artwork-details-view">
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedArtist?.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedArtist?.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedArtist?.phone}</span>
                    </div>
                    <div className="detail-item">
                      <label>Specialization:</label>
                      <span>{selectedArtist?.specialization}</span>
                    </div>
                    <div className="detail-item">
                      <label>Website:</label>
                      <span>{selectedArtist?.website || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Social Links:</label>
                      <span>{selectedArtist?.social_links ? JSON.stringify(selectedArtist.social_links) : 'Not provided'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Bio:</label>
                      <span>{selectedArtist?.bio}</span>
                    </div>

                    {/* SEO Information */}
                    {(selectedArtist?.seoTitle || selectedArtist?.seoDescription) && (
                      <>
                        <div className="detail-section-title">SEO Information</div>
                        {selectedArtist?.seoTitle && (
                          <div className="detail-item full-width">
                            <label>SEO Title:</label>
                            <span>{selectedArtist.seoTitle}</span>
                          </div>
                        )}
                        {selectedArtist?.seoDescription && (
                          <div className="detail-item full-width">
                            <label>SEO Description:</label>
                            <span>{selectedArtist.seoDescription}</span>
                          </div>
                        )}
                        {selectedArtist?.seoKeywords && (
                          <div className="detail-item full-width">
                            <label>SEO Keywords:</label>
                            <span>{selectedArtist.seoKeywords}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="artwork-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="specialization">Specialization *</label>
                      <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Specialization</option>
                        <option value="painter">Painter</option>
                        <option value="sculptor">Sculptor</option>
                        <option value="photographer">Photographer</option>
                        <option value="calligrapher">Calligrapher</option>
                        <option value="illustrator">Illustrator</option>
                        <option value="digital-artist">Digital Artist</option>
                        <option value="mixed-media">Mixed Media</option>
                        <option value="traditional-artist">Traditional Artist</option>
                        <option value="contemporary-artist">Contemporary Artist</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="website">Website URL</label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://artist-website.com"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="socialLinks">Social Links (JSON)</label>
                      <textarea
                        id="socialLinks"
                        name="socialLinks"
                        value={formData.socialLinks}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder='{"instagram": "https://instagram.com/artist", "facebook": "https://facebook.com/artist"}'
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Profile Image</label>
                      <FileUpload
                        currentImageUrl={formData.imageUrl}
                        onFileSelect={handleFileSelect}
                        onFileRemove={handleFileRemove}
                        acceptedTypes="image/*"
                        maxSize={5}
                        label="Upload Profile Image"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="portfolioImages">Portfolio Images (URLs)</label>
                      <textarea
                        id="portfolioImages"
                        name="portfolioImages"
                        value={formData.portfolioImages}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter multiple image URLs separated by commas"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="bio">Artist Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Tell us about the artist's background, style, and artistic journey..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        Active Artist
                      </label>
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                        />
                        Featured Artist
                      </label>
                    </div>
                  </div>

                  <SEOFieldsComponent
                    data={formData}
                    onChange={handleSeoChange}
                    type="artist"
                  />
                  
                  <div className="form-actions">
                    <button type="button" onClick={closeModal} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {modalMode === 'create' ? 'Create Artist' : 'Update Artist'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default AdminArtists;

