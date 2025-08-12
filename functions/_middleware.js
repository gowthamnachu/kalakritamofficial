export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Get the original response
    const response = await env.ASSETS.fetch(request);
    
    // Create new response with proper headers
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
    // Set correct MIME types based on file extension
    if (url.pathname.endsWith('.js')) {
      newResponse.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    } else if (url.pathname.endsWith('.mjs')) {
      newResponse.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    } else if (url.pathname.endsWith('.css')) {
      newResponse.headers.set('Content-Type', 'text/css; charset=utf-8');
    } else if (url.pathname.endsWith('.mp4')) {
      newResponse.headers.set('Content-Type', 'video/mp4');
      newResponse.headers.set('Accept-Ranges', 'bytes');
    }
    
    // Security headers
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return newResponse;
  },
};
