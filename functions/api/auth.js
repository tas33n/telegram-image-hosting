import { corsHeaders } from "../utils/middleware.js";

export async function onRequestPost(context) {
  const { env, request } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders()
    });
  }

  try {
    const { username, password } = await request.json();
    
    const isValid = username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD;
    
    if (isValid) {
      // Create a simple token (in production, use JWT or similar)
      const token = btoa(`${username}:${password}`);
      
      return new Response(JSON.stringify({ 
        success: true, 
        token: `Basic ${token}`,
        user: { username }
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid credentials' 
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Authentication failed' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  }
}