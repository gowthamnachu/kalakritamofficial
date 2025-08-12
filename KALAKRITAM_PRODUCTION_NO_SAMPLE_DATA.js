// Kalakritam Backend API - PRODUCTION VERSION - NO SAMPLE DATA
// Only uses real data from database proxy - no fallbacks
// Copy this entire code to Cloudflare Workers Dashboard

// ================================
// CORS CONFIGURATION
// ================================
function getCorsHeaders(origin) {
  const allowedOrigins = [
    'https://kalakritam.in',
    'https://www.kalakritam.in',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ];
  
  const isAllowed = allowedOrigins.includes(origin) || origin === undefined;
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };
}

function handleOptions(request) {
  const origin = request.headers.get('Origin');
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  });
}

function jsonResponse(data, status = 200, request) {
  const origin = request.headers.get('Origin');
  return new Response(JSON.stringify(data), {
    status,
    headers: getCorsHeaders(origin)
  });
}

// ================================
// DATABASE PROXY CONNECTION
// ================================
async function executeQuery(env, query, params = []) {
  try {
    const proxyUrl = env.DATABASE_PROXY_URL || 'https://kalakritam-db-proxy-production.gowthamnachu545.workers.dev';
    const proxyToken = env.DB_PROXY_TOKEN || 'kalakritam-db-proxy-token-2025';
    
    console.log('Using proxy URL:', proxyUrl);
    console.log('Making request to:', `${proxyUrl}/query`);
    
    const response = await fetch(`${proxyUrl}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${proxyToken}`,
      },
      body: JSON.stringify({
        query,
        params
      })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`Database proxy error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Success result:', result);
    
    return {
      success: true,
      data: result.rows || [],
      rowCount: result.rowCount || 0
    };
    
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

function generateId(prefix = 'rec') {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').substring(0, 20)}`;
}

// ================================
// JWT AUTHENTICATION
// ================================
async function generateJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJWT(token, secret) {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(`${header}.${payload}`)
    );
    
    const expectedSignatureBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature)));
    
    if (signature !== expectedSignatureBase64) {
      return null;
    }
    
    return JSON.parse(atob(payload));
  } catch (error) {
    return null;
  }
}

async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return await verifyJWT(token, env.JWT_SECRET);
}

// ================================
// ADMIN AUTHENTICATION HELPER
// ================================
async function verifyAdminAuth(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        response: jsonResponse({
          success: false,
          message: 'Authorization header required'
        }, 401, request)
      };
    }
    
    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, env.JWT_SECRET);
    
    if (!payload || payload.role !== 'admin') {
      return {
        success: false,
        response: jsonResponse({
          success: false,
          message: 'Invalid admin token'
        }, 401, request)
      };
    }
    
    return {
      success: true,
      user: payload
    };
  } catch (error) {
    return {
      success: false,
      response: jsonResponse({
        success: false,
        message: 'Authentication failed',
        error: error.message
      }, 401, request)
    };
  }
}

// ================================
// PASSWORD HASHING
// ================================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function comparePassword(password, hash) {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// ================================
// DATABASE OPERATIONS
// ================================
class DatabaseService {
  constructor(env) {
    this.env = env;
  }

  async findMany(table, options = {}) {
    try {
      const { filter = {}, limit = 10, offset = 0, orderBy = 'created_at DESC' } = options;
      
      let query = `SELECT * FROM ${table}`;
      const params = [];
      const conditions = [];
      
      // Add filter conditions
      Object.entries(filter).forEach(([key, value], index) => {
        conditions.push(`${key} = $${index + 1}`);
        params.push(value);
      });
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      }
      
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);
      
      const result = await executeQuery(this.env, query, params);
      
      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      console.error(`Database error in findMany ${table}:`, error);
      throw error;
    }
  }

  async findById(table, id) {
    try {
      const query = `SELECT * FROM ${table} WHERE id = $1 LIMIT 1`;
      const result = await executeQuery(this.env, query, [id]);
      
      return {
        success: true,
        data: result.data[0] || null
      };
    } catch (error) {
      console.error(`Database error in findById ${table}:`, error);
      throw error;
    }
  }

  async create(table, data) {
    try {
      if (!data.id) {
        data.id = generateId();
      }
      data.created_at = new Date().toISOString();
      data.updated_at = new Date().toISOString();
      
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(data);
      
      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
      const result = await executeQuery(this.env, query, values);
      
      return {
        success: true,
        data: result.data[0] || null
      };
    } catch (error) {
      console.error(`Database error in create ${table}:`, error);
      throw error;
    }
  }

  async update(table, id, data) {
    try {
      data.updated_at = new Date().toISOString();
      
      const setClause = Object.keys(data).map((key, i) => `${key} = $${i + 2}`).join(', ');
      const values = [id, ...Object.values(data)];
      
      const query = `UPDATE ${table} SET ${setClause} WHERE id = $1 RETURNING *`;
      const result = await executeQuery(this.env, query, values);
      
      return {
        success: true,
        data: result.data[0] || null
      };
    } catch (error) {
      console.error(`Database error in update ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
      const result = await executeQuery(this.env, query, [id]);
      
      return {
        success: true,
        data: result.data[0] || null
      };
    } catch (error) {
      console.error(`Database error in delete ${table}:`, error);
      throw error;
    }
  }

  async findByEmail(table, email) {
    try {
      const query = `SELECT * FROM ${table} WHERE email = $1 LIMIT 1`;
      const result = await executeQuery(this.env, query, [email]);
      
      return {
        success: true,
        data: result.data[0] || null
      };
    } catch (error) {
      console.error(`Database error in findByEmail ${table}:`, error);
      throw error;
    }
  }

  async search(table, searchTerm, columns) {
    try {
      const searchConditions = columns.map((col, i) => 
        `${col} ILIKE $${i + 1}`
      ).join(' OR ');
      
      const params = columns.map(() => `%${searchTerm}%`);
      
      const query = `SELECT * FROM ${table} WHERE ${searchConditions} ORDER BY created_at DESC`;
      const result = await executeQuery(this.env, query, params);
      
      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      console.error(`Database error in search ${table}:`, error);
      throw error;
    }
  }
}

// ================================
// API ROUTES
// ================================
const routes = {
  // =====================================
  // HEALTH CHECK
  // =====================================
  'GET /test-db': async (request, env) => {
    try {
      const result = await executeQuery(env, 'SELECT 1 as test');
      
      return jsonResponse({
        success: true,
        message: 'Database connection successful',
        hasEnvironment: !!env,
        hasProxyUrl: !!(env?.DATABASE_PROXY_URL),
        hasProxyToken: !!(env?.DB_PROXY_TOKEN),
        testQuery: result.data[0] || null,
        environment: env?.NODE_ENV || 'production',
        connectionMethod: 'database-proxy',
        note: 'Production mode - no sample data fallback'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Database connection failed',
        error: error.message,
        connectionMethod: 'none',
        note: 'Production mode - database connection required'
      }, 500, request);
    }
  },

  // =====================================
  // API INFO ENDPOINT - COMPREHENSIVE DOCUMENTATION
  // =====================================
  'GET /api/info': async (request, env) => {
    return jsonResponse({
      success: true,
      message: 'Kalakritam API Information',
      environment: env?.NODE_ENV || 'production',
      version: '2.0.0',
      baseUrl: 'https://api.kalakritam.in',
      documentation: {
        // Public Endpoints (GET only)
        public: {
          gallery: {
            'GET /gallery': 'Get all gallery items (artworks)',
            'GET /gallery/:id': 'Get single gallery item by ID'
          },
          artists: {
            'GET /artists': 'Get all active artists',
            'GET /artists/:id': 'Get single artist by ID'
          },
          blogs: {
            'GET /blogs': 'Get all published blogs',
            'GET /blogs/:id': 'Get single blog by ID'
          },
          events: {
            'GET /events': 'Get all active events',
            'GET /events/:id': 'Get single event by ID'
          },
          workshops: {
            'GET /workshops': 'Get all active workshops',
            'GET /workshops/:id': 'Get single workshop by ID'
          },
          contact: {
            'POST /contact': 'Submit contact form'
          },
          tickets: {
            'GET /tickets/verify/:ticketId': 'Verify ticket by ID or number'
          }
        },
        // Admin Endpoints (Full CRUD)
        admin: {
          authentication: {
            'POST /admin/login': 'Admin login with email/password',
            'GET /admin/me': 'Get current admin user info'
          },
          gallery: {
            'GET /admin/gallery': 'Get all gallery items (admin view)',
            'GET /admin/gallery/:id': 'Get single gallery item',
            'POST /admin/gallery': 'Create new gallery item',
            'PUT /admin/gallery/:id': 'Update gallery item',
            'DELETE /admin/gallery/:id': 'Delete gallery item'
          },
          artists: {
            'GET /admin/artists': 'Get all artists (admin view)',
            'GET /admin/artists/:id': 'Get single artist',
            'POST /admin/artists': 'Create new artist',
            'PUT /admin/artists/:id': 'Update artist',
            'DELETE /admin/artists/:id': 'Delete artist'
          },
          blogs: {
            'GET /admin/blogs': 'Get all blogs (including unpublished)',
            'GET /admin/blogs/:id': 'Get single blog',
            'POST /admin/blogs': 'Create new blog',
            'PUT /admin/blogs/:id': 'Update blog',
            'DELETE /admin/blogs/:id': 'Delete blog'
          },
          events: {
            'GET /admin/events': 'Get all events (admin view)',
            'GET /admin/events/:id': 'Get single event',
            'POST /admin/events': 'Create new event',
            'PUT /admin/events/:id': 'Update event',
            'DELETE /admin/events/:id': 'Delete event'
          },
          workshops: {
            'GET /admin/workshops': 'Get all workshops (admin view)',
            'GET /admin/workshops/:id': 'Get single workshop',
            'POST /admin/workshops': 'Create new workshop',
            'PUT /admin/workshops/:id': 'Update workshop',
            'DELETE /admin/workshops/:id': 'Delete workshop'
          },
          contacts: {
            'GET /admin/contacts': 'Get all contact submissions',
            'GET /admin/contacts/:id': 'Get single contact submission',
            'PUT /admin/contacts/:id': 'Update contact status',
            'DELETE /admin/contacts/:id': 'Delete contact submission'
          },
          tickets: {
            'GET /admin/tickets': 'Get all tickets',
            'GET /admin/tickets/:id': 'Get single ticket',
            'POST /admin/tickets': 'Create new ticket',
            'PUT /admin/tickets/:id': 'Update ticket',
            'DELETE /admin/tickets/:id': 'Delete ticket',
            'PATCH /admin/tickets/:id/verify': 'Mark ticket as verified'
          }
        }
      },
      queryParameters: {
        pagination: {
          page: 'Page number (default: 1)',
          limit: 'Items per page (default: 10-20 depending on endpoint)'
        },
        filters: {
          category: 'Filter by category',
          featured: 'Filter featured items (true/false)',
          status: 'Filter by status',
          published: 'Filter published items (true/false)'
        }
      },
      authentication: {
        required: 'All /admin/* endpoints require Bearer token',
        header: 'Authorization: Bearer <token>',
        loginEndpoint: 'POST /admin/login'
      }
    }, 200, request);
  },

  // =====================================
  // DEBUG ENDPOINT
  // =====================================
  'GET /debug-config': async (request, env) => {
    return jsonResponse({
      success: true,
      config: {
        proxyUrl: env.DATABASE_PROXY_URL || 'https://kalakritam-db-proxy-production.gowthamnachu545.workers.dev',
        hasProxyUrl: !!env.DATABASE_PROXY_URL,
        hasProxyToken: !!env.DB_PROXY_TOKEN,
        hasJwtSecret: !!env.JWT_SECRET,
        nodeEnv: env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
      }
    }, 200, request);
  },

  'GET /test-proxy': async (request, env) => {
    try {
      const proxyUrl = env.DATABASE_PROXY_URL || 'https://kalakritam-db-proxy-production.gowthamnachu545.workers.dev';
      const proxyToken = env.DB_PROXY_TOKEN || 'kalakritam-db-proxy-token-2025';
      
      // Test the exact same request as executeQuery
      const response = await fetch(`${proxyUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${proxyToken}`,
        },
        body: JSON.stringify({
          query: 'SELECT 1 as test',
          params: []
        })
      });

      const responseText = await response.text();
      
      return jsonResponse({
        success: true,
        message: 'Proxy test completed',
        url: `${proxyUrl}/query`,
        method: 'POST',
        status: response.status,
        ok: response.ok,
        responseText: responseText,
        hasProxyToken: !!env.DB_PROXY_TOKEN,
        hasProxyUrl: !!env.DATABASE_PROXY_URL
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Proxy test failed',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // GALLERY ENDPOINTS
  // =====================================
  'GET /gallery': async (request, env) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '12');
      const category = url.searchParams.get('category');
      const featured = url.searchParams.get('featured');
      
      const db = new DatabaseService(env);
      
      const filter = {};
      if (category) filter.category = category;
      if (featured) filter.featured = featured === 'true';
      
      const result = await db.findMany('artworks', {
        filter,
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.data.length
        },
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch gallery items',
        error: error.message
      }, 500, request);
    }
  },

  'GET /gallery/:id': async (request, env) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/')[2];
      
      const db = new DatabaseService(env);
      const result = await db.findById('artworks', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Artwork not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data,
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch artwork',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // EVENTS ENDPOINTS
  // =====================================
  'GET /events': async (request, env) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      const db = new DatabaseService(env);
      
      const result = await db.findMany('events', {
        filter: {},
        limit,
        offset: (page - 1) * limit,
        orderBy: 'start_date DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.data.length
        },
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      }, 500, request);
    }
  },

  'GET /events/:id': async (request, env) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/')[2];
      
      const db = new DatabaseService(env);
      const result = await db.findById('events', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Event not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data,
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch event',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ARTISTS ENDPOINTS
  // =====================================
  'GET /artists': async (request, env) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const featured = url.searchParams.get('featured');
      const offset = (page - 1) * limit;
      
      // Build WHERE conditions
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;
      
      if (featured === 'true') {
        whereConditions.push(`featured = $${paramIndex}`);
        params.push(true);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM artists ${whereClause}`;
      const countResult = await executeQuery(env, countQuery, params);
      const total = parseInt(countResult.data[0]?.total || 0);
      const totalPages = Math.ceil(total / limit);
      
      // Get artists with pagination
      params.push(limit, offset);
      const query = `
        SELECT 
          id, name, bio, specialization, email, phone, website, 
          image_url, social_links, featured, active,
          meta_title, meta_description, meta_keywords, slug,
          og_title, og_description, og_image,
          created_at, updated_at
        FROM artists 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const result = await executeQuery(env, query, params);
      
      return jsonResponse({
        success: true,
        message: 'Artists fetched successfully',
        data: result.data || [],
        pagination: { 
          page, 
          limit, 
          total, 
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch artists',
        error: error.message
      }, 500, request);
    }
  },

  'GET /artists/:id': async (request, env) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/')[2];
      
      const query = `
        SELECT 
          id, name, bio, specialization, email, phone, website, 
          image_url, social_links, featured, active,
          meta_title, meta_description, meta_keywords, slug,
          og_title, og_description, og_image,
          created_at, updated_at
        FROM artists 
        WHERE id = $1 AND active = true
      `;
      
      const result = await executeQuery(env, query, [id]);
      
      if (!result.data || result.data.length === 0) {
        return jsonResponse({
          success: false,
          message: 'Artist not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        message: 'Artist fetched successfully',
        data: result.data[0],
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch artist',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // BLOGS ENDPOINTS
  // =====================================
  'GET /blogs': async (request, env) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const category = url.searchParams.get('category');
      const featured = url.searchParams.get('featured');
      
      const db = new DatabaseService(env);
      
      const filter = {};
      if (category) filter.category = category;
      if (featured) filter.featured = featured === 'true';
      
      const result = await db.findMany('blogs', {
        filter,
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.data.length
        },
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch blogs',
        error: error.message
      }, 500, request);
    }
  },

  'GET /blogs/:id': async (request, env) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/')[2];
      
      const db = new DatabaseService(env);
      const result = await db.findById('blogs', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Blog not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data,
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch blog',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // WORKSHOPS ENDPOINTS
  // =====================================
  'GET /workshops': async (request, env) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      const db = new DatabaseService(env);
      
      const result = await db.findMany('workshops', {
        filter: {},
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.data.length
        },
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch workshops',
        error: error.message
      }, 500, request);
    }
  },

  'GET /workshops/:id': async (request, env) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/')[2];
      
      const db = new DatabaseService(env);
      const result = await db.findById('workshops', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Workshop not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data,
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch workshop',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // CONTACT ENDPOINT
  // =====================================
  'POST /contact': async (request, env) => {
    try {
      const contactData = await request.json();
      const { name, email, message, phone, subject } = contactData;
      
      // Validate required fields
      if (!name || !email || !message) {
        return jsonResponse({
          success: false,
          message: 'Name, email, and message are required'
        }, 400, request);
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return jsonResponse({
          success: false,
          message: 'Please provide a valid email address'
        }, 400, request);
      }
      
      // Generate unique ID
      const id = `rec_${Math.random().toString(36).substr(2, 24)}`;
      
      const query = `
        INSERT INTO contacts (
          id, name, email, phone, subject, message, 
          status, is_read, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const now = new Date().toISOString();
      const result = await executeQuery(env, query, [
        id, name, email, phone || null, subject || 'General Inquiry', 
        message, 'unread', false, now, now
      ]);
      
      return jsonResponse({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon!',
        data: result.data[0],
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to send message',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // SEARCH ENDPOINT
  // =====================================
  'GET /search': async (request, env) => {
    try {
      const url = new URL(request.url);
      const query = url.searchParams.get('q');
      const type = url.searchParams.get('type') || 'all';
      
      if (!query) {
        return jsonResponse({
          success: false,
          message: 'Search query is required'
        }, 400, request);
      }
      
      const db = new DatabaseService(env);
      const results = {};
      
      if (type === 'all' || type === 'artworks') {
        const artworks = await db.search('artworks', query, ['title', 'description', 'artist', 'category']);
        results.artworks = artworks.data;
      }
      
      if (type === 'all' || type === 'events') {
        const events = await db.search('events', query, ['title', 'description', 'venue']);
        results.events = events.data;
      }
      
      if (type === 'all' || type === 'artists') {
        const artists = await db.search('artists', query, ['name', 'bio', 'specialization']);
        results.artists = artists.data;
      }
      
      if (type === 'all' || type === 'blogs') {
        const blogs = await db.search('blogs', query, ['title', 'content', 'excerpt', 'category']);
        results.blogs = blogs.data;
      }
      
      return jsonResponse({
        success: true,
        data: results,
        query,
        type,
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Search failed',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // TICKETS ENDPOINTS
  // =====================================
  'GET /tickets': async (request, env) => {
    try {
      const url = new URL(request.url);
      const eventId = url.searchParams.get('eventId');
      const status = url.searchParams.get('status');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;
      
      let whereConditions = [];
      let params = [];
      let paramIndex = 1;
      
      if (eventId) {
        whereConditions.push(`event_id = $${paramIndex}`);
        params.push(eventId);
        paramIndex++;
      }
      
      if (status) {
        whereConditions.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM tickets ${whereClause}`;
      const countResult = await executeQuery(env, countQuery, params);
      const total = parseInt(countResult.data[0]?.total || 0);
      const totalPages = Math.ceil(total / limit);
      
      // Get tickets with pagination
      params.push(limit, offset);
      const query = `
        SELECT 
          id, ticket_number, customer_name, customer_email, customer_phone,
          event_name, event_id, number_of_tickets, amount_paid, event_timings, venue,
          qr_code_url, status, is_verified, verified_at, verified_by, created_at, updated_at
        FROM tickets 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      const result = await executeQuery(env, query, params);
      
      return jsonResponse({
        success: true,
        message: 'Tickets fetched successfully',
        data: result.data || [],
        pagination: { 
          page, 
          limit, 
          total, 
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: { eventId, status },
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch tickets',
        error: error.message
      }, 500, request);
    }
  },

  'GET /tickets/verify/:ticketId': async (request, env) => {
    try {
      const url = new URL(request.url);
      const ticketId = url.pathname.split('/')[3]; // Extract ticketId from path
      
      const query = `
        SELECT 
          id, ticket_number, customer_name, customer_email, customer_phone,
          event_name, event_id, number_of_tickets, amount_paid, event_timings, venue,
          qr_code_url, status, is_verified, verified_at, verified_by, created_at
        FROM tickets 
        WHERE id = $1 OR ticket_number = $1
      `;
      
      const result = await executeQuery(env, query, [ticketId]);
      
      if (!result.data || result.data.length === 0) {
        return jsonResponse({
          success: false,
          message: 'Ticket not found'
        }, 404, request);
      }
      
      const ticket = result.data[0];
      
      // Check if ticket is valid
      if (ticket.status !== 'valid') {
        return jsonResponse({
          success: false,
          message: `Ticket is ${ticket.status}`,
          data: { status: ticket.status }
        }, 400, request);
      }
      
      return jsonResponse({
        success: true,
        message: 'Ticket verified successfully',
        data: ticket,
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to verify ticket',
        error: error.message
      }, 500, request);
    }
  },

  'GET /tickets/:ticketId': async (request, env) => {
    try {
      const url = new URL(request.url);
      const ticketId = url.pathname.split('/')[2]; // Extract ticketId from path
      
      const query = `
        SELECT 
          id, ticket_number, customer_name, customer_email, customer_phone,
          event_name, event_id, number_of_tickets, amount_paid, event_timings, venue,
          qr_code, qr_code_url, status, is_verified, verified_at, verified_by, created_at, updated_at
        FROM tickets 
        WHERE id = $1 OR ticket_number = $1
      `;
      
      const result = await executeQuery(env, query, [ticketId]);
      
      if (!result.data || result.data.length === 0) {
        return jsonResponse({
          success: false,
          message: 'Ticket not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        message: 'Ticket details fetched successfully',
        data: result.data[0],
        dataSource: 'database'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch ticket details',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ADMIN AUTHENTICATION ENDPOINTS
  // =====================================
  'POST /admin/login': async (request, env) => {
    try {
      const { email, password } = await request.json();
      
      if (!email || !password) {
        return jsonResponse({
          success: false,
          message: 'Email and password are required'
        }, 400, request);
      }
      
      // Simple admin authentication - you should implement proper user management
      const adminEmail = env.ADMIN_EMAIL || 'admin@kalakritam.in';
      const adminPassword = env.ADMIN_PASSWORD || 'kalakritam123';
      
      if (email !== adminEmail || password !== adminPassword) {
        return jsonResponse({
          success: false,
          message: 'Invalid credentials'
        }, 401, request);
      }
      
      const token = await generateJWT({ email, role: 'admin' }, env.JWT_SECRET);
      
      return jsonResponse({
        success: true,
        message: 'Login successful',
        token,
        user: { email, role: 'admin' }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Login failed',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/me': async (request, env) => {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return jsonResponse({
          success: false,
          message: 'Authorization header required'
        }, 401, request);
      }
      
      const token = authHeader.substring(7);
      const payload = await verifyJWT(token, env.JWT_SECRET);
      
      return jsonResponse({
        success: true,
        user: payload
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Invalid token',
        error: error.message
      }, 401, request);
    }
  },

  // =====================================
  // ADMIN GALLERY ENDPOINTS (CRUD)
  // =====================================
  'GET /admin/gallery': async (request, env) => {
    try {
      // Authentication check
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '12');
      
      const db = new DatabaseService(env);
      const result = await db.findMany('artworks', {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.data.length }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch gallery items',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/gallery/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.findById('artworks', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Artwork not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch artwork',
        error: error.message
      }, 500, request);
    }
  },

  'POST /admin/gallery': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const data = await request.json();
      const db = new DatabaseService(env);
      
      const result = await db.create('artworks', {
        ...data,
        active: true,
        created_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Artwork created successfully',
        data: result.data
      }, 201, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to create artwork',
        error: error.message
      }, 500, request);
    }
  },

  'PUT /admin/gallery/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      const data = await request.json();
      
      const db = new DatabaseService(env);
      const result = await db.update('artworks', id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Artwork updated successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to update artwork',
        error: error.message
      }, 500, request);
    }
  },

  'DELETE /admin/gallery/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.delete('artworks', id);
      
      return jsonResponse({
        success: true,
        message: 'Artwork deleted successfully'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to delete artwork',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ADMIN ARTISTS ENDPOINTS (CRUD)
  // =====================================
  'GET /admin/artists': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      const db = new DatabaseService(env);
      const result = await db.findMany('artists', {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.data.length }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch artists',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/artists/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.findById('artists', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Artist not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch artist',
        error: error.message
      }, 500, request);
    }
  },

  'POST /admin/artists': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const data = await request.json();
      const db = new DatabaseService(env);
      
      const result = await db.create('artists', {
        ...data,
        active: true,
        created_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Artist created successfully',
        data: result.data
      }, 201, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to create artist',
        error: error.message
      }, 500, request);
    }
  },

  'PUT /admin/artists/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      const data = await request.json();
      
      const db = new DatabaseService(env);
      const result = await db.update('artists', id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Artist updated successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to update artist',
        error: error.message
      }, 500, request);
    }
  },

  'DELETE /admin/artists/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.delete('artists', id);
      
      return jsonResponse({
        success: true,
        message: 'Artist deleted successfully'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to delete artist',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ADMIN BLOGS ENDPOINTS (CRUD)
  // =====================================
  'GET /admin/blogs': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      const db = new DatabaseService(env);
      const result = await db.findMany('blogs', {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.data.length }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch blogs',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/blogs/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.findById('blogs', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Blog not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch blog',
        error: error.message
      }, 500, request);
    }
  },

  'POST /admin/blogs': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const data = await request.json();
      const db = new DatabaseService(env);
      
      const result = await db.create('blogs', {
        ...data,
        published: data.published || false,
        created_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Blog created successfully',
        data: result.data
      }, 201, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to create blog',
        error: error.message
      }, 500, request);
    }
  },

  'PUT /admin/blogs/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      const data = await request.json();
      
      const db = new DatabaseService(env);
      const result = await db.update('blogs', id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Blog updated successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to update blog',
        error: error.message
      }, 500, request);
    }
  },

  'DELETE /admin/blogs/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.delete('blogs', id);
      
      return jsonResponse({
        success: true,
        message: 'Blog deleted successfully'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to delete blog',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ADMIN EVENTS ENDPOINTS (CRUD)
  // =====================================
  'GET /admin/events': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      const db = new DatabaseService(env);
      const result = await db.findMany('events', {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'event_date DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.data.length }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch events',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/events/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.findById('events', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Event not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch event',
        error: error.message
      }, 500, request);
    }
  },

  'POST /admin/events': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const data = await request.json();
      const db = new DatabaseService(env);
      
      const result = await db.create('events', {
        ...data,
        active: true,
        created_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Event created successfully',
        data: result.data
      }, 201, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to create event',
        error: error.message
      }, 500, request);
    }
  },

  'PUT /admin/events/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      const data = await request.json();
      
      const db = new DatabaseService(env);
      const result = await db.update('events', id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Event updated successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to update event',
        error: error.message
      }, 500, request);
    }
  },

  'DELETE /admin/events/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.delete('events', id);
      
      return jsonResponse({
        success: true,
        message: 'Event deleted successfully'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to delete event',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ADMIN WORKSHOPS ENDPOINTS (CRUD)
  // =====================================
  'GET /admin/workshops': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      const db = new DatabaseService(env);
      const result = await db.findMany('workshops', {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.data.length }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch workshops',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/workshops/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.findById('workshops', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Workshop not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch workshop',
        error: error.message
      }, 500, request);
    }
  },

  'POST /admin/workshops': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const data = await request.json();
      const db = new DatabaseService(env);
      
      const result = await db.create('workshops', {
        ...data,
        active: true,
        created_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Workshop created successfully',
        data: result.data
      }, 201, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to create workshop',
        error: error.message
      }, 500, request);
    }
  },

  'PUT /admin/workshops/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      const data = await request.json();
      
      const db = new DatabaseService(env);
      const result = await db.update('workshops', id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Workshop updated successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to update workshop',
        error: error.message
      }, 500, request);
    }
  },

  'DELETE /admin/workshops/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.delete('workshops', id);
      
      return jsonResponse({
        success: true,
        message: 'Workshop deleted successfully'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to delete workshop',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ADMIN CONTACTS ENDPOINTS (READ/UPDATE/DELETE)
  // =====================================
  'GET /admin/contacts': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      const db = new DatabaseService(env);
      const result = await db.findMany('contacts', {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.data.length }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch contacts',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/contacts/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.findById('contacts', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Contact not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch contact',
        error: error.message
      }, 500, request);
    }
  },

  'PUT /admin/contacts/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      const data = await request.json();
      
      const db = new DatabaseService(env);
      const result = await db.update('contacts', id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Contact updated successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to update contact',
        error: error.message
      }, 500, request);
    }
  },

  'DELETE /admin/contacts/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.delete('contacts', id);
      
      return jsonResponse({
        success: true,
        message: 'Contact deleted successfully'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to delete contact',
        error: error.message
      }, 500, request);
    }
  },

  // =====================================
  // ADMIN TICKETS ENDPOINTS (CRUD)
  // =====================================
  'GET /admin/tickets': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      const db = new DatabaseService(env);
      const result = await db.findMany('tickets', {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'created_at DESC'
      });
      
      return jsonResponse({
        success: true,
        data: result.data,
        pagination: { page, limit, total: result.data.length }
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch tickets',
        error: error.message
      }, 500, request);
    }
  },

  'GET /admin/tickets/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.findById('tickets', id);
      
      if (!result.data) {
        return jsonResponse({
          success: false,
          message: 'Ticket not found'
        }, 404, request);
      }
      
      return jsonResponse({
        success: true,
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to fetch ticket',
        error: error.message
      }, 500, request);
    }
  },

  'POST /admin/tickets': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const data = await request.json();
      const db = new DatabaseService(env);
      
      const result = await db.create('tickets', {
        ...data,
        status: data.status || 'active',
        is_verified: false,
        created_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Ticket created successfully',
        data: result.data
      }, 201, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to create ticket',
        error: error.message
      }, 500, request);
    }
  },

  'PUT /admin/tickets/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      const data = await request.json();
      
      const db = new DatabaseService(env);
      const result = await db.update('tickets', id, {
        ...data,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Ticket updated successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to update ticket',
        error: error.message
      }, 500, request);
    }
  },

  'DELETE /admin/tickets/:id': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.delete('tickets', id);
      
      return jsonResponse({
        success: true,
        message: 'Ticket deleted successfully'
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to delete ticket',
        error: error.message
      }, 500, request);
    }
  },

  'PATCH /admin/tickets/:id/verify': async (request, env) => {
    try {
      const authResult = await verifyAdminAuth(request, env);
      if (!authResult.success) return authResult.response;
      
      const url = new URL(request.url);
      const id = url.pathname.split('/')[3];
      
      const db = new DatabaseService(env);
      const result = await db.update('tickets', id, {
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: authResult.user.email,
        updated_at: new Date().toISOString()
      });
      
      return jsonResponse({
        success: true,
        message: 'Ticket verified successfully',
        data: result.data
      }, 200, request);
    } catch (error) {
      return jsonResponse({
        success: false,
        message: 'Failed to verify ticket',
        error: error.message
      }, 500, request);
    }
  }
};

// ================================
// WORKER FETCH HANDLER
// ================================
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return handleOptions(request);
      }
      
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;
      const routeKey = `${method} ${path}`;
      
      // Dynamic route matching for IDs
      const dynamicRouteKey = Object.keys(routes).find(route => {
        const routePattern = route.replace(/:\w+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(routeKey);
      });
      
      const handler = routes[routeKey] || routes[dynamicRouteKey];
      
      if (handler) {
        return await handler(request, env);
      }
      
      return jsonResponse({
        success: false,
        message: 'Route not found',
        path,
        method,
        availableRoutes: Object.keys(routes)
      }, 404, request);
      
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({
        success: false,
        message: 'Internal server error',
        error: error.message
      }, 500, request);
    }
  }
};
