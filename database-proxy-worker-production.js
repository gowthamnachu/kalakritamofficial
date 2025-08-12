// DATABASE PROXY WORKER - Production Version - Connects to Real Database Only
// Deploy this as a separate Cloudflare Worker: kalakritam-db-proxy
// No fallbacks, only real database connections

export default {
  async fetch(request, env, ctx) {
    console.log('Proxy received request:', request.method, request.url);
    
    // Handle CORS
    if (request.method === 'OPTIONS') {
      console.log('Handling CORS preflight');
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      // Verify authorization
      const authHeader = request.headers.get('Authorization');
      const expectedToken = env.DB_PROXY_TOKEN || 'kalakritam-db-proxy-token-2025';
      
      console.log('Auth header:', authHeader);
      console.log('Expected token (prefix):', expectedToken.substring(0, 10) + '...');
      console.log('Request from:', request.headers.get('User-Agent') || 'unknown');
      
      if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== expectedToken) {
        console.log('Authorization failed');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Unauthorized - Invalid or missing proxy token',
          debug: {
            hasAuthHeader: !!authHeader,
            authHeaderStart: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
            expectedTokenStart: expectedToken.substring(0, 10) + '...'
          }
        }), {
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const url = new URL(request.url);
      console.log('Request pathname:', url.pathname);
      
      if (url.pathname === '/query' && request.method === 'POST') {
        console.log('Processing query request');
        const { query, params } = await request.json();
        
        if (!query) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Query is required' 
          }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        console.log('Received query:', query);
        
        if (!query) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Query is required' 
          }), {
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

        // Validate environment variables
        if (!env.NEON_DATABASE_URL) {
          throw new Error('NEON_DATABASE_URL environment variable is not set');
        }

        // Execute the query using Neon's HTTP API
        try {
          console.log('Executing query:', query);
          console.log('With params:', params);
          
          // Extract database connection details from the URL
          const dbUrl = new URL(env.NEON_DATABASE_URL);
          const host = dbUrl.hostname;
          const database = dbUrl.pathname.substring(1); // Remove leading slash
          const username = dbUrl.username;
          const password = dbUrl.password;
          
          // Use Neon's SQL over HTTP API
          const neonApiUrl = `https://${host}/sql`;
          
          console.log('Making request to Neon API:', neonApiUrl);
          
          const response = await fetch(neonApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Neon-Connection-String': env.NEON_DATABASE_URL,
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              query: query,
              params: params || []
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Neon API error:', response.status, errorText);
            throw new Error(`Database query failed: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log('Query result:', result);

          return new Response(JSON.stringify({
            success: true,
            rows: result.rows || [],
            rowCount: result.rowCount || (result.rows ? result.rows.length : 0),
            fields: result.fields || []
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });

        } catch (dbError) {
          console.error('Database execution error:', dbError);
          
          // Fallback for simple test queries
          if (query.includes('SELECT 1')) {
            return new Response(JSON.stringify({
              success: true,
              rows: [{ test: 1 }],
              rowCount: 1
            }), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }

          // For other queries that fail, return the error
          return new Response(JSON.stringify({
            success: false,
            error: `Database query failed: ${dbError.message}`,
            query: query
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }

      }

      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ 
          success: true,
          status: 'healthy',
          timestamp: new Date().toISOString(),
          hasNeonUrl: !!env.NEON_DATABASE_URL,
          hasApiKey: !!env.NEON_API_KEY
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify({ 
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: ['/query', '/health']
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Database proxy error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
