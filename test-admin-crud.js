/**
 * Admin Portal CRUD Operations Test Script
 * Tests all Create, Read, Update, Delete operations for the admin portal
 */

const API_BASE_URL = 'https://api.kalakritam.in';

// Test data for different entities
const testData = {
  artwork: {
    title: "Test Artwork",
    artist: "Test Artist",
    description: "Test artwork description for CRUD testing",
    category: "Traditional",
    price: 1500,
    year: 2024,
    medium: "Oil on Canvas",
    dimensions: "30x40 cm",
    image_url: "https://via.placeholder.com/400x300/c38f21/ffffff?text=Test+Artwork"
  },
  
  workshop: {
    title: "Test Workshop",
    description: "Test workshop description for CRUD testing",
    instructor: "Test Instructor",
    category: "Painting",
    duration: "3 hours",
    level: "Beginner",
    max_participants: 15,
    price: 500,
    date: "2024-09-15",
    time: "10:00 AM",
    location: "Kalakritam Studio",
    materials_provided: true,
    image_url: "https://via.placeholder.com/400x300/c38f21/ffffff?text=Test+Workshop"
  },
  
  event: {
    title: "Test Art Event",
    description: "Test event description for CRUD testing",
    category: "Exhibition",
    date: "2024-09-20",
    time: "6:00 PM",
    location: "Kalakritam Gallery",
    price: 200,
    max_attendees: 50,
    organizer: "Kalakritam Team",
    image_url: "https://via.placeholder.com/400x300/c38f21/ffffff?text=Test+Event"
  },
  
  artist: {
    name: "Test Artist Name",
    bio: "Test artist biography for CRUD testing. This is a sample artist profile.",
    specialization: "Traditional Painting",
    experience_years: 10,
    education: "Bachelor of Fine Arts",
    awards: "Test Award 2024",
    contact_email: "testartist@kalakritam.in",
    social_media: {
      instagram: "@testartist",
      facebook: "testartist"
    },
    image_url: "https://via.placeholder.com/300x300/c38f21/ffffff?text=Test+Artist"
  },
  
  blog: {
    title: "Test Blog Post",
    content: "This is a test blog post content for CRUD testing. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "Test Author",
    category: "Art Techniques",
    tags: ["test", "painting", "tutorial"],
    featured: false,
    published: true,
    image_url: "https://via.placeholder.com/600x400/c38f21/ffffff?text=Test+Blog"
  }
};

// Admin token for authentication (you'll need to get this from admin login)
let adminToken = null;

// Utility function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
    mode: 'cors',
    credentials: 'include'
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  console.log(`🔍 ${method} ${url}`);
  if (data) console.log('📤 Data:', data);
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`📥 Response (${response.status}):`, result);
    
    if (!response.ok) {
      throw new Error(`API Error: ${result.error || result.message || 'Unknown error'}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ API Call Failed:`, error);
    throw error;
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const result = await apiCall('admin/login', 'POST', {
      username: 'admin', // Replace with actual admin credentials
      password: 'admin123' // Replace with actual admin password
    });
    
    if (result.token) {
      adminToken = result.token;
      console.log('✅ Admin login successful');
      return true;
    } else {
      console.log('❌ Admin login failed - no token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.message);
    return false;
  }
}

// Generic CRUD test function
async function testCRUD(entityName, endpoint, testDataObj) {
  console.log(`\n🧪 Testing ${entityName} CRUD Operations...`);
  
  let createdId = null;
  
  try {
    // CREATE
    console.log(`\n📝 Creating ${entityName}...`);
    const createResult = await apiCall(endpoint, 'POST', testDataObj, adminToken);
    createdId = createResult.data?.id || createResult.id;
    
    if (createdId) {
      console.log(`✅ ${entityName} created successfully with ID: ${createdId}`);
    } else {
      console.log(`⚠️ ${entityName} created but no ID returned`);
    }
    
    // READ ALL
    console.log(`\n📖 Reading all ${entityName}s...`);
    const readAllResult = await apiCall(endpoint, 'GET', null, adminToken);
    console.log(`✅ Retrieved ${readAllResult.data?.length || 0} ${entityName}s`);
    
    // READ ONE (if ID available)
    if (createdId) {
      console.log(`\n📖 Reading specific ${entityName}...`);
      try {
        const readOneResult = await apiCall(`${endpoint}/${createdId}`, 'GET', null, adminToken);
        console.log(`✅ Retrieved specific ${entityName}`);
      } catch (error) {
        console.log(`⚠️ Could not read specific ${entityName}:`, error.message);
      }
    }
    
    // UPDATE
    if (createdId) {
      console.log(`\n✏️ Updating ${entityName}...`);
      const updateData = { ...testDataObj, title: `Updated ${testDataObj.title}` };
      try {
        const updateResult = await apiCall(`${endpoint}/${createdId}`, 'PUT', updateData, adminToken);
        console.log(`✅ ${entityName} updated successfully`);
      } catch (error) {
        console.log(`⚠️ Could not update ${entityName}:`, error.message);
      }
    }
    
    // DELETE
    if (createdId) {
      console.log(`\n🗑️ Deleting ${entityName}...`);
      try {
        const deleteResult = await apiCall(`${endpoint}/${createdId}`, 'DELETE', null, adminToken);
        console.log(`✅ ${entityName} deleted successfully`);
      } catch (error) {
        console.log(`⚠️ Could not delete ${entityName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.log(`❌ ${entityName} CRUD test failed:`, error.message);
    
    // Cleanup: try to delete if we created something
    if (createdId) {
      try {
        await apiCall(`${endpoint}/${createdId}`, 'DELETE', null, adminToken);
        console.log(`🧹 Cleanup: Deleted ${entityName} with ID ${createdId}`);
      } catch (cleanupError) {
        console.log(`⚠️ Cleanup failed for ${entityName} with ID ${createdId}`);
      }
    }
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Admin Portal CRUD Tests...');
  console.log('=' .repeat(50));
  
  // Test admin authentication first
  const loginSuccess = await testAdminLogin();
  
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed with tests - admin login failed');
    console.log('Please check admin credentials and API availability');
    return;
  }
  
  // Test all entities
  const entities = [
    { name: 'Gallery/Artwork', endpoint: 'admin/gallery', data: testData.artwork },
    { name: 'Workshop', endpoint: 'admin/workshops', data: testData.workshop },
    { name: 'Event', endpoint: 'admin/events', data: testData.event },
    { name: 'Artist', endpoint: 'admin/artists', data: testData.artist },
    { name: 'Blog', endpoint: 'admin/blogs', data: testData.blog }
  ];
  
  for (const entity of entities) {
    await testCRUD(entity.name, entity.endpoint, entity.data);
    
    // Add delay between tests to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🏁 All tests completed!');
  console.log('=' .repeat(50));
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
});
